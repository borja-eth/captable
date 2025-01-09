"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@roxom-markets/spark-ui";
import { formatCurrency } from "@/lib/utils/format";
import type { SimpleScenarioResult } from "@/lib/types/scenario-types";
import { ScenarioOwnershipChart } from "./scenario-ownership-chart";
import type { Scenario } from "@/lib/types/scenario-types";

interface ScenarioCaptableProps {
    scenario: SimpleScenarioResult;
    premoneyValuation: number;
    scenarios: Scenario[];
    onScenarioChange: (scenarioId: string) => void;
    currentScenarioId: string;
}

export const ScenarioCaptable = ({ 
    scenario, 
    premoneyValuation, 
    scenarios,
    onScenarioChange,
    currentScenarioId,
}: ScenarioCaptableProps) => {
    // Calculate totals
    const totalStakeholderShares = scenario.stakeholders.reduce((sum, s) => sum + s.currentShares, 0);
    const totalInvestorShares = scenario.investors.reduce((sum, i) => sum + i.totalShares, 0);
    const totalShares = totalStakeholderShares + totalInvestorShares;

    // Calculate share price and post-money valuation
    const sharePrice = premoneyValuation / totalStakeholderShares;
    const postMoneyValuation = totalShares * sharePrice;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Cap Table After Investment</CardTitle>
                <Select
                    value={currentScenarioId}
                    onValueChange={onScenarioChange}
                >
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a scenario" />
                    </SelectTrigger>
                    <SelectContent>
                        {scenarios.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {formatCurrency(Number(s.newInvestment))} at {formatCurrency(Number(s.premoneyValuation))} pre-money ({new Date(s.createdAt).toLocaleDateString()})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-8">
                    <ScenarioOwnershipChart result={scenario} />
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Shares</TableHead>
                                <TableHead className="text-right">Ownership %</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Stakeholders Section */}
                            {scenario.stakeholders.map((stakeholder) => (
                                <TableRow key={stakeholder.stakeholderId}>
                                    <TableCell>{stakeholder.name}</TableCell>
                                    <TableCell>Stakeholder</TableCell>
                                    <TableCell className="text-right">
                                        {Math.round(stakeholder.currentShares).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {((stakeholder.currentShares / totalShares) * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(stakeholder.currentShares * sharePrice)}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Stakeholders Subtotal */}
                            <TableRow className="bg-muted/50">
                                <TableCell className="font-medium">Stakeholders Subtotal</TableCell>
                                <TableCell />
                                <TableCell className="text-right font-medium">
                                    {Math.round(totalStakeholderShares).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {((totalStakeholderShares / totalShares) * 100).toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(totalStakeholderShares * sharePrice)}
                                </TableCell>
                            </TableRow>

                            {/* Investors Section */}
                            {scenario.investors.map((investor) => (
                                <TableRow key={investor.investorId}>
                                    <TableCell>{investor.name}</TableCell>
                                    <TableCell>
                                        {investor.name === "New Investor" ? "New Investment" : 
                                         investor.name === "SAFE Holder" ? "SAFE" : "Note"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {Math.round(investor.totalShares).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {((investor.totalShares / totalShares) * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(investor.totalShares * sharePrice)}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Investors Subtotal */}
                            <TableRow className="bg-muted/50">
                                <TableCell className="font-medium">Investors Subtotal</TableCell>
                                <TableCell />
                                <TableCell className="text-right font-medium">
                                    {Math.round(totalInvestorShares).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {((totalInvestorShares / totalShares) * 100).toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(totalInvestorShares * sharePrice)}
                                </TableCell>
                            </TableRow>

                            {/* Total Row */}
                            <TableRow className="bg-primary/5 font-bold">
                                <TableCell>Total</TableCell>
                                <TableCell />
                                <TableCell className="text-right">
                                    {Math.round(totalShares).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">100.00%</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(postMoneyValuation)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}; 