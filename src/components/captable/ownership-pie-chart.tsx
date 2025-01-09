import { Card, CardContent, CardHeader, CardTitle } from "@roxom-markets/spark-ui";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CapTableSummary } from "@/lib/types/captable-types";

interface OwnershipPieChartProps {
    capTable: CapTableSummary;
    convertedEntries: Array<{
        investorId: string;
        investorName: string;
        shares: number;
        ownership: number;
    }>;
}

const COLORS = [
    "#0ea5e9", // sky-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
    "#10b981", // emerald-500
    "#f43f5e", // rose-500
    "#06b6d4", // cyan-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
];

export const OwnershipPieChart = ({ capTable, convertedEntries }: OwnershipPieChartProps) => {
    // Prepare data for the pie chart
    const stakeholderData = capTable.stakeholders.map((entry) => ({
        name: entry.stakeholder.name,
        value: entry.shares,
    }));

    const investorData = convertedEntries.map((entry) => ({
        name: entry.investorName,
        value: entry.shares,
    }));

    const totalShares = stakeholderData.reduce((sum, entry) => sum + entry.value, 0) +
        investorData.reduce((sum, entry) => sum + entry.value, 0);

    const data = [...stakeholderData, ...investorData].map(entry => ({
        name: entry.name,
        value: (entry.value / totalShares) * 100
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ownership Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={140}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                label={({
                                    cx,
                                    cy,
                                    midAngle,
                                    innerRadius,
                                    outerRadius,
                                    value,
                                    name
                                }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return value > 3 ? (
                                        <text
                                            x={x}
                                            y={y}
                                            className="fill-foreground text-[10px]"
                                            textAnchor={x > cx ? 'start' : 'end'}
                                            dominantBaseline="central"
                                        >
                                            {`${name} (${value.toFixed(1)}%)`}
                                        </text>
                                    ) : null;
                                }}
                            >
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={entry.name}
                                        fill={COLORS[index % COLORS.length]}
                                        className="stroke-background hover:opacity-80"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload?.[0]?.value) {
                                        const value = payload[0].value as number;
                                        const name = payload[0].name as string;
                                        const entry = [...stakeholderData, ...investorData].find(e => e.name === name);
                                        const shares = entry?.value || 0;
                                        
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-1">
                                                    <div className="font-medium">{name}</div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>Ownership:</div>
                                                        <div className="text-right font-medium text-foreground">
                                                            {value.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>Shares:</div>
                                                        <div className="text-right font-medium text-foreground">
                                                            {Math.round(shares).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}; 