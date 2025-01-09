import { z } from "zod";
import {
    StakeholderRole,
    VestingScheduleType,
} from "@/lib/types/stakeholder-types";

export const vestingScheduleSchema = z.object({
    type: z.nativeEnum(VestingScheduleType),
    startDate: z.coerce.date(),
    cliffMonths: z.number().min(0).max(48),
    vestingMonths: z.number().min(1).max(60),
    initialVestingPercentage: z.number().min(0).max(100),
});

export const stakeholderSchema = z.object({
    companyId: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    role: z.nativeEnum(StakeholderRole),
    title: z.string().min(1).max(100),
    sharesGranted: z.number().positive(),
    vestingSchedule: vestingScheduleSchema,
});
