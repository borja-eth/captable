import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import type { Round, CreateRoundInput } from "@/lib/types/round-types";
import { roundSchema } from "@/lib/schemas/round-schemas";
import {
  createRoundQuery,
  deleteRoundQuery,
  doesRoundExistQuery,
  getRoundByIdQuery,
  listRoundsByCompanyQuery,
  updateRoundQuery,
} from "@/lib/queries/round-queries";
import type { DatabaseConnection } from "@/database";

/**
 * Lists all rounds for a company
 */
export const listRoundsByCompany = async ({
  companyId,
  connection,
}: {
  companyId: string;
  connection?: DatabaseConnection;
}): Promise<Round[]> => {
  try {
    return await listRoundsByCompanyQuery({ companyId, connection });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Gets a round by ID
 */
export const getRoundById = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Round> => {
  try {
    const round = await getRoundByIdQuery({ id, connection });
    
    if (!round) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    return round;
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Creates a new round
 */
export const createRound = async ({
  data,
  connection,
}: {
  data: CreateRoundInput;
  connection?: DatabaseConnection;
}): Promise<Round> => {
  try {
    // Validate input data
    const validatedData = roundSchema.parse(data);

    return await createRoundQuery({
      data: validatedData,
      connection,
    });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Updates an existing round
 */
export const updateRound = async ({
  id,
  data,
  connection,
}: {
  id: string;
  data: Partial<CreateRoundInput>;
  connection?: DatabaseConnection;
}): Promise<Round> => {
  try {
    // Check if round exists
    const exists = await doesRoundExistQuery({ id, connection });

    if (!exists) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    // Validate partial input data
    const validatedData = roundSchema.partial().parse(data);

    return await updateRoundQuery({
      id,
      data: validatedData,
      connection,
    });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Deletes a round
 */
export const deleteRound = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Round> => {
  try {
    // Check if round exists
    const exists = await doesRoundExistQuery({ id, connection });

    if (!exists) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    return await deleteRoundQuery({ id, connection });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
}; 