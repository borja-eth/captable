import { z } from "zod";

export const optionPoolSchema = z.object({
    companyId: z.string().uuid(),
    name: z.string().min(1).max(100),
    totalShares: z.number().positive(),
});

export const optionGrantSchema = z.object({
    poolId: z.string().uuid(),
    recipientName: z.string().min(1).max(100),
    recipientEmail: z.string().email(),
    sharesGranted: z.number().positive(),
    vestingSchedule: z.object({
        startDate: z.coerce.date(),
        cliffMonths: z.number().min(0).max(48),
        vestingMonths: z.number().min(1).max(60),
        initialVestingPercentage: z.number().min(0).max(100),
    }),
    exercisePrice: z.number().min(0),
    grantDate: z.coerce.date(),
    expirationDate: z.coerce.date(),
});
