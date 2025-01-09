import { z } from "zod";

const baseInstrumentSchema = z.object({
    roundId: z.string().min(1, "Round is required"),
    investorId: z.string().min(1, "Investor is required"),
    amount: z.number().min(0, "Amount must be positive"),
});

export const equityInstrumentSchema = baseInstrumentSchema.extend({
    type: z.literal("EQUITY"),
    sharePrice: z.number().min(0, "Share price must be positive"),
    shareCount: z.number().min(1, "Share count must be positive"),
    shareClass: z.enum(["COMMON", "PREFERRED"]),
});

export const safeInstrumentSchema = baseInstrumentSchema.extend({
    type: z.literal("SAFE"),
    valuationCap: z.number().min(0, "Valuation cap must be positive"),
    discountRate: z
        .number()
        .min(0)
        .max(100, "Discount rate must be between 0 and 100"),
});

export const convertibleNoteInstrumentSchema = baseInstrumentSchema.extend({
    type: z.literal("CONVERTIBLE_NOTE"),
    interestRate: z
        .number()
        .min(0)
        .max(100, "Interest rate must be between 0 and 100"),
    maturityDate: z.date(),
    conversionCap: z.number().min(0, "Conversion cap must be positive"),
    discountRate: z
        .number()
        .min(0)
        .max(100, "Discount rate must be between 0 and 100"),
});

export const instrumentSchema = z.discriminatedUnion("type", [
    equityInstrumentSchema,
    safeInstrumentSchema,
    convertibleNoteInstrumentSchema,
]);
