"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { Permissions } from "@/lib/types/permission-types";
import { z } from "zod";
import { companySchema } from "@/lib/schemas/company-schemas";
import {
  createCompany,
  deleteCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
} from "@/lib/services/company-service";

/**
 * Lists all companies
 */
export const listCompaniesAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_LIST],
  })
  .action(async () => {
    return await listCompanies();
  });

/**
 * Gets a company by ID
 */
export const getCompanyByIdAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_READ],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await getCompanyById({ id: parsedInput.id });
  });

/**
 * Creates a new company
 */
export const createCompanyAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_CREATE],
  })
  .schema(companySchema)
  .action(async ({ parsedInput }) => {
    return await createCompany({ data: parsedInput });
  });

/**
 * Updates an existing company
 */
export const updateCompanyAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_UPDATE],
  })
  .schema(z.object({
    id: z.string(),
    data: companySchema.partial(),
  }))
  .action(async ({ parsedInput }) => {
    const { id, data } = parsedInput;

    return await updateCompany({ id, data });
  });

/**
 * Deletes a company
 */
export const deleteCompanyAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_DELETE],
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    return await deleteCompany({ id: parsedInput.id });
  }); 