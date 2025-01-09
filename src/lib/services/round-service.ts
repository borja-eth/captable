import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import { Round } from "@/lib/types/round-types";
import {
    createRoundQuery,
    deleteRoundQuery,
    doesRoundExistQuery,
    getRoundByIdQuery,
    listRoundsByCompanyQuery,
    listRoundsQuery,
    updateRoundQuery,
} from "@/lib/queries/round-queries";
import { db } from "@/database";
import type { DatabaseConnection } from "@/database";

/**
 * Lists all rounds
 */
export const listRounds = async (connection: DatabaseConnection = db): Promise<Round[]> => {
    try {
        return await listRoundsQuery(connection);
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Lists all rounds for a specific company
 */
export const listRoundsByCompany = async (
    companyId: string,
    connection: DatabaseConnection = db
): Promise<Round[]> => {
    try {
        return await listRoundsByCompanyQuery(companyId, connection);
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Gets a round by its ID
 */
export const getRoundById = async (
    id: string,
    connection: DatabaseConnection = db
): Promise<Round> => {
    try {
        const round = await getRoundByIdQuery(id, connection);
        
        if (!round) {
            throw new ServerError(SERVER_ERRORS.NOT_FOUND);
        }
        
        return round;
    } catch (error) {
        if (error instanceof ServerError) throw error;
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Creates a new round
 */
export const createRound = async (
    data: Omit<Round, "id" | "createdAt" | "updatedAt">,
    connection: DatabaseConnection = db
): Promise<Round> => {
    try {
        return await createRoundQuery(data, connection);
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Updates an existing round
 */
export const updateRound = async (
    id: string,
    data: Partial<Omit<Round, "id" | "createdAt" | "updatedAt">>,
    connection: DatabaseConnection = db
): Promise<Round> => {
    
    try {
        const exists = await doesRoundExistQuery(id, connection);
        
        
        if (!exists) {
            throw new ServerError(SERVER_ERRORS.NOT_FOUND);
        }
        
        return await updateRoundQuery(id, data, connection);
    } catch (error) {
        if (error instanceof ServerError) throw error;
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};

/**
 * Deletes a round
 */
export const deleteRound = async (
    id: string,
    
    connection: DatabaseConnection = db
): Promise<Round> => {
    try {
        
        const exists = await doesRoundExistQuery(id, connection);
        
        if (!exists) {
            throw new ServerError(SERVER_ERRORS.NOT_FOUND);
        }
        
        return await deleteRoundQuery(id, connection);
    } catch (error) {
        if (error instanceof ServerError) throw error;
        throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
    }
};
