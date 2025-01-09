import { z } from "zod";

export const simpleScenarioSchema = z.object({
    companyId: z.string({
        required_error: "Company is required",
        invalid_type_error: "Company must be a valid ID",
    }).min(1, "Company is required"),
    
    newInvestment: z.number({
        required_error: "Investment amount is required",
        invalid_type_error: "Investment amount must be a number",
    })
    .positive("Investment amount must be positive")
    .min(1, "Investment amount must be at least 1"),
    
    premoneyValuation: z.number({
        required_error: "Pre-money valuation is required",
        invalid_type_error: "Pre-money valuation must be a number",
    })
    .positive("Pre-money valuation must be positive")
    .min(1, "Pre-money valuation must be at least 1"),
}).refine(
    (data) => data.newInvestment <= data.premoneyValuation * 2,
    {
        message: "Investment amount cannot be more than 2x the pre-money valuation",
        path: ["newInvestment"],
    }
); 