import { z } from "zod";

export const roundTypeEnum = z.enum(["PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C", "SERIES_D"]);
export const roundStatusEnum = z.enum(["DRAFT", "ACTIVE", "CLOSED"]);

export const roundSchema = z.object({
    companyId: z.string().min(1, "Company is required"),
    name: z.string().min(1, "Round name is required"),
    type: roundTypeEnum,
    preMoneyValuation: z
        .number()
        .min(0, "Pre-money valuation must be positive"),
    date: z.date({
        required_error: "Round date is required",
    }),
    status: roundStatusEnum.default("DRAFT"),
});
