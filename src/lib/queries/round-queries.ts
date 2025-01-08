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
  connection: DatabaseConnection = db
): Promise<Round[]> => {
  const results = await connection.query.rounds.findMany({
    orderBy: (rounds, { desc }) => [desc(rounds.date)]  });

  return results.map(mapRound);
};

/**
 * Retrieves all rounds for a specific company
 */
export const listRoundsByCompanyQuery = async ({
  companyId,
  connection = db,
}: {
  companyId: string;
  connection?: DatabaseConnection;
}): Promise<Round[]> => {
  const results = await connection.query.rounds.findMany({
    where: eq(rounds.companyId, companyId),
    orderBy: (rounds, { desc }) => [desc(rounds.date)]  });

  return results.map(mapRound);
};

/**
 * Retrieves a round by its ID
 */
export const getRoundByIdQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Round | null> => {
  const result = await connection.query.rounds.findFirst({
    where: eq(rounds.id, id),
  });

  return result ? mapRound(result) : null;
};

/**
 * Creates a new round
 */
export const createRoundQuery = async ({
  data,
  connection = db,
}: {
  data: Omit<Round, "id" | "createdAt" | "updatedAt">;
  connection?: DatabaseConnection;
}): Promise<Round> => {
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
export const updateRoundQuery = async ({
  id,
  data,
  connection = db,
}: {
  id: string;
  data: Partial<Omit<Round, "id" | "createdAt" | "updatedAt">>;
  connection?: DatabaseConnection;
}): Promise<Round> => {
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
export const deleteRoundQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Round> => {
  const [result] = await connection
    .delete(rounds)
    .where(eq(rounds.id, id))
    .returning();

  return mapRound(result);
};

/**
 * Checks if a round exists
 */
export const doesRoundExistQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<boolean> => {
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
export const getLatestActiveRoundQuery = async ({
  companyId,
  connection = db,
}: {
  companyId: string;
  connection?: DatabaseConnection;
}): Promise<Round | null> => {
  const result = await connection.query.rounds.findFirst({
    where: eq(rounds.companyId, companyId),
    orderBy: (rounds, { desc }) => [desc(rounds.date)]  });

  return result ? mapRound(result) : null;
}; 