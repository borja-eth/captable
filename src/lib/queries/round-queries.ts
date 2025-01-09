import { eq } from "drizzle-orm";
import { db } from "@/database";
import { rounds } from "@/database/schema/rounds";
import type { DatabaseConnection } from "@/database";
import type { Round } from "@/lib/types/round-types";

/**
 * Maps database numeric values to proper types
 */
const mapRound = (result: typeof rounds.$inferSelect): Round => ({
    ...result,
    preMoneyValuation: Number(result.preMoneyValuation),
});

/**
 * Retrieves all rounds from the database
 */
export const listRoundsQuery = async (
    connection: DatabaseConnection = db,
): Promise<Round[]> => {
    const results = await connection.query.rounds.findMany({
        with: {
            company: {
                columns: {
                    name: true,
                },
            },
        },
        orderBy: (rounds, { desc }) => [desc(rounds.date)],
    });

    return results.map(mapRound);
};

/**
 * Retrieves all rounds for a specific company
 */
export const listRoundsByCompanyQuery = async (
    companyId: string,
    connection: DatabaseConnection = db,
): Promise<Round[]> => {
    const results = await connection.query.rounds.findMany({
        where: eq(rounds.companyId, companyId),
        orderBy: (rounds, { desc }) => [desc(rounds.date)],
    });

    return results.map(mapRound);
};

/**
 * Retrieves a round by its ID
 */
export const getRoundByIdQuery = async (
    id: string,
    connection: DatabaseConnection = db,
): Promise<Round | null> => {
    const result = await connection.query.rounds.findFirst({
        where: eq(rounds.id, id),
    });

    return result ? mapRound(result) : null;
};

/**
 * Creates a new round
 */
export const createRoundQuery = async (
    data: Omit<Round, "id" | "createdAt" | "updatedAt">,
    connection: DatabaseConnection = db,
): Promise<Round> => {
    const [result] = await connection
        .insert(rounds)
        .values({
            ...data,
            preMoneyValuation: data.preMoneyValuation.toString(),
        })
        .returning();

    return mapRound(result);
};

/**
 * Updates an existing round
 */
export const updateRoundQuery = async (
    id: string,
    data: Partial<Omit<Round, "id" | "createdAt" | "updatedAt">>,
    connection: DatabaseConnection = db,
): Promise<Round> => {
    const [result] = await connection
        .update(rounds)
        .set({
            ...data,
            preMoneyValuation: data.preMoneyValuation?.toString(),
        })
        .where(eq(rounds.id, id))
        .returning();

    return mapRound(result);
};

/**
 * Deletes a round by its ID
 */
export const deleteRoundQuery = async (
    id: string,
    connection: DatabaseConnection = db,
): Promise<Round> => {
    const [result] = await connection
        .delete(rounds)
        .where(eq(rounds.id, id))
        .returning();

    return mapRound(result);
};

/**
 * Checks if a round exists
 */
export const doesRoundExistQuery = async (
    id: string,
    connection: DatabaseConnection = db,
): Promise<boolean> => {
    const round = await connection.query.rounds.findFirst({
        where: eq(rounds.id, id),
        columns: {
            id: true,
        },
    });

    return !!round;
};

/**
 * Gets the latest active round for a company
 */
export const getLatestActiveRoundQuery = async (
    companyId: string,
    connection: DatabaseConnection = db,
): Promise<Round | null> => {
    const result = await connection.query.rounds.findFirst({
        where: eq(rounds.companyId, companyId),
        orderBy: (rounds, { desc }) => [desc(rounds.date)],
    });

    return result ? mapRound(result) : null;
};
