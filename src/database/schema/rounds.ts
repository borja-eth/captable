import { pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  type: text("type").notNull().$type<"SEED" | "SERIES_A" | "SERIES_B" | "SERIES_C" | "SERIES_D">(),
  preMoneyValuation: numeric("pre_money_valuation").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().$type<"DRAFT" | "ACTIVE" | "CLOSED">().default("DRAFT"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}); 