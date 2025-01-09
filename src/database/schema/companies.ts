import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    registrationNumber: text("registration_number").notNull().unique(),
    incorporationDate: timestamp("incorporation_date").notNull(),
    shares: integer("shares").notNull().default(10000000),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
