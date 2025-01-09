"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { Permissions } from "@/lib/types/permission-types";
import { z } from "zod";
import { investorSchema } from "@/lib/schemas/investor-schemas";
import {
    listInvestors,
    getInvestorById,
    createInvestor,
    updateInvestor,
    deleteInvestor,
} from "@/lib/services/investor-service";

export const listInvestorsAction = authAction
    .metadata({
        permissions: [Permissions.INVESTOR_LIST],
    })
    .schema(z.object({}))
    .action(async () => {
        return await listInvestors({});
    });

export const getInvestorByIdAction = authAction
    .metadata({
        permissions: [Permissions.INVESTOR_READ],
    })
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput }) => {
        return await getInvestorById({ id: parsedInput.id });
    });

export const createInvestorAction = authAction
    .metadata({
        permissions: [Permissions.INVESTOR_CREATE],
    })
    .schema(investorSchema)
    .action(async ({ parsedInput }) => {
        return await createInvestor({ data: parsedInput });
    });

export const updateInvestorAction = authAction
    .metadata({
        permissions: [Permissions.INVESTOR_UPDATE],
    })
    .schema(
        z.object({
            id: z.string(),
            data: investorSchema.partial(),
        }),
    )
    .action(async ({ parsedInput }) => {
        const { id, data } = parsedInput;

        return await updateInvestor({ id, data });
    });

export const deleteInvestorAction = authAction
    .metadata({
        permissions: [Permissions.INVESTOR_DELETE],
    })
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput }) => {
        return await deleteInvestor({ id: parsedInput.id });
    });
