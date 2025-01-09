"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { stakeholderSchema } from "@/lib/schemas/stakeholder-schemas";
import {
    createStakeholder,
    deleteStakeholder,
    getStakeholderById,
    listStakeholders,
    listStakeholdersByCompany,
    updateStakeholder,
} from "@/lib/services/stakeholder-service";
import { Permissions } from "@/lib/types/permission-types";
import { z } from "zod";

/**
 * Lists all stakeholders
 */
export const listStakeholdersAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_LIST],
  })
  .action(async () => {
    return await listStakeholders();
  });

/**
 * Lists stakeholders by company ID
 */
export const listStakeholdersByCompanyAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_LIST],
  })
  .schema(z.object({ companyId: z.string() }))
  .action(async ({ parsedInput }) => {
    return await listStakeholdersByCompany({ companyId: parsedInput.companyId });
  });

/**
 * Gets a stakeholder by ID
 */
export const getStakeholderByIdAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_READ],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await getStakeholderById({ id: parsedInput.id });
  });

/**
 * Creates a new stakeholder
 */
export const createStakeholderAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_CREATE],
  })
  .schema(stakeholderSchema)
  .action(async ({ parsedInput }) => {
    return await createStakeholder({ data: parsedInput });
  });

/**
 * Updates a stakeholder
 */
export const updateStakeholderAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_UPDATE],
  })
  .schema(
    z.object({
      id: z.string(),
      data: stakeholderSchema.partial(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, data } = parsedInput;
    
    return await updateStakeholder({ id, data });

  });

/**
 * Deletes a stakeholder
 */
export const deleteStakeholderAction = authAction
  .metadata({
    permissions: [Permissions.STAKEHOLDER_DELETE],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await deleteStakeholder({ id: parsedInput.id });
  }); 
