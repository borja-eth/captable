import { pgTable, text, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { user } from "./auth";

export const scenarios = pgTable("scenarios", {
    id: text("id").primaryKey(),
    companyId: text("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    newInvestment: numeric("new_investment").notNull(),
    premoneyValuation: numeric("premoney_valuation").notNull(),
    result: jsonb("result"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
}); 