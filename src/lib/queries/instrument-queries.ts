import { eq } from "drizzle-orm";
import { db } from "@/database";
import { instruments } from "@/database/schema";
import type { DatabaseConnection } from "@/database";
import type { 
  Instrument, 
  EquityInstrument, 
  SafeInstrument, 
  ConvertibleNoteInstrument 
} from "@/lib/types/instrument-types";

/**
 * Converts DB string values to proper TypeScript types
 */
const mapInstrument = (result: typeof instruments.$inferSelect): Instrument => {
  const baseInstrument = {
    id: result.id,
    roundId: result.roundId,
    investorId: result.investorId,
    type: result.type,
    amount: Number(result.amount),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };

  switch (result.type) {
    case "EQUITY":
      return {
        ...baseInstrument,
        sharePrice: Number(result.sharePrice),
        shareCount: Number(result.shareCount),
        shareClass: result.shareClass!,
      } as EquityInstrument;
    case "SAFE":
      return {
        ...baseInstrument,
        valuationCap: Number(result.valuationCap),
        discountRate: Number(result.discountRate),
      } as SafeInstrument;
    case "CONVERTIBLE_NOTE":
      return {
        ...baseInstrument,
        interestRate: Number(result.interestRate),
        maturityDate: new Date(result.maturityDate!),
        conversionCap: Number(result.conversionCap),
        discountRate: Number(result.discountRate),
      } as ConvertibleNoteInstrument;
  }
};

/**
 * Converts TypeScript types to DB string values for insert/update
 */
const prepareInstrumentForDb = (data: Omit<Instrument, "id" | "createdAt" | "updatedAt">) => {
  // Required base fields
  const baseValues = {
    type: data.type,
    roundId: data.roundId,
    investorId: data.investorId,
    amount: data.amount.toString(),
  };

  switch (data.type) {
    case "EQUITY": {
      const equity = data as EquityInstrument;

      return {
        ...baseValues,
        sharePrice: equity.sharePrice.toString(),
        shareCount: equity.shareCount.toString(),
        shareClass: equity.shareClass,
      };
    }
    case "SAFE": {
      const safe = data as SafeInstrument;

      return {
        ...baseValues,
        valuationCap: safe.valuationCap.toString(),
        discountRate: safe.discountRate.toString(),
      };
    }
    case "CONVERTIBLE_NOTE": {
      const note = data as ConvertibleNoteInstrument;

      return {
        ...baseValues,
        interestRate: note.interestRate.toString(),
        maturityDate: note.maturityDate.toISOString(),
        conversionCap: note.conversionCap.toString(),
        discountRate: note.discountRate.toString(),
      };
    }
  }
};

/**
 * Prepares partial instrument data for DB update
 */
const prepareInstrumentUpdateForDb = (data: Partial<Omit<Instrument, "id" | "createdAt" | "updatedAt">>) => {
  const updateValues: Record<string, unknown> = {};

  if (data.amount !== undefined) {
    updateValues.amount = data.amount.toString();
  }

  if (!data.type) return updateValues;

  switch (data.type) {
    case "EQUITY": {
      const equity = data as Partial<EquityInstrument>;

      if (equity.sharePrice !== undefined) {
        updateValues.sharePrice = equity.sharePrice.toString();
      }

      if (equity.shareCount !== undefined) {
        updateValues.shareCount = equity.shareCount.toString();
      }

      if (equity.shareClass) {
        updateValues.shareClass = equity.shareClass;
      }
      break;
    }
    case "SAFE": {
      const safe = data as Partial<SafeInstrument>;

      if (safe.valuationCap !== undefined) {
        updateValues.valuationCap = safe.valuationCap.toString();
      }

      if (safe.discountRate !== undefined) {
        updateValues.discountRate = safe.discountRate.toString();
      }
      break;
    }
    case "CONVERTIBLE_NOTE": {
      const note = data as Partial<ConvertibleNoteInstrument>;

      if (note.interestRate !== undefined) {
        updateValues.interestRate = note.interestRate.toString();
      }

      if (note.maturityDate) {
        updateValues.maturityDate = note.maturityDate.toISOString();
      }

      if (note.conversionCap !== undefined) {
        updateValues.conversionCap = note.conversionCap.toString();
      }

      if (note.discountRate !== undefined) {
        updateValues.discountRate = note.discountRate.toString();
      }
      break;
    }
  }

  return updateValues;
};

/**
 * Retrieves all instruments from the database
 */
export const listInstrumentsQuery = async (
  connection: DatabaseConnection = db
): Promise<Instrument[]> => {
  const results = await connection.query.instruments.findMany({
    orderBy: (instruments, { desc }) => [desc(instruments.createdAt)]
  });

  return results.map(mapInstrument);
};

/**
 * Retrieves all instruments for a specific round
 */
export const listInstrumentsByRoundQuery = async ({
  roundId,
  connection = db,
}: {
  roundId: string;
  connection?: DatabaseConnection;
}): Promise<Instrument[]> => {
  const results = await connection.query.instruments.findMany({
    where: eq(instruments.roundId, roundId),
    orderBy: (instruments, { desc }) => [desc(instruments.createdAt)]
  });

  return results.map(mapInstrument);
};

/**
 * Retrieves all instruments for a specific investor
 */
export const listInstrumentsByInvestorQuery = async ({
  investorId,
  connection = db,
}: {
  investorId: string;
  connection?: DatabaseConnection;
}): Promise<Instrument[]> => {
  const results = await connection.query.instruments.findMany({
    where: eq(instruments.investorId, investorId),
    orderBy: (instruments, { desc }) => [desc(instruments.createdAt)]
  });

  return results.map(mapInstrument);
};

/**
 * Retrieves an instrument by its ID
 */
export const getInstrumentByIdQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Instrument | null> => {
  const result = await connection.query.instruments.findFirst({
    where: eq(instruments.id, id),
  });

  return result ? mapInstrument(result) : null;
};

/**
 * Creates a new instrument
 */
export const createInstrumentQuery = async ({
  data,
  connection = db,
}: {
  data: Omit<Instrument, "id" | "createdAt" | "updatedAt">;
  connection?: DatabaseConnection;
}): Promise<Instrument> => {
  const dbValues = prepareInstrumentForDb(data);
  const [result] = await connection
    .insert(instruments)
    .values(dbValues)
    .returning();

  return mapInstrument(result);
};

/**
 * Updates an existing instrument
 */
export const updateInstrumentQuery = async ({
  id,
  data,
  connection = db,
}: {
  id: string;
  data: Partial<Omit<Instrument, "id" | "createdAt" | "updatedAt">>;
  connection?: DatabaseConnection;
}): Promise<Instrument> => {
  const dbValues = prepareInstrumentUpdateForDb(data);
  const [result] = await connection
    .update(instruments)
    .set(dbValues)
    .where(eq(instruments.id, id))
    .returning();

  return mapInstrument(result);
};

/**
 * Deletes an instrument by its ID
 */
export const deleteInstrumentQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Instrument> => {
  const [result] = await connection
    .delete(instruments)
    .where(eq(instruments.id, id))
    .returning();

  return mapInstrument(result);
};

/**
 * Checks if an instrument exists
 */
export const doesInstrumentExistQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<boolean> => {
  const instrument = await connection.query.instruments.findFirst({
    where: eq(instruments.id, id),
    columns: {
      id: true,
    },
  });

  return !!instrument;
}; 