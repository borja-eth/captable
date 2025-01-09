import type { z } from "zod";
import type { simpleScenarioSchema } from "@/lib/schemas/scenario-schemas";

export interface SimpleScenarioInput {
    companyId: string;
    newInvestment: number;
    premoneyValuation: number;
}

export type SimpleScenarioFormData = z.infer<typeof simpleScenarioSchema>;

export interface SimpleScenarioResult {
    newSharePrice: number;
    newShares: number;
    postmoneyValuation: number;
    dilution: number;
    stakeholders: SimpleScenarioStakeholderResult[];
    investors: SimpleScenarioInvestorResult[];
}

export interface SimpleScenarioStakeholderResult {
    stakeholderId: string;
    name: string;
    currentShares: number;
    currentOwnership: number;
    newOwnership: number;
    dilution: number;
    totalShares: number;
}

export interface SimpleScenarioInvestorResult {
    investorId: string;
    name: string;
    currentShares: number;
    currentOwnership: number;
    newOwnership: number;
    dilution: number;
    currentValue: number;
    newValue: number;
    totalShares: number;
}

export interface SimpleScenarioError {
    code: 'INVALID_INPUT' | 'CALCULATION_ERROR' | 'NOT_FOUND';
    message: string;
}

export interface Scenario {
    id: string;
    companyId: string;
    newInvestment: string;
    premoneyValuation: string;
    result: SimpleScenarioResult;
    createdAt: Date;
    createdBy: string;
} 