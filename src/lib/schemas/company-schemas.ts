import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  incorporationDate: z.date({
    required_error: "Incorporation date is required",
  }),
});