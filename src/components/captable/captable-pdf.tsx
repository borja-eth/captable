"use client";

import type { CapTableSummary } from "@/lib/types/captable-types";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
} from "@react-pdf/renderer";

interface CaptablePDFProps {
    capTable: CapTableSummary;
    showConvertedSafes?: boolean;
}

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    table: {
        width: "100%",
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    totalRow: {
        flexDirection: "row",
        paddingVertical: 5,
        borderTopWidth: 2,
        borderTopColor: "#000",
        fontFamily: "Helvetica-Bold",
    },
    cell: {
        flex: 1,
    },
    rightAligned: {
        textAlign: "right",
    },
    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    summaryItem: {
        width: "25%",
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 10,
        color: "#666",
    },
    summaryValue: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
    },
});

const calculateConvertedShares = (capTable: CapTableSummary) => {
    const stakeholderShares = capTable.stakeholders.reduce(
        (sum, entry) => sum + entry.shares,
        0,
    );

    const convertedEntries = capTable.entries.map((entry) => {
        const safeShares = entry.instruments.safe.reduce(
            (sum, safe) => sum + (safe.potentialShares || 0),
            0,
        );

        const noteShares = entry.instruments.convertibleNote.reduce(
            (sum, note) => sum + (note.potentialShares || 0),
            0,
        );

        return {
            ...entry,
            shares: entry.shares + safeShares + noteShares,
            instruments: {
                safe: entry.instruments.safe,
                convertibleNote: entry.instruments.convertibleNote,
            },
        };
    });

    const totalShares = convertedEntries.reduce(
        (sum, entry) => sum + entry.shares,
        stakeholderShares,
    );

    return convertedEntries.map((entry) => ({
        ...entry,
        ownership: (entry.shares / totalShares) * 100,
    }));
};

export const CaptablePDF = ({ capTable, showConvertedSafes }: CaptablePDFProps) => {
    const convertedEntries = showConvertedSafes
        ? calculateConvertedShares(capTable)
        : capTable.entries;

    const totalShares = showConvertedSafes
        ? convertedEntries.reduce((sum, entry) => sum + entry.shares, 0) +
          capTable.stakeholders.reduce((sum, entry) => sum + entry.shares, 0)
        : capTable.totalShares;

    return (
        <PDFViewer className="w-full h-screen">
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Cap Table Report</Text>

                    {/* Summary Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Shares</Text>
                                <Text style={styles.summaryValue}>
                                    {capTable.totalShares.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Value</Text>
                                <Text style={styles.summaryValue}>
                                    ${capTable.totalValue.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>
                                    {showConvertedSafes
                                        ? "Total Shares (with SAFEs)"
                                        : "Fully Diluted Shares"}
                                </Text>
                                <Text style={styles.summaryValue}>
                                    {Math.round(totalShares).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stakeholders Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Stakeholders</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.cell}>Name</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>Shares</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>Ownership</Text>
                            </View>
                            {capTable.stakeholders.map((entry) => (
                                <View key={entry.stakeholder.id} style={styles.tableRow}>
                                    <Text style={styles.cell}>{entry.stakeholder.name}</Text>
                                    <Text style={[styles.cell, styles.rightAligned]}>
                                        {Math.round(entry.shares).toLocaleString()}
                                    </Text>
                                    <Text style={[styles.cell, styles.rightAligned]}>
                                        {((entry.shares / totalShares) * 100).toFixed(2)}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Investors Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Investors</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.cell}>Investor</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>Shares</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>Ownership</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>Value</Text>
                            </View>
                            {convertedEntries.map((entry) => (
                                <View key={entry.investorId} style={styles.tableRow}>
                                    <Text style={styles.cell}>{entry.investorName}</Text>
                                    <Text style={[styles.cell, styles.rightAligned]}>
                                        {Math.round(entry.shares).toLocaleString()}
                                    </Text>
                                    <Text style={[styles.cell, styles.rightAligned]}>
                                        {entry.ownership.toFixed(2)}%
                                    </Text>
                                    <Text style={[styles.cell, styles.rightAligned]}>
                                        ${entry.value.toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                            <View style={styles.totalRow}>
                                <Text style={styles.cell}>Total</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>
                                    {Math.round(totalShares).toLocaleString()}
                                </Text>
                                <Text style={[styles.cell, styles.rightAligned]}>100.00%</Text>
                                <Text style={[styles.cell, styles.rightAligned]}>
                                    ${capTable.totalValue.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Funding Rounds Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Funding Rounds</Text>
                        {capTable.rounds.map((round) => (
                            <View key={round.id} style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 5 }}>
                                    {round.name}
                                </Text>
                                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                                    <View style={{ width: "25%" }}>
                                        <Text style={styles.summaryLabel}>Date</Text>
                                        <Text>{new Date(round.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ width: "25%" }}>
                                        <Text style={styles.summaryLabel}>Pre-Money</Text>
                                        <Text>${round.preMoney.toLocaleString()}</Text>
                                    </View>
                                    <View style={{ width: "25%" }}>
                                        <Text style={styles.summaryLabel}>Post-Money</Text>
                                        <Text>${round.postMoney.toLocaleString()}</Text>
                                    </View>
                                    <View style={{ width: "25%" }}>
                                        <Text style={styles.summaryLabel}>New Investment</Text>
                                        <Text>${round.newInvestment.toLocaleString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.table}>
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.cell}>Investor</Text>
                                        <Text style={[styles.cell, styles.rightAligned]}>Shares</Text>
                                        <Text style={[styles.cell, styles.rightAligned]}>Ownership</Text>
                                        <Text style={[styles.cell, styles.rightAligned]}>Value</Text>
                                    </View>
                                    {round.entries.map((entry) => (
                                        <View key={entry.investorId} style={styles.tableRow}>
                                            <Text style={styles.cell}>{entry.investorName}</Text>
                                            <Text style={[styles.cell, styles.rightAligned]}>
                                                {Math.round(entry.shares).toLocaleString()}
                                            </Text>
                                            <Text style={[styles.cell, styles.rightAligned]}>
                                                {entry.ownership.toFixed(2)}%
                                            </Text>
                                            <Text style={[styles.cell, styles.rightAligned]}>
                                                ${entry.value.toLocaleString()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </Page>
            </Document>
        </PDFViewer>
    );
}; 