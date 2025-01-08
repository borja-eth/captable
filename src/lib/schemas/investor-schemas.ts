import { z } from "zod";

export const investorSchema = z.object({
  name: z.string().min(1, "Investor name is required"),
  type: z.enum(["INDIVIDUAL", "INSTITUTIONAL"], {
    required_error: "Investor type is required",
  }),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
});