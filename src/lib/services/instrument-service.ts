import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import type {
    Instrument,
    CreateInstrumentInput,
} from "@/lib/types/instrument-types";
import { instrumentSchema } from "@/lib/schemas/instrument-schemas";
import {
    createInstrumentQuery,
    deleteInstrumentQuery,
    doesInstrumentExistQuery,
    getInstrumentByIdQuery,
    listInstrumentsByRoundQuery,
    listInstrumentsByInvestorQuery,
    updateInstrumentQuery,
    listInstrumentsByCompanyQuery,
} from "@/lib/queries/instrument-queries";
import type { DatabaseConnection } from "@/database";

/**
 * Lists all instruments for a round
 */
export const listInstrumentsByRound = async ({
    roundId,
    connection,
}: {
    roundId: string;
    connection?: DatabaseConnection;
}): Promise<Instrument[]> => {
    try {
        return await listInstrumentsByRoundQuery({ roundId, connection });
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Lists all instruments for an investor
 */
export const listInstrumentsByInvestor = async ({
    investorId,
    connection,
}: {
    investorId: string;
    connection?: DatabaseConnection;
}): Promise<Instrument[]> => {
    try {
        return await listInstrumentsByInvestorQuery({ investorId, connection });
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Gets an instrument by ID
 */
export const getInstrumentById = async ({
    id,
    connection,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Instrument> => {
    try {
        const instrument = await getInstrumentByIdQuery({ id, connection });

        if (!instrument) {
            throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
        }

        return instrument;
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Creates a new instrument
 */
export const createInstrument = async ({
    data,
    connection,
}: {
    data: CreateInstrumentInput;
    connection?: DatabaseConnection;
}): Promise<Instrument> => {
    try {
        // Validate input data based on instrument type
        const validatedData = instrumentSchema.parse(data);

        return await createInstrumentQuery({
            data: validatedData,
            connection,
        });
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Updates an existing instrument
 */
export const updateInstrument = async ({
    id,
    data,
    connection,
}: {
    id: string;
    data: Partial<CreateInstrumentInput>;
    connection?: DatabaseConnection;
}): Promise<Instrument> => {
    try {
        // Check if instrument exists
        const exists = await doesInstrumentExistQuery({ id, connection });

        if (!exists) {
            throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
        }

        // Get the existing instrument to know its type
        const existingInstrument = await getInstrumentByIdQuery({
            id,
            connection,
        });

        if (!existingInstrument) {
            throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
        }

        // Merge existing data with updates
        const mergedData = {
            ...existingInstrument,
            ...data,
            type: existingInstrument.type, // Ensure type cannot be changed
        };

        // Validate the complete merged data
        const validatedData = instrumentSchema.parse(mergedData);

        return await updateInstrumentQuery({
            id,
            data: validatedData,
            connection,
        });
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Deletes an instrument
 */
export const deleteInstrument = async ({
    id,
    connection,
}: {
    id: string;
    connection?: DatabaseConnection;
}): Promise<Instrument> => {
    try {
        // Check if instrument exists
        const exists = await doesInstrumentExistQuery({ id, connection });

        if (!exists) {
            throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
        }

        return await deleteInstrumentQuery({ id, connection });
    } catch (error) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
};

/**
 * Lists all instruments for a company
 */
export const listInstrumentsByCompany = async ({ companyId }: { companyId: string }) => {
    try {
        return await listInstrumentsByCompanyQuery(companyId);
    } catch (error) {
        throw new Error("Failed to list instruments by company");
    }
};
