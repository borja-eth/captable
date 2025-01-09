"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { Permissions } from "@/lib/types/permission-types";
import { z } from "zod";
import { instrumentSchema } from "@/lib/schemas/instrument-schemas";
import {
    listInstrumentsByRound,
    listInstrumentsByInvestor,
    getInstrumentById,
    createInstrument,
    updateInstrument,
    deleteInstrument,
} from "@/lib/services/instrument-service";

export const listInstrumentsByRoundAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_READ],
    })
    .schema(z.object({ roundId: z.string() }))
    .action(async ({ parsedInput }) => {
        return await listInstrumentsByRound({ roundId: parsedInput.roundId });
    });

export const listInstrumentsByInvestorAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_READ],
    })
    .schema(z.object({ investorId: z.string() }))
    .action(async ({ parsedInput }) => {
        return await listInstrumentsByInvestor({
            investorId: parsedInput.investorId,
        });
    });

export const getInstrumentByIdAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_READ],
    })
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput }) => {
        return await getInstrumentById({ id: parsedInput.id });
    });

export const createInstrumentAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_CREATE],
    })
    .schema(instrumentSchema)
    .action(async ({ parsedInput }) => {
        return await createInstrument({ data: parsedInput });
    });

export const updateInstrumentAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_UPDATE],
    })
    .schema(
        z.object({
            id: z.string(),
            data: z.object({
                roundId: z.string().optional(),
                investorId: z.string().optional(),
                amount: z.number().optional(),
                // Type-specific fields will be validated in the service layer
                sharePrice: z.number().optional(),
                shareCount: z.number().optional(),
                shareClass: z.enum(["COMMON", "PREFERRED"]).optional(),
                valuationCap: z.number().optional(),
                discountRate: z.number().optional(),
            }),
        }),
    )
    .action(async ({ parsedInput }) => {
        const { id, data } = parsedInput;

        return await updateInstrument({ id, data });
    });

export const deleteInstrumentAction = authAction
    .metadata({
        permissions: [Permissions.INSTRUMENT_DELETE],
    })
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput }) => {
        return await deleteInstrument({ id: parsedInput.id });
    });
