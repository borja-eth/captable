import { eq } from "drizzle-orm";
import { db } from "@/database";
import { investors } from "@/database/schema/investors";
import type { DatabaseConnection } from "@/database";
import type { Investor } from "@/lib/types/investor-types";

/**
 * Retrieves all investors from the database
 */
export const listInvestorsQuery = async (
    connection: DatabaseConnection = db,
): Promise<Investor[]> => {
    const results = await connection.query.investors.findMany({
        orderBy: (investors, { desc }) => [desc(investors.createdAt)],
    });

    return results.map((investor: typeof investors.$inferSelect) => ({
        ...investor,
        phone: investor.phone ?? undefined,
        address: investor.address ?? undefined,
    }));
};

/**
 * Retrieves an investor by their ID
 */
export const getInvestorByIdQuery = async ({
    id,
    connection = db,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Investor | null> => {
    const result = await connection.query.investors.findFirst({
        where: eq(investors.id, id),
    });

    if (!result) return null;

    return {
        ...result,
        phone: result.phone ?? undefined,
        address: result.address ?? undefined,
    };
};

/**
 * Creates a new investor
 */
export const createInvestorQuery = async ({
    data,
    connection = db,
}: {
    data: Omit<Investor, "id" | "createdAt" | "updatedAt">;
    connection?: DatabaseConnection;
}): Promise<Investor> => {
    const [result] = await connection
        .insert(investors)
        .values({
            ...data,
            phone: data.phone ?? null,
            address: data.address ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return {
        ...result,
        phone: result.phone ?? undefined,
        address: result.address ?? undefined,
    };
};

/**
 * Updates an existing investor
 */
export const updateInvestorQuery = async ({
    id,
    data,
    connection = db,
}: {
    id: string;
    data: Partial<Omit<Investor, "id" | "createdAt" | "updatedAt">>;
    connection?: DatabaseConnection;
}): Promise<Investor> => {
    const [result] = await connection
        .update(investors)
        .set({
            ...data,
            phone: data.phone ?? null,
            address: data.address ?? null,
            updatedAt: new Date(),
        })
        .where(eq(investors.id, id))
        .returning();

    return {
        ...result,
        phone: result.phone ?? undefined,
        address: result.address ?? undefined,
    };
};

/**
 * Deletes an investor by their ID
 */
export const deleteInvestorQuery = async ({
    id,
    connection = db,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Investor> => {
    const [result] = await connection
        .delete(investors)
        .where(eq(investors.id, id))
        .returning();

    return {
        ...result,
        phone: result.phone ?? undefined,
        address: result.address ?? undefined,
    };
};

/**
 * Checks if an investor exists by ID
 */
export const doesInvestorExistQuery = async ({
    id,
    connection = db,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<boolean> => {
    const investor = await connection.query.investors.findFirst({
        where: eq(investors.id, id),
        columns: {
            id: true,
        },
    });

    return !!investor;
};

/**
 * Checks if an investor exists by email
 */
export const doesInvestorExistByEmailQuery = async ({
    email,
    connection = db,
}: {
    email: string;
    connection?: DatabaseConnection;
}): Promise<boolean> => {
    const investor = await connection.query.investors.findFirst({
        where: eq(investors.email, email),
        columns: {
            id: true,
        },
    });

    return !!investor;
};
