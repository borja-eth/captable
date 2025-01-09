"use client";

import { generateCapTableAction } from "@/lib/actions/captable-actions";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import type {
  CapTableSummary
} from "@/lib/types/captable-types";
import type { Company } from "@/lib/types/company-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@roxom-markets/spark-ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConvertedSharesView } from "./converted-shares-view";

interface CapTableViewProps {
    companyId?: string;
}

const calculateConvertedShares = (capTable: CapTableSummary) => {
    // Get total stakeholder shares
    const stakeholderShares = capTable.stakeholders.reduce(
        (sum, stakeholder) => sum + stakeholder.shares,
        0
    );

    // Get total equity shares
    const totalEquityShares = capTable.entries.reduce(
        (sum, entry) => sum + entry.instruments.equity.shares,
        0
    );

    // Get pre-money shares (equity + stakeholder shares)
    const preMoneyShares = totalEquityShares + stakeholderShares;

    // Calculate converted entries
    const convertedEntries = capTable.entries.map(entry => {
        // Start with equity shares
        const equityShares = entry.instruments.equity.shares;

        // Convert SAFEs
        const safeShares = entry.instruments.safe.map(safe => {
            if (!safe.valuationCap) return 0;
            
            // Calculate ownership percentage at cap
            const ownershipAtCap = safe.invested / safe.valuationCap;
            
            // Calculate shares needed for this ownership
            let shares = (ownershipAtCap * preMoneyShares) / (1 - ownershipAtCap);
            
            // Apply discount if any by increasing shares
            if (safe.discountRate > 0) {
                shares = shares * (1 / (1 - safe.discountRate / 100));
            }
            
            return shares;
        }).reduce((sum, shares) => sum + shares, 0);

        // Convert Notes
        const noteShares = entry.instruments.convertibleNote.map(note => {
            if (!note.valuationCap) return 0;
            
            const totalAmount = note.invested + note.accruedInterest;
            const ownershipAtCap = totalAmount / note.valuationCap;
            let shares = (ownershipAtCap * preMoneyShares) / (1 - ownershipAtCap);
            
            if (note.discountRate > 0) {
                shares = shares * (1 / (1 - note.discountRate / 100));
            }
            
            return shares;
        }).reduce((sum, shares) => sum + shares, 0);

        return equityShares + safeShares + noteShares;
    }).reduce((sum, shares) => sum + shares, 0);

    return convertedEntries + stakeholderShares;
};

export const CapTableView = ({ companyId }: CapTableViewProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [capTable, setCapTable] = useState<CapTableSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showConvertedSafes, setShowConvertedSafes] = useState(false);

    const loadCompanies = useCallback(async () => {
        try {
            const result = await listCompaniesAction();

            if (
                result &&
                !result.validationErrors &&
                !result.serverError &&
                result.data
            ) {
                setCompanies(result.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load companies",
                variant: "destructive",
            });
        }
    }, [toast]);

    const loadCapTable = useCallback(
        async (id: string) => {
            try {
                setIsLoading(true);
                const result = await generateCapTableAction({
                    companyId: id,
                });

                if (
                    result &&
                    !result.validationErrors &&
                    !result.serverError &&
                    result.data
                ) {
                    setCapTable(result.data);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to generate cap table",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        },
        [toast],
    );

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    useEffect(() => {
        if (companyId) {
            loadCapTable(companyId);
        } else {
            setCapTable(null);
        }
    }, [companyId, loadCapTable]);

    const totalSharesWithSafes = useMemo(() => {
        if (!capTable) return 0;
        
        return showConvertedSafes ? calculateConvertedShares(capTable) : capTable.fullyDilutedShares;
    }, [capTable, showConvertedSafes]);

    const dilutionPercentage = useMemo(() => {
        if (!capTable || !showConvertedSafes) return 0;
        const originalShares = capTable.totalShares;
        const newShares = calculateConvertedShares(capTable);
        
        return ((newShares - originalShares) / newShares) * 100;
    }, [capTable, showConvertedSafes]);

    const companyValuation = useMemo(() => {
        if (!capTable) return 0;
        
        if (!showConvertedSafes) {
            // Use the last round's post-money valuation
            const lastRound = capTable.rounds[capTable.rounds.length - 1];
            
            return lastRound ? lastRound.postMoney : 0;
        }
        
        // When SAFEs are converted, calculate the new valuation
        // Get the last round's price per share
        const lastRound = capTable.rounds[capTable.rounds.length - 1];
        
        if (!lastRound) return 0;
        
        const pricePerShare = lastRound.postMoney / capTable.totalShares;
        
        return Math.round(pricePerShare * totalSharesWithSafes);
    }, [capTable, showConvertedSafes, totalSharesWithSafes]);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Select
                    value={companyId ?? ""}
                    onValueChange={(value) => {
                        const params = new URLSearchParams(searchParams.toString());
                        
                        if (value) {
                            params.set("companyId", value);
                        } else {
                            params.delete("companyId");
                        }
                        router.push(`/captable?${params.toString()}`);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                                {company.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {capTable && (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={showConvertedSafes}
                            id="convert-safes"
                            onCheckedChange={setShowConvertedSafes}
                        />
                        <Label htmlFor="convert-safes">
                            Show converted SAFEs
                        </Label>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading cap table...</div>
            ) : capTable ? (
                <div className="space-y-8">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Total Shares
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {(capTable.totalShares || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Total Value
                                    </div>
                                    <div className="text-2xl font-bold">
                                        ${capTable.totalValue.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {showConvertedSafes
                                            ? "Total Shares (with SAFEs)"
                                            : "Fully Diluted Shares"}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {Math.round(totalSharesWithSafes).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {showConvertedSafes ? "Post-Money Valuation" : "Company Valuation"}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        ${companyValuation.toLocaleString()}
                                    </div>
                                </div>
                                {showConvertedSafes && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Dilution
                                        </div>
                                        <div className="text-2xl font-bold text-destructive">
                                            {dilutionPercentage.toFixed(2)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ownership Tables */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ownership</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="investors">
                                <TabsList>
                                    <TabsTrigger value="investors">Investors</TabsTrigger>
                                    <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                                </TabsList>
                                <TabsContent value="investors">
                                    {showConvertedSafes ? (
                                        <ConvertedSharesView capTable={capTable} />
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Investor</TableHead>
                                                    <TableHead className="text-right">Shares</TableHead>
                                                    <TableHead className="text-right">Ownership</TableHead>
                                                    <TableHead className="text-right">Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {capTable.entries.map((entry) => (
                                                    <TableRow key={entry.investorId}>
                                                        <TableCell>{entry.investorName}</TableCell>
                                                        <TableCell className="text-right">
                                                            {Math.round(entry.shares).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {entry.ownership.toFixed(2)}%
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            ${entry.value.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>
                                <TabsContent value="stakeholders">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead className="text-right">Shares</TableHead>
                                                <TableHead className="text-right">Ownership</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {capTable.stakeholders.map((entry) => (
                                                <TableRow key={entry.stakeholder.id}>
                                                    <TableCell>{entry.stakeholder.name}</TableCell>
                                                    <TableCell>{entry.stakeholder.role}</TableCell>
                                                    <TableCell>{entry.stakeholder.title}</TableCell>
                                                    <TableCell className="text-right">
                                                        {Math.round(entry.shares).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {entry.ownership.toFixed(2)}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Total row */}
                                            <TableRow className="bg-muted font-bold">
                                                <TableCell>Total</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell className="text-right">
                                                    {Math.round(capTable.stakeholders.reduce(
                                                        (sum, entry) => sum + entry.shares,
                                                        0
                                                    )).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {capTable.stakeholders.reduce(
                                                        (sum, entry) => sum + entry.ownership,
                                                        0
                                                    ).toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Rounds */}
                    {capTable.rounds.map((round) => (
                        <Card key={round.id}>
                            <CardHeader>
                                <CardTitle>{round.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Date
                                            </div>
                                            <div>
                                                {new Date(round.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Pre-Money
                                            </div>
                                            <div>
                                                ${round.preMoney.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Post-Money
                                            </div>
                                            <div>
                                                ${round.postMoney.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                New Investment
                                            </div>
                                            <div>
                                                ${round.newInvestment.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Investor</TableHead>
                                                <TableHead>Shares</TableHead>
                                                <TableHead>Ownership %</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {round.entries.map((entry) => (
                                                <TableRow key={entry.investorId}>
                                                    <TableCell>{entry.investorName}</TableCell>
                                                    <TableCell>
                                                        {Math.round(entry.shares).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.ownership.toFixed(2)}%
                                                    </TableCell>
                                                    <TableCell>
                                                        ${entry.value.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    Select a company to view its cap table
                </div>
            )}
        </div>
    );
};
