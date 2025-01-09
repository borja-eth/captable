import { eq } from "drizzle-orm";
import { db } from "@/database";
import type { DatabaseConnection } from "@/database";
import { stakeholders } from "@/database/schema";
import type { Stakeholder } from "@/lib/types/stakeholder-types";

export const listStakeholdersQuery = async (
    connection: DatabaseConnection = db,
): Promise<Stakeholder[]> => {
    return await connection.query.stakeholders.findMany({
        orderBy: stakeholders.name,
    });
};

export const listStakeholdersByCompanyQuery = async (
    companyId: string,
    connection: DatabaseConnection = db,
): Promise<Stakeholder[]> => {
    const results = await connection.query.stakeholders.findMany({
        where: eq(stakeholders.companyId, companyId),
        orderBy: stakeholders.name,
    });

    return results;
};

export const getStakeholderByIdQuery = async (
    id: string,
    connection: DatabaseConnection = db,
): Promise<Stakeholder | undefined> => {
    const result = await connection.query.stakeholders.findFirst({
        where: eq(stakeholders.id, id),
    });

    return result || undefined;
};

export const createStakeholderQuery = async (
    stakeholder: Omit<Stakeholder, "id" | "createdAt" | "updatedAt">,
    connection: DatabaseConnection = db,
): Promise<Stakeholder> => {
    const [result] = await connection
        .insert(stakeholders)
        .values(stakeholder)
        .returning();

    return result;
};

export const updateStakeholderQuery = async (
    id: string,
    stakeholder: Partial<Omit<Stakeholder, "id" | "createdAt" | "updatedAt">>,
    connection: DatabaseConnection = db,
): Promise<Stakeholder> => {
    const [result] = await connection
        .update(stakeholders)
        .set({
            ...stakeholder,
            updatedAt: new Date(),
        })
        .where(eq(stakeholders.id, id))
        .returning();

    return result;
};

export const deleteStakeholderQuery = async (
    id: string,
    connection: DatabaseConnection = db,
): Promise<Stakeholder> => {
    const [result] = await connection
        .delete(stakeholders)
        .where(eq(stakeholders.id, id))
        .returning();

    return result;
};
