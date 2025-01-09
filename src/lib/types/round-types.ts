import { z } from "zod";
import { roundSchema } from "@/lib/schemas/round-schemas";
import type { Company } from "./company-types";

export interface Round {
    id: string;
    companyId: string;
    company?: Pick<Company, "name">;
    name: string;
    type:
        | "PRE_SEED"
        | "SEED"
        | "SERIES_A"
        | "SERIES_B"
        | "SERIES_C"
        | "SERIES_D";
    preMoneyValuation: number;
    date: Date;
    status: "DRAFT" | "ACTIVE" | "CLOSED";
    createdAt: Date;
    updatedAt: Date;
}

export type CreateRoundInput = z.infer<typeof roundSchema>;
