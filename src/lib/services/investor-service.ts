import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import type { Investor, CreateInvestorInput } from "@/lib/types/investor-types";
import { investorSchema } from "@/lib/schemas/investor-schemas";
import {
  createInvestorQuery,
  deleteInvestorQuery,
  doesInvestorExistQuery,
  getInvestorByIdQuery,
  listInvestorsQuery,
  updateInvestorQuery,
} from "@/lib/queries/investor-queries";
import type { DatabaseConnection } from "@/database";

/**
 * Lists all investors
 */
export const listInvestors = async ({
  connection,
}: {
  connection?: DatabaseConnection;
} = {}): Promise<Investor[]> => {
  try {
    return await listInvestorsQuery(connection);
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Gets an investor by ID
 */
export const getInvestorById = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Investor> => {
  try {
    const investor = await getInvestorByIdQuery({ id, connection });
    
    if (!investor) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    return investor;
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Creates a new investor
 */
export const createInvestor = async ({
  data,
  connection,
}: {
  data: CreateInvestorInput;
  connection?: DatabaseConnection;
}): Promise<Investor> => {
  try {
    // Validate input data
    const validatedData = investorSchema.parse(data);

    return await createInvestorQuery({
      data: validatedData,
      connection,
    });
  } catch (error) {
    console.error('Error creating investor:', error);
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Updates an existing investor
 */
export const updateInvestor = async ({
  id,
  data,
  connection,
}: {
  id: string;
  data: Partial<CreateInvestorInput>;
  connection?: DatabaseConnection;
}): Promise<Investor> => {
  try {
    // Check if investor exists
    const exists = await doesInvestorExistQuery({ id, connection });

    if (!exists) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    // Validate partial input data
    const validatedData = investorSchema.partial().parse(data);

    return await updateInvestorQuery({
      id,
      data: validatedData,
      connection,
    });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
};

/**
 * Deletes an investor
 */
export const deleteInvestor = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Investor> => {
  try {
    // Check if investor exists
    const exists = await doesInvestorExistQuery({ id, connection });

    if (!exists) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    return await deleteInvestorQuery({ id, connection });
  } catch (error) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }
}; 