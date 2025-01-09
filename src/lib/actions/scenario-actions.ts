"use server";
import { z } from "zod";
import { simpleScenarioSchema } from "../schemas/scenario-schemas";
import { getCompanyById } from "../services/company-service";
import { listInstrumentsByCompany } from "../services/instrument-service";
import {
    createScenario,
    deleteScenario,
    getScenario,
    getScenarioByCompany,
    listScenarios,
} from "../services/scenario-service";
import { listStakeholdersByCompany } from "../services/stakeholder-service";
import { Permissions } from "../types/permission-types";
import type { SimpleScenarioInvestorResult, SimpleScenarioResult, SimpleScenarioStakeholderResult } from "../types/scenario-types";
import { SERVER_ERRORS, ServerError } from "../types/server-error";
import { authAction } from "./base/action-clients";

export const createScenarioAction = authAction
    .metadata({
        permissions: [Permissions.SCENARIO_CREATE],
    })
    .schema(simpleScenarioSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            if (!ctx.user?.id) {
                throw new ServerError(SERVER_ERRORS.UNAUTHORIZED);
            }

            // Get company data to calculate shares and dilution
            const company = await getCompanyById({ id: parsedInput.companyId });
            
            if (!company) {
                throw new ServerError(SERVER_ERRORS.NOT_FOUND);
            }

            // Get current stakeholders to calculate ownership changes
            const stakeholders = await listStakeholdersByCompany({ companyId: parsedInput.companyId });
            
            // Get all instruments (SAFEs and Notes) for conversion calculation
            const instruments = await listInstrumentsByCompany({ companyId: parsedInput.companyId });
            
            // Calculate share price based on pre-money valuation
            const premoneyValuation = Number(parsedInput.premoneyValuation);
            const newInvestment = Number(parsedInput.newInvestment);
            const totalExistingShares = company.shares;
            
            // Price per share = pre-money valuation / total existing shares
            const newSharePrice = premoneyValuation / totalExistingShares;
            
            // Number of new shares = new investment amount / price per share
            const newShares = newInvestment / newSharePrice;
            
            // Calculate post-money valuation
            const postmoneyValuation = premoneyValuation + newInvestment;
            
            // Calculate total shares after investment (before SAFE/Note conversion)
            const totalSharesAfterInvestment = totalExistingShares + newShares;

            // Calculate SAFE and Note conversions
            const convertedInstruments = instruments
                .filter((instrument) => instrument.type === "SAFE" || instrument.type === "CONVERTIBLE_NOTE")
                .map(instrument => {
                    if (instrument.type === "SAFE") {
                        if (!instrument.valuationCap) return null;

                        // Calculate ownership percentage at cap
                        const amount = Number(instrument.amount);
                        const valuationCap = Number(instrument.valuationCap);
                        // Calculate shares based on pre-money ownership
                        const ownershipAtCap = amount / valuationCap;
                        let shares = (ownershipAtCap * totalExistingShares) / (1 - ownershipAtCap);
                        
                        // Apply discount if any by increasing shares
                        const discountRate = instrument.discountRate ? Number(instrument.discountRate) : 0;
                        
                        if (discountRate > 0) {
                            shares = shares * (1 / (1 - discountRate / 100));
                        }

                        return {
                            investorId: instrument.investorId,
                            name: "SAFE Holder",
                            currentShares: 0,
                            currentOwnership: 0,
                            newOwnership: (shares / totalSharesAfterInvestment) * 100,
                            dilution: 0,
                            currentValue: 0,
                            newValue: shares * newSharePrice,
                            totalShares: shares,
                        };
                    }

                    if (instrument.type === "CONVERTIBLE_NOTE") {
                        if (!instrument.conversionCap) return null;

                        const amount = Number(instrument.amount);
                        const interestRate = instrument.interestRate ? Number(instrument.interestRate) : 0;
                        const conversionCap = Number(instrument.conversionCap);
                        
                        const totalAmount = amount + (amount * interestRate / 100);
                        // Calculate shares based on pre-money ownership
                        const ownershipAtCap = totalAmount / conversionCap;
                        let shares = (ownershipAtCap * totalExistingShares) / (1 - ownershipAtCap);

                        const discountRate = instrument.discountRate ? Number(instrument.discountRate) : 0;
                        
                        if (discountRate > 0) {
                            shares = shares * (1 / (1 - discountRate / 100));
                        }

                        return {
                            investorId: instrument.investorId,
                            name: "Note Holder",
                            currentShares: 0,
                            currentOwnership: 0,
                            newOwnership: (shares / totalSharesAfterInvestment) * 100,
                            dilution: 0,
                            currentValue: 0,
                            newValue: shares * newSharePrice,
                            totalShares: shares,
                        };
                    }

                    return null;
                })
                .filter((instrument): instrument is SimpleScenarioInvestorResult => instrument !== null);
            
            // Calculate dilution percentage including SAFE/Note conversions
            const totalConvertedShares = convertedInstruments.reduce((sum, instrument) => sum + instrument.totalShares, 0);
            const finalTotalShares = totalSharesAfterInvestment + totalConvertedShares;
            const totalNewShares = newShares + totalConvertedShares;
            // Calculate dilution as the percentage increase in total shares
            const dilution = ((finalTotalShares - totalExistingShares) / totalExistingShares) * 100;

            // Calculate updated stakeholder ownership
            const updatedStakeholders: SimpleScenarioStakeholderResult[] = stakeholders.map(stakeholder => {
                const currentShares = stakeholder.sharesGranted;
                const currentOwnership = (currentShares / totalExistingShares) * 100;
                const newOwnership = (currentShares / finalTotalShares) * 100;
                
                return {
                    stakeholderId: stakeholder.id,
                    name: stakeholder.name,
                    currentShares,
                    currentOwnership,
                    newOwnership,
                    dilution: currentOwnership - newOwnership,
                    totalShares: currentShares,
                };
            });

            // Create new investor entry for the scenario
            const newInvestor: SimpleScenarioInvestorResult = {
                investorId: "new-investor",
                name: "New Investor",
                currentShares: 0,
                currentOwnership: 0,
                // Calculate ownership based on pre-money valuation
                newOwnership: (newInvestment / premoneyValuation) * 100,
                dilution: 0,
                currentValue: 0,
                newValue: newInvestment,
                totalShares: newShares,
            };

            const result: SimpleScenarioResult = {
                postmoneyValuation,
                newSharePrice,
                newShares: totalNewShares,
                dilution,
                stakeholders: updatedStakeholders,
                investors: [newInvestor, ...convertedInstruments],
            };

            return await createScenario({
                companyId: parsedInput.companyId,
                newInvestment,
                premoneyValuation,
                result,
                userId: ctx.user.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
            }
            throw error;
        }
    });

export const listScenariosAction = authAction
    .metadata({
        permissions: [Permissions.SCENARIO_LIST],
    })
    .schema(z.object({
        companyId: z.string(),
    }))
    .action(async ({ parsedInput }) => {
        try {
            return await listScenarios(parsedInput.companyId);
        } catch (error) {
            if (error instanceof Error) {
                throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
            }
            throw error;
        }
    });

export const getScenarioAction = authAction
    .metadata({
        permissions: [Permissions.SCENARIO_READ],
    })
    .schema(z.object({
        id: z.string(),
    }))
    .action(async ({ parsedInput }) => {
        try {
            return await getScenario(parsedInput.id);
        } catch (error) {
            if (error instanceof Error) {
                throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
            }
            throw error;
        }
    });

export const getScenarioByCompanyAction = authAction
    .metadata({
        permissions: [Permissions.SCENARIO_READ],
    })
    .schema(z.object({
        id: z.string(),
        companyId: z.string(),
    }))
    .action(async ({ parsedInput }) => {
        try {
            return await getScenarioByCompany(parsedInput.id, parsedInput.companyId);
        } catch (error) {
            if (error instanceof Error) {
                throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
            }
            throw error;
        }
    });

export const deleteScenarioAction = authAction
    .metadata({
        permissions: [Permissions.SCENARIO_DELETE],
    })
    .schema(z.object({
        id: z.string({
            required_error: "Scenario ID is required",
            invalid_type_error: "Scenario ID must be a string",
        }).min(1, "Scenario ID is required"),
    }))
    .action(async ({ parsedInput }) => {
        try {
            return await deleteScenario(parsedInput.id);
        } catch (error) {
            if (error instanceof Error) {
                throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
            }
            throw error;
        }
    }); 