'use server';
import { authAction } from "./base/action-clients";
import { getDashboardStatsQuery } from "@/lib/queries/dashboard-queries";
import { z } from "zod";

const dashboardStatsSchema = z.object({
    totalCompanies: z.number(),
    totalInvestors: z.number(),
    totalInvestment: z.number(),
    openRounds: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const getDashboardStatsAction = authAction
    .metadata({
        permissions: [],
    })
    .schema(z.void())
    .action(async () => {
        const stats = await getDashboardStatsQuery();
        
        return dashboardStatsSchema.parse(stats);
    }); 