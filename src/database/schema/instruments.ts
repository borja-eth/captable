import { pgTable, text, timestamp, uuid, numeric, date } from "drizzle-orm/pg-core";
import { rounds } from "@/database/schema/rounds";
import { investors } from "@/database/schema/investors";

export const instruments = pgTable("instruments", {
  id: uuid("id").primaryKey().defaultRandom(),
  roundId: uuid("round_id").notNull().references(() => rounds.id),
  investorId: uuid("investor_id").notNull().references(() => investors.id),
  type: text("type").notNull().$type<"EQUITY" | "SAFE" | "CONVERTIBLE_NOTE">(),
  amount: numeric("amount").notNull(),
  
  // Equity specific fields
  sharePrice: numeric("share_price"),
  shareCount: numeric("share_count"),
  shareClass: text("share_class").$type<"COMMON" | "PREFERRED">(),
  
  // SAFE specific fields
  valuationCap: numeric("valuation_cap"),
  discountRate: numeric("discount_rate"),
  
  // Convertible Note specific fields
  interestRate: numeric("interest_rate"),
  maturityDate: date("maturity_date"),
  conversionCap: numeric("conversion_cap"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}); 