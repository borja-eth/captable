import { z } from "zod";

export const generateCapTableSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  roundIds: z.array(z.string()).optional(),
  valuationOverride: z.number().min(0, "Valuation must be positive").optional(),
  date: z.date().optional(),
});

export const captableSchema = generateCapTableSchema; 