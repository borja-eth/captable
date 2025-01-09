"use client";

import { useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { getDashboardStatsAction } from "@/lib/actions/dashboard-actions";
import { formatCurrency } from "@/lib/utils/format";
import type { DashboardStats as DashboardStatsType } from "@/lib/actions/dashboard-actions";
import {
    Card,
    CardHeader,
    CardTitle,
    useToast,
} from "@roxom-markets/spark-ui";

export const DashboardStats = () => {
    const { toast } = useToast();

    const { execute: getStats, status, result } = useAction(getDashboardStatsAction, {
        onError: (error) => {
            toast({
                title: "Error",
                description: error.error.serverError || "Failed to load dashboard stats",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        getStats();
    }, [getStats]);

    const isLoading = status === "executing";
    const stats = result?.data as DashboardStatsType | undefined;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Investment
                        </CardTitle>
                        <div className={`text-2xl font-bold ${isLoading ? "opacity-50" : ""}`}>
                            {formatCurrency(stats?.totalInvestment ?? 0)}
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Investors
                        </CardTitle>
                        <div className={`text-2xl font-bold ${isLoading ? "opacity-50" : ""}`}>
                            {stats?.totalInvestors ?? 0}
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Open Rounds
                        </CardTitle>
                        <div className={`text-2xl font-bold ${isLoading ? "opacity-50" : ""}`}>
                            {stats?.openRounds ?? 0}
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Companies
                        </CardTitle>
                        <div className={`text-2xl font-bold ${isLoading ? "opacity-50" : ""}`}>
                            {stats?.totalCompanies ?? 0}
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}; 