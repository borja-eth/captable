"use client";

import type { CapTableSummary } from "@/lib/types/captable-types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
    Button,
} from "@roxom-markets/spark-ui";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { OwnershipPieChart } from "./ownership-pie-chart";

interface ConvertedSharesViewProps {
    capTable: CapTableSummary;
}

const calculateConvertedShares = (capTable: CapTableSummary) => {
    console.log("Starting conversion calculations...");
    console.log("Cap Table:", capTable);

    // Get total stakeholder shares
    const stakeholderShares = capTable.stakeholders.reduce(
        (sum, stakeholder) => sum + stakeholder.shares,
        0,
    );
    console.log("Total Stakeholder Shares:", stakeholderShares);

    // Get total equity shares
    const totalEquityShares = capTable.entries.reduce(
        (sum, entry) => sum + entry.instruments.equity.shares,
        0,
    );
    console.log("Total Equity Shares:", totalEquityShares);

    // Get pre-money shares (equity + stakeholder shares)
    const fullyDilutedShares = totalEquityShares + stakeholderShares;
    console.log("Fully Diluted Shares:", fullyDilutedShares);

    // Get the last round's price per share and valuation
    const lastRound = capTable.rounds[capTable.rounds.length - 1];

    if (!lastRound) return [];

    // Calculate price per share from pre-money valuation
    const pricePerShare = lastRound.preMoney / fullyDilutedShares;
    console.log("Price Per Share:", pricePerShare);

    // Calculate converted entries
    const convertedEntries = capTable.entries.map((entry) => {
        console.log("\nProcessing entry for:", entry.investorName);

        // Start with equity shares and calculate ownership based on pre-money
        const equityShares = entry.instruments.equity.shares;
        const equityOwnership = equityShares > 0 ? (entry.instruments.equity.value / lastRound.preMoney) * 100 : 0;
        console.log("Equity Shares:", equityShares);
        console.log("Equity Ownership:", equityOwnership);

        // Convert SAFEs
        const safeShares = entry.instruments.safe
            .map((safe) => {
                console.log("\nProcessing SAFE:", safe);

                if (!safe.valuationCap) {
                    console.log("No valuation cap, skipping...");
                    
                    return { shares: 0, ownership: 0 };
                }

                // Calculate ownership at cap
                const ownershipAtCap = (safe.invested / safe.valuationCap) * 100;
                
                // Calculate shares needed for this ownership
                let shares = (ownershipAtCap * fullyDilutedShares) / (100 - ownershipAtCap);

                // Apply discount if any by increasing shares
                if (safe.discountRate > 0) {
                    shares = shares * (1 / (1 - safe.discountRate / 100));
                }

                console.log("Investment:", safe.invested);
                console.log("Valuation Cap:", safe.valuationCap);
                console.log("Ownership at Cap:", ownershipAtCap);
                console.log("Shares:", shares);

                return { shares: Math.floor(shares), ownership: ownershipAtCap };
            })
            .reduce((acc, curr) => ({ 
                shares: acc.shares + curr.shares, 
                ownership: acc.ownership + curr.ownership 
            }), { shares: 0, ownership: 0 });

        console.log("Total SAFE Shares:", safeShares.shares);
        console.log("Total SAFE Ownership:", safeShares.ownership);

        // Convert Notes
        const noteShares = entry.instruments.convertibleNote
            .map((note) => {
                console.log("\nProcessing Note:", note);

                if (!note.valuationCap) {
                    console.log("No valuation cap, skipping...");
                    
                    return { shares: 0, ownership: 0 };
                }

                // Calculate total amount including interest
                const totalAmount = note.invested + note.accruedInterest;
                console.log("Total Amount (with interest):", totalAmount);

                // Calculate ownership at cap
                const ownershipAtCap = (totalAmount / note.valuationCap) * 100;
                
                // Calculate shares needed for this ownership
                let shares = (ownershipAtCap * fullyDilutedShares) / (100 - ownershipAtCap);

                // Apply discount if any by increasing shares
                if (note.discountRate > 0) {
                    shares = shares * (1 / (1 - note.discountRate / 100));
                }

                console.log("Valuation Cap:", note.valuationCap);
                console.log("Ownership at Cap:", ownershipAtCap);
                console.log("Shares:", shares);

                return { shares: Math.floor(shares), ownership: ownershipAtCap };
            })
            .reduce((acc, curr) => ({ 
                shares: acc.shares + curr.shares, 
                ownership: acc.ownership + curr.ownership 
            }), { shares: 0, ownership: 0 });

        console.log("Total Note Shares:", noteShares.shares);
        console.log("Total Note Ownership:", noteShares.ownership);

        // Total shares and ownership for this entry
        const totalShares = equityShares + safeShares.shares + noteShares.shares;
        const totalOwnership = equityOwnership + safeShares.ownership + noteShares.ownership;
        console.log("Total Shares for Entry:", totalShares);
        console.log("Total Ownership for Entry:", totalOwnership);

        return {
            ...entry,
            shares: totalShares,
            ownership: totalOwnership,
            instruments: {
                ...entry.instruments,
                safe: entry.instruments.safe.map((safe) => {
                    if (!safe.valuationCap) return { ...safe, potentialShares: 0 };
                    
                    // Calculate ownership at cap
                    const ownershipAtCap = (safe.invested / safe.valuationCap) * 100;
                    
                    // Calculate shares needed for this ownership
                    let shares = (ownershipAtCap * fullyDilutedShares) / (100 - ownershipAtCap);

                    // Apply discount if any by increasing shares
                    if (safe.discountRate > 0) {
                        shares = shares * (1 / (1 - safe.discountRate / 100));
                    }

                    return {
                        ...safe,
                        potentialShares: Math.floor(shares),
                    };
                }),
                convertibleNote: entry.instruments.convertibleNote.map((note) => {
                    if (!note.valuationCap) return { ...note, potentialShares: 0 };
                    
                    const totalAmount = note.invested + note.accruedInterest;
                    
                    // Calculate ownership at cap
                    const ownershipAtCap = (totalAmount / note.valuationCap) * 100;
                    
                    // Calculate shares needed for this ownership
                    let shares = (ownershipAtCap * fullyDilutedShares) / (100 - ownershipAtCap);

                    // Apply discount if any by increasing shares
                    if (note.discountRate > 0) {
                        shares = shares * (1 / (1 - note.discountRate / 100));
                    }

                    return {
                        ...note,
                        potentialShares: Math.floor(shares),
                    };
                }),
            },
        };
    });

    return convertedEntries;
};

export const ConvertedSharesView = ({ capTable }: ConvertedSharesViewProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const convertedEntries = calculateConvertedShares(capTable);

    // Calculate totals
    const totalShares =
        convertedEntries.reduce((sum, entry) => sum + entry.shares, 0) +
        capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0);

    // Calculate stakeholder ownership based on total shares
    const lastRound = capTable.rounds[capTable.rounds.length - 1];
    const pricePerShare = lastRound ? lastRound.preMoney / totalShares : 0;

    const totalValue = convertedEntries.reduce(
        (sum, entry) => sum + entry.value,
        0,
    );

    const totalSafeShares = convertedEntries.reduce(
        (sum, entry) =>
            sum +
            entry.instruments.safe.reduce(
                (safeSum, safe) => safeSum + (safe.potentialShares || 0),
                0,
            ),
        0,
    );

    const totalNoteShares = convertedEntries.reduce(
        (sum, entry) =>
            sum +
            entry.instruments.convertibleNote.reduce(
                (noteSum, note) => noteSum + (note.potentialShares || 0),
                0,
            ),
        0,
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <OwnershipPieChart capTable={capTable} convertedEntries={convertedEntries} />
                
                <div>
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-2"
                                >
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {isOpen ? "Hide Details" : "Show Details"}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Investor</TableHead>
                                        <TableHead className="text-right">Shares</TableHead>
                                        <TableHead className="text-right">Ownership</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead className="text-right">SAFE Shares</TableHead>
                                        <TableHead className="text-right">Note Shares</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* First show stakeholders */}
                                    {capTable.stakeholders.map((entry) => (
                                        <TableRow key={entry.stakeholder.id}>
                                            <TableCell>{entry.stakeholder.name}</TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(entry.shares).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {((entry.shares / totalShares) * 100).toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-right">${Math.round(entry.shares * pricePerShare).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Stakeholder Subtotal */}
                                    <TableRow className="bg-muted/50 font-medium">
                                        <TableCell>Stakeholder Subtotal</TableCell>
                                        <TableCell className="text-right">
                                            {Math.round(capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0)).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {((capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0) / totalShares) * 100).toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${Math.round(capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0) * pricePerShare).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">0</TableCell>
                                        <TableCell className="text-right">0</TableCell>
                                    </TableRow>
                                    {/* Then show investors */}
                                    {convertedEntries.map((entry) => (
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
                                            <TableCell className="text-right">
                                                {Math.round(
                                                    entry.instruments.safe.reduce(
                                                        (sum, safe) =>
                                                            sum + (safe.potentialShares || 0),
                                                            0,
                                                    ),
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Math.round(
                                                    entry.instruments.convertibleNote.reduce(
                                                        (sum, note) =>
                                                            sum + (note.potentialShares || 0),
                                                            0,
                                                    ),
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total row */}
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">
                                            {Math.round(totalShares).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">100.00%</TableCell>
                                        <TableCell className="text-right">
                                            ${totalValue.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {Math.round(totalSafeShares).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {Math.round(totalNoteShares).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
};
