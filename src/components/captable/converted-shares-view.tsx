"use client";

import type { CapTableSummary } from "@/lib/types/captable-types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@roxom-markets/spark-ui";

interface ConvertedSharesViewProps {
    capTable: CapTableSummary;
}

const calculateConvertedShares = (capTable: CapTableSummary) => {
    console.log('Starting conversion calculations...');
    console.log('Cap Table:', capTable);

    // Get total stakeholder shares
    const stakeholderShares = capTable.stakeholders.reduce(
        (sum, stakeholder) => sum + stakeholder.shares,
        0
    );
    console.log('Total Stakeholder Shares:', stakeholderShares);

    // Get total equity shares
    const totalEquityShares = capTable.entries.reduce(
        (sum, entry) => sum + entry.instruments.equity.shares,
        0
    );
    console.log('Total Equity Shares:', totalEquityShares);

    // Get pre-money shares (equity + stakeholder shares)
    const fullyDilutedShares = totalEquityShares + stakeholderShares;
    console.log('Fully Diluted Shares:', fullyDilutedShares);

    // Get the last round's price per share
    const lastRound = capTable.rounds[capTable.rounds.length - 1];
    
    if (!lastRound) return [];

    // Calculate price per share from pre-money valuation
    const pricePerShare = lastRound.preMoney / fullyDilutedShares;
    console.log('Price Per Share:', pricePerShare);

    // Calculate converted entries
    const convertedEntries = capTable.entries.map(entry => {
        console.log('\nProcessing entry for:', entry.investorName);
        
        // Start with equity shares
        const equityShares = entry.instruments.equity.shares;
        console.log('Equity Shares:', equityShares);

        // Convert SAFEs
        const safeShares = entry.instruments.safe.map(safe => {
            console.log('\nProcessing SAFE:', safe);
            
            if (!safe.valuationCap) {
                console.log('No valuation cap, skipping...');
                
                return 0;
            }
            
            // Calculate conversion price (lower of discounted price or cap price)
            const discountedPrice = pricePerShare * (1 - safe.discountRate / 100);
            const capPrice = safe.valuationCap / fullyDilutedShares;
            const conversionPrice = Math.min(discountedPrice, capPrice);
            
            console.log('Investment:', safe.invested);
            console.log('Valuation Cap:', safe.valuationCap);
            console.log('Discounted Price:', discountedPrice);
            console.log('Cap Price:', capPrice);
            console.log('Conversion Price:', conversionPrice);
            
            // Calculate shares
            const shares = Math.floor(safe.invested / conversionPrice);
            console.log('Shares:', shares);
            
            return shares;
        }).reduce((sum, shares) => sum + shares, 0);
        console.log('Total SAFE Shares:', safeShares);

        // Convert Notes
        const noteShares = entry.instruments.convertibleNote.map(note => {
            console.log('\nProcessing Note:', note);
            
            if (!note.valuationCap) {
                console.log('No valuation cap, skipping...');
                
                return 0;
            }
            
            // Calculate total amount including interest
            const totalAmount = note.invested + note.accruedInterest;
            console.log('Total Amount (with interest):', totalAmount);
            
            // Calculate conversion price (lower of discounted price or cap price)
            const discountedPrice = pricePerShare * (1 - note.discountRate / 100);
            const capPrice = note.valuationCap / fullyDilutedShares;
            const conversionPrice = Math.min(discountedPrice, capPrice);
            
            console.log('Valuation Cap:', note.valuationCap);
            console.log('Discounted Price:', discountedPrice);
            console.log('Cap Price:', capPrice);
            console.log('Conversion Price:', conversionPrice);
            
            // Calculate shares
            const shares = Math.floor(totalAmount / conversionPrice);
            console.log('Shares:', shares);
            
            return shares;
        }).reduce((sum, shares) => sum + shares, 0);
        console.log('Total Note Shares:', noteShares);

        // Total shares for this entry
        const totalShares = equityShares + safeShares + noteShares;
        console.log('Total Shares for Entry:', totalShares);

        return {
            ...entry,
            shares: totalShares,
            instruments: {
                ...entry.instruments,
                safe: entry.instruments.safe.map(safe => {
                    if (!safe.valuationCap) return { ...safe, potentialShares: 0 };
                    const discountedPrice = pricePerShare * (1 - safe.discountRate / 100);
                    const capPrice = safe.valuationCap / fullyDilutedShares;
                    const conversionPrice = Math.min(discountedPrice, capPrice);
                    
                    return {
                        ...safe,
                        potentialShares: Math.floor(safe.invested / conversionPrice)
                    };
                }),
                convertibleNote: entry.instruments.convertibleNote.map(note => {
                    if (!note.valuationCap) return { ...note, potentialShares: 0 };
                    const totalAmount = note.invested + note.accruedInterest;
                    const discountedPrice = pricePerShare * (1 - note.discountRate / 100);
                    const capPrice = note.valuationCap / fullyDilutedShares;
                    const conversionPrice = Math.min(discountedPrice, capPrice);
                    
                    return {
                        ...note,
                        potentialShares: Math.floor(totalAmount / conversionPrice)
                    };
                })
            }
        };
    });

    // Calculate total shares including stakeholders
    const totalShares = convertedEntries.reduce(
        (sum, entry) => sum + entry.shares,
        stakeholderShares
    );
    console.log('\nFinal Total Shares:', totalShares);

    // Calculate ownership percentages
    const finalEntries = convertedEntries.map(entry => ({
        ...entry,
        ownership: (entry.shares / totalShares) * 100
    }));
    console.log('Final Entries:', finalEntries);

    return finalEntries;
};

export const ConvertedSharesView = ({ capTable }: ConvertedSharesViewProps) => {
    const convertedEntries = calculateConvertedShares(capTable);

    // Calculate totals
    const totalShares = convertedEntries.reduce((sum, entry) => sum + entry.shares, 0) + 
        capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0);
    
    const totalValue = convertedEntries.reduce((sum, entry) => sum + entry.value, 0);
    
    const totalSafeShares = convertedEntries.reduce(
        (sum, entry) => sum + entry.instruments.safe.reduce(
            (safeSum, safe) => safeSum + (safe.potentialShares || 0),
            0
        ),
        0
    );
    
    const totalNoteShares = convertedEntries.reduce(
        (sum, entry) => sum + entry.instruments.convertibleNote.reduce(
            (noteSum, note) => noteSum + (note.potentialShares || 0),
            0
        ),
        0
    );

    return (
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
                        <TableCell className="text-right">$0</TableCell>
                        <TableCell className="text-right">0</TableCell>
                        <TableCell className="text-right">0</TableCell>
                    </TableRow>
                ))}
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
                            {Math.round(entry.instruments.safe.reduce(
                                (sum, safe) => sum + (safe.potentialShares || 0),
                                0
                            )).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                            {Math.round(entry.instruments.convertibleNote.reduce(
                                (sum, note) => sum + (note.potentialShares || 0),
                                0
                            )).toLocaleString()}
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
    );
}; 