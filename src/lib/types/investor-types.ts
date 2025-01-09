import { z } from "zod";
import { investorSchema } from "@/lib/schemas/investor-schemas";

export interface Investor {
    id: string;
    name: string;
    type: "INDIVIDUAL" | "INSTITUTIONAL";
    email: string;
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateInvestorInput = z.infer<typeof investorSchema>;
