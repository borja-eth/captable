import { Card, CardContent, CardHeader, CardTitle } from "@roxom-markets/spark-ui";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SimpleScenarioResult } from "@/lib/types/scenario-types";

interface ScenarioOwnershipChartProps {
    result: SimpleScenarioResult;
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

export const ScenarioOwnershipChart = ({ result }: ScenarioOwnershipChartProps) => {
    // Prepare data for the pie chart
    const stakeholderData = result.stakeholders.map((entry) => ({
        name: entry.name,
        value: entry.currentShares,
        newOwnership: entry.newOwnership,
    }));

    const investorData = result.investors.map((entry) => ({
        name: entry.name,
        value: entry.totalShares,
        newOwnership: entry.newOwnership,
    }));

    const newInvestorData = [{
        name: "New Investor",
        value: result.newShares,
        newOwnership: (result.newShares / (result.stakeholders.reduce((sum, s) => sum + s.totalShares, 0) + 
            result.investors.reduce((sum, i) => sum + i.totalShares, 0) + result.newShares)) * 100,
    }];

    const totalShares = stakeholderData.reduce((sum, entry) => sum + entry.value, 0) +
        investorData.reduce((sum, entry) => sum + entry.value, 0) +
        newInvestorData[0].value;

    const data = [...stakeholderData, ...investorData, ...newInvestorData].map(entry => ({
        name: entry.name,
        value: entry.value,
        percentage: (entry.value / totalShares) * 100,
        ownership: entry.newOwnership,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Post-Investment Ownership</CardTitle>
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
                                    name,
                                    payload,
                                }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return payload.percentage > 3 ? (
                                        <text
                                            x={x}
                                            y={y}
                                            className="fill-foreground text-[10px]"
                                            textAnchor={x > cx ? 'start' : 'end'}
                                            dominantBaseline="central"
                                        >
                                            {`${name} (${payload.ownership.toFixed(1)}%)`}
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
                                    if (active && payload?.[0]?.payload) {
                                        const { name, value, ownership } = payload[0].payload;
                                        
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-1">
                                                    <div className="font-medium">{name}</div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>Ownership:</div>
                                                        <div className="text-right font-medium text-foreground">
                                                            {ownership.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                        <div>Shares:</div>
                                                        <div className="text-right font-medium text-foreground">
                                                            {Math.round(value).toLocaleString()}
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