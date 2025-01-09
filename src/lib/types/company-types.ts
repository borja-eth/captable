import { z } from "zod";
import { companySchema } from "@/lib/schemas/company-schemas";

export interface Company {
    id: string;
    name: string;
    registrationNumber: string;
    incorporationDate: Date;
    shares: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateCompanyInput = z.infer<typeof companySchema>;
