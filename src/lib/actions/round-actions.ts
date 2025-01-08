"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { Permissions } from "@/lib/types/permission-types";
import { z } from "zod";
import { roundSchema } from "@/lib/schemas/round-schemas";
import {
  createRound,
  deleteRound,
  getRoundById,
  listRoundsByCompany,
  updateRound,
} from "@/lib/services/round-service";

/**
 * Lists all rounds for a company
 */
export const listRoundsByCompanyAction = authAction
  .metadata({
    permissions: [Permissions.ROUND_LIST],
  })
  .schema(z.object({ companyId: z.string() }))
  .action(async ({ parsedInput }) => {
    return await listRoundsByCompany({ companyId: parsedInput.companyId });
  });

/**
 * Gets a round by ID
 */
export const getRoundByIdAction = authAction
  .metadata({
    permissions: [Permissions.ROUND_READ],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await getRoundById({ id: parsedInput.id });
  });

/**
 * Creates a new round
 */
export const createRoundAction = authAction
  .metadata({
    permissions: [Permissions.ROUND_CREATE],
  })
  .schema(roundSchema)
  .action(async ({ parsedInput }) => {
    return await createRound({ data: parsedInput });
  });

/**
 * Updates an existing round
 */
export const updateRoundAction = authAction
  .metadata({
    permissions: [Permissions.ROUND_UPDATE],
  })
  .schema(z.object({
    id: z.string(),
    data: roundSchema.partial(),
  }))
  .action(async ({ parsedInput }) => {
    const { id, data } = parsedInput;

    return await updateRound({ id, data });
  });

/**
 * Deletes a round
 */
export const deleteRoundAction = authAction
  .metadata({
    permissions: [Permissions.ROUND_DELETE],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await deleteRound({ id: parsedInput.id });
  }); 