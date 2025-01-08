"use server";

import { authAction } from "@/lib/actions/base/action-clients";
import { Permissions } from "@/lib/types/permission-types";
import { generateCapTableSchema } from "@/lib/schemas/captable-schemas";
import { generateCapTable } from "@/lib/services/captable-service";

/**
 * Generates a cap table for a company
 */
export const generateCapTableAction = authAction
  .metadata({
    permissions: [Permissions.COMPANY_READ, Permissions.INSTRUMENT_READ, Permissions.ROUND_READ],
  })
  .schema(generateCapTableSchema)
  .action(async ({ parsedInput }) => {
    return await generateCapTable({ data: parsedInput });
  }); 