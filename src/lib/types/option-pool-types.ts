import { z } from "zod";
import { optionPoolSchema } from "@/lib/schemas/option-pool-schemas";

export interface OptionPool {
    id: string;
    companyId: string;
    name: string;
    totalShares: number;
    sharesAllocated: number;
    sharesAvailable: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OptionGrant {
    id: string;
    poolId: string;
    recipientName: string;
    recipientEmail: string;
    sharesGranted: number;
    vestingSchedule: {
        startDate: Date;
        cliffMonths: number;
        vestingMonths: number;
        initialVestingPercentage: number;
    };
    exercisePrice: number;
    grantDate: Date;
    expirationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateOptionPoolInput = z.infer<typeof optionPoolSchema>;
