import { z } from "zod";

export const roundSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  name: z.string().min(1, "Round name is required"),
  type: z.enum(["SEED", "SERIES_A", "SERIES_B", "SERIES_C", "SERIES_D"], {
    required_error: "Round type is required",
  }),
  preMoneyValuation: z.number().min(0, "Pre-money valuation must be positive"),
  date: z.date({
    required_error: "Round date is required",
  }),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).default("DRAFT"),
});