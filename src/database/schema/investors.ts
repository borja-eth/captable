import { pgTable, text, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

// Define the investor type enum
export const investorTypeEnum = pgEnum('investor_type', ['INDIVIDUAL', 'INSTITUTIONAL']);

// Define the investors table
export const investors = pgTable('investors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: investorTypeEnum('type').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export type for use in application code
export type Investor = typeof investors.$inferSelect;
export type NewInvestor = typeof investors.$inferInsert; 