import type { SimpleScenarioInput, SimpleScenarioResult } from "../types/scenario-types";
import {
    createScenarioQuery,
    getScenarioByCompanyQuery,
    getScenarioQuery,
    listScenariosQuery,
    deleteScenarioQuery,
} from "../queries/scenario-queries";

export const createScenario = async ({
    companyId,
    newInvestment,
    premoneyValuation,
    result,
    userId,
}: SimpleScenarioInput & {
    result: SimpleScenarioResult;
    userId: string;
}) => {
    try {
        return await createScenarioQuery({
            companyId,
            newInvestment,
            premoneyValuation,
            result,
            userId,
        });
    } catch (error) {
        throw new Error("Failed to create scenario");
    }
};

export const listScenarios = async (companyId: string) => {
    try {
        return await listScenariosQuery(companyId);
    } catch (error) {
        throw new Error("Failed to list scenarios");
    }
};

export const getScenario = async (id: string) => {
    try {
        const scenario = await getScenarioQuery(id);

        if (!scenario) {
            throw new Error("Scenario not found");
        }

        return scenario;
    } catch (error) {
        throw new Error("Failed to get scenario");
    }
};

export const getScenarioByCompany = async (id: string, companyId: string) => {
    try {
        const scenario = await getScenarioByCompanyQuery(id, companyId);

        if (!scenario) {
            throw new Error("Scenario not found");
        }

        return scenario;
    } catch (error) {
        throw new Error("Failed to get scenario");
    }
};

export const deleteScenario = async (id: string) => {
    try {
        return await deleteScenarioQuery(id);
    } catch (error) {
        throw new Error("Failed to delete scenario");
    }
}; 