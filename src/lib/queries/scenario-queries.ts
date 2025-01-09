import { and, eq } from "drizzle-orm";
import { db } from "@/database";
import { scenarios } from "@/database/schema/scenarios";
import type { DatabaseConnection } from "@/database";
import type { SimpleScenarioInput, SimpleScenarioResult } from "../types/scenario-types";
import { nanoid } from "nanoid";

export const createScenarioQuery = async ({
    companyId,
    newInvestment,
    premoneyValuation,
    result,
    userId,
}: SimpleScenarioInput & {
    result: SimpleScenarioResult;
    userId: string;
}, connection: DatabaseConnection = db) => {
    const [scenario] = await connection
        .insert(scenarios)
        .values({
            id: nanoid(),
            companyId,
            newInvestment: newInvestment.toString(),
            premoneyValuation: premoneyValuation.toString(),
            result,
            createdBy: userId,
        })
        .returning();

    return scenario;
};

export const listScenariosQuery = async (
    companyId: string,
    connection: DatabaseConnection = db,
) => {
    return connection
        .select()
        .from(scenarios)
        .where(eq(scenarios.companyId, companyId))
        .orderBy(scenarios.createdAt);
};

export const getScenarioQuery = async (
    id: string,
    connection: DatabaseConnection = db,
) => {
    const [scenario] = await connection
        .select()
        .from(scenarios)
        .where(eq(scenarios.id, id));

    return scenario;
};

export const getScenarioByCompanyQuery = async (
    id: string,
    companyId: string,
    connection: DatabaseConnection = db,
) => {
    const [scenario] = await connection
        .select()
        .from(scenarios)
        .where(
            and(
                eq(scenarios.id, id),
                eq(scenarios.companyId, companyId),
            ),
        );

    return scenario;
};

export const deleteScenarioQuery = async (id: string, connection: DatabaseConnection = db) => {
    await connection.delete(scenarios).where(eq(scenarios.id, id));
    
    return { success: true };
}; 