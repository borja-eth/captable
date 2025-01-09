import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer,
    json,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const optionPools = pgTable("option_pools", {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").references(() => companies.id, {
        onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    totalShares: integer("total_shares").notNull(),
    sharesAllocated: integer("shares_allocated").notNull().default(0),
    sharesAvailable: integer("shares_available").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const optionGrants = pgTable("option_grants", {
    id: uuid("id").primaryKey().defaultRandom(),
    poolId: uuid("pool_id").references(() => optionPools.id, {
        onDelete: "cascade",
    }),
    recipientName: varchar("recipient_name", { length: 100 }).notNull(),
    recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
    sharesGranted: integer("shares_granted").notNull(),
    vestingSchedule: json("vesting_schedule")
        .$type<{
            startDate: Date;
            cliffMonths: number;
            vestingMonths: number;
            initialVestingPercentage: number;
        }>()
        .notNull(),
    exercisePrice: integer("exercise_price").notNull(), // Stored in cents
    grantDate: timestamp("grant_date").notNull(),
    expirationDate: timestamp("expiration_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
