import type { DatabaseConnection } from "@/database";
import {
    createStakeholderQuery,
    deleteStakeholderQuery,
    getStakeholderByIdQuery,
    listStakeholdersByCompanyQuery,
    listStakeholdersQuery,
    updateStakeholderQuery,
} from "@/lib/queries/stakeholder-queries";
import { SERVER_ERRORS, ServerError } from "@/lib/types/server-error";
import type { Stakeholder } from "@/lib/types/stakeholder-types";

/**
 * Lists all stakeholders
 */
export const listStakeholders = async (
    connection?: DatabaseConnection,
): Promise<Stakeholder[]> => {
    try {
        return await listStakeholdersQuery(connection);
    } catch (error) {
        console.error("Error listing stakeholders:", error);
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Lists stakeholders by company ID
 */
export const listStakeholdersByCompany = async ({
    companyId,
    connection,
}: {
    companyId: string;
    connection?: DatabaseConnection;
}): Promise<Stakeholder[]> => {
    try {
        return await listStakeholdersByCompanyQuery(companyId, connection);
    } catch (error) {
        console.error("Error listing stakeholders by company:", error);
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Gets a stakeholder by ID
 */
export const getStakeholderById = async ({
    id,
    connection,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Stakeholder> => {
    const stakeholder = await getStakeholderByIdQuery(id, connection);

    if (!stakeholder) {
        throw new ServerError(SERVER_ERRORS.NOT_FOUND);
    }

    return stakeholder;
};

/**
 * Creates a new stakeholder
 */
export const createStakeholder = async ({
    data,
    connection,
}: {
    data: Omit<Stakeholder, "id" | "createdAt" | "updatedAt">;
    connection?: DatabaseConnection;
}): Promise<Stakeholder> => {
    try {
        return await createStakeholderQuery(data, connection);
    } catch (error) {
        console.error("Error creating stakeholder:", error);
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Updates a stakeholder
 */
export const updateStakeholder = async ({
    id,
    data,
    connection,
}: {
    id: string;
    data: Partial<Omit<Stakeholder, "id" | "createdAt" | "updatedAt">>;
    connection?: DatabaseConnection;
}): Promise<Stakeholder> => {
    try {
        return await updateStakeholderQuery(id, data, connection);
    } catch (error) {
        console.error("Error updating stakeholder:", error);
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Deletes a stakeholder
 */
export const deleteStakeholder = async ({
    id,
    connection,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Stakeholder> => {
    try {
        return await deleteStakeholderQuery(id, connection);
    } catch (error) {
        console.error("Error deleting stakeholder:", error);
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};
