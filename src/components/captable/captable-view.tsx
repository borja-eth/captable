"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateCapTableAction } from "@/lib/actions/captable-actions";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import type { CapTableSummary, CapTableEntry } from "@/lib/types/captable-types";
import type { Company } from "@/lib/types/company-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  useToast,
  Switch,
  Label,
} from "@roxom-markets/spark-ui";

interface CapTableViewProps {
  companyId?: string;
}

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

      if (result && !result.validationErrors && !result.serverError && result.data) {
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

  const loadCapTable = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const result = await generateCapTableAction({
        companyId: id,
      });

      if (result && !result.validationErrors && !result.serverError && result.data) {
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
  }, [toast]);

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

  const calculateEntryWithConvertedSafes = (entry: CapTableEntry): CapTableEntry => {
    const convertedShares = entry.shares + 
      entry.instruments.safe.reduce((sum, safe) => sum + safe.potentialShares, 0) +
      entry.instruments.convertibleNote.reduce((sum, note) => sum + note.potentialShares, 0);
    
    return {
      ...entry,
      shares: convertedShares,
      ownership: 0, // Will be recalculated below
    };
  };

  const getDisplayEntries = (): CapTableEntry[] => {
    if (!capTable) return [];
    
    const entries = showConvertedSafes 
      ? capTable.entries.map(calculateEntryWithConvertedSafes)
      : capTable.entries;

    const totalShares = entries.reduce((sum, entry) => sum + entry.shares, 0);
    
    return entries.map(entry => ({
      ...entry,
      ownership: (entry.shares / totalShares) * 100,
    }));
  };

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
            <Label htmlFor="convert-safes">Show converted SAFEs</Label>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Shares</div>
                  <div className="text-2xl font-bold">
                    {showConvertedSafes 
                      ? getDisplayEntries().reduce((sum, entry) => sum + entry.shares, 0).toLocaleString()
                      : capTable.totalShares.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-bold">${capTable.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {showConvertedSafes ? "Total Shares (with SAFEs)" : "Fully Diluted Shares"}
                  </div>
                  <div className="text-2xl font-bold">{capTable.fullyDilutedShares.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Ownership %</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Instruments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDisplayEntries().map((entry) => (
                    <TableRow key={entry.investorId}>
                      <TableCell>{entry.investorName}</TableCell>
                      <TableCell>{entry.shares.toLocaleString()}</TableCell>
                      <TableCell>{entry.ownership.toFixed(2)}%</TableCell>
                      <TableCell>${entry.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.instruments.equity.shares > 0 && (
                            <div className="text-sm">
                              {entry.instruments.equity.shares.toLocaleString()} equity shares
                            </div>
                          )}
                          {!showConvertedSafes && entry.instruments.safe.map((safe, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              SAFE: ${safe.invested.toLocaleString()} 
                              {safe.valuationCap && ` (Cap: $${safe.valuationCap.toLocaleString()})`}
                              {showConvertedSafes && ` → ${safe.potentialShares.toLocaleString()} shares`}
                            </div>
                          ))}
                          {!showConvertedSafes && entry.instruments.convertibleNote.map((note, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              Note: ${note.invested.toLocaleString()} 
                              {note.valuationCap && ` (Cap: $${note.valuationCap.toLocaleString()})`}
                              {showConvertedSafes && ` → ${note.potentialShares.toLocaleString()} shares`}
                            </div>
                          ))}
                          {showConvertedSafes && entry.instruments.safe.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {entry.instruments.safe.reduce((sum, safe) => sum + safe.potentialShares, 0).toLocaleString()} shares from SAFEs
                            </div>
                          )}
                          {showConvertedSafes && entry.instruments.convertibleNote.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {entry.instruments.convertibleNote.reduce((sum, note) => sum + note.potentialShares, 0).toLocaleString()} shares from Notes
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <div className="text-sm font-medium text-muted-foreground">Date</div>
                      <div>{new Date(round.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Pre-Money</div>
                      <div>${round.preMoney.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Post-Money</div>
                      <div>${round.postMoney.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">New Investment</div>
                      <div>${round.newInvestment.toLocaleString()}</div>
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
                          <TableCell>{entry.shares.toLocaleString()}</TableCell>
                          <TableCell>{entry.ownership.toFixed(2)}%</TableCell>
                          <TableCell>${entry.value.toLocaleString()}</TableCell>
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