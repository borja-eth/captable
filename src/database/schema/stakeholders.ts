import { VestingScheduleType } from "@/lib/types/stakeholder-types";
import { integer, json, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const stakeholderRoleEnum = pgEnum("stakeholder_role", ["FOUNDER", "ADVISOR"] as const);
export const vestingScheduleTypeEnum = pgEnum("vesting_schedule_type", ["STANDARD_4_YEARS", "CUSTOM"] as const);

export const stakeholders = pgTable("stakeholders", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: stakeholderRoleEnum("role").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  sharesGranted: integer("shares_granted").notNull(),
  vestingSchedule: json("vesting_schedule").$type<{
    type: VestingScheduleType;
    startDate: Date;
    cliffMonths: number;
    vestingMonths: number;
    initialVestingPercentage: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 