import { db } from "@/database";
import { companies } from "@/database/schema/companies";
import { investors } from "@/database/schema/investors";
import { rounds } from "@/database/schema/rounds";
import { instruments } from "@/database/schema/instruments";
import { eq, sum } from "drizzle-orm";
import type { DatabaseConnection } from "@/database";

export const getDashboardStatsQuery = async (connection: DatabaseConnection = db) => {
    // Get total companies
    const totalCompanies = await connection
        .select({ count: companies.id })
        .from(companies)
        .then((result) => result[0]?.count || 0);

    // Get total active investors
    const totalInvestors = await connection
        .select({ count: investors.id })
        .from(investors)
        .then((result) => result[0]?.count || 0);

    // Get total investment from instruments
    const totalInvestment = await connection
        .select({ sum: sum(instruments.amount) })
        .from(instruments)
        .then((result) => Number(result[0]?.sum || 0));

    // Get open rounds (rounds with status ACTIVE)
    const openRounds = await connection
        .select({ count: rounds.id })
        .from(rounds)
        .where(eq(rounds.status, "ACTIVE"))
        .then((result) => result[0]?.count || 0);

    return {
        totalCompanies,
        totalInvestors,
        totalInvestment,
        openRounds,
    };
}; 