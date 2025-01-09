import { z } from "zod";
import { stakeholderSchema } from "@/lib/schemas/stakeholder-schemas";
import { stakeholders } from "@/database/schema";

export enum StakeholderRole {
    FOUNDER = "FOUNDER",
    ADVISOR = "ADVISOR",
}

export enum VestingScheduleType {
    STANDARD_4_YEARS = "STANDARD_4_YEARS", // 1 year cliff, 4 years total
    CUSTOM = "CUSTOM",
}

export interface VestingSchedule {
    type: VestingScheduleType;
    startDate: Date;
    cliffMonths: number;
    vestingMonths: number;
    initialVestingPercentage: number;
}

export type Stakeholder = typeof stakeholders.$inferSelect;
export type CreateStakeholderInput = z.infer<typeof stakeholderSchema>;
