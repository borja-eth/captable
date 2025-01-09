"use client";

import {
    listInstrumentsByRoundAction,
    deleteInstrumentAction,
} from "@/lib/actions/instrument-actions";
import { listRoundsByCompanyAction } from "@/lib/actions/round-actions";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import { useToast } from "@roxom-markets/spark-ui";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@roxom-markets/spark-ui";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { InstrumentUpdateDialog } from "./instrument-update-dialog";
import type { Instrument } from "@/lib/types/instrument-types";
import type { Round } from "@/lib/types/round-types";
import type { Company } from "@/lib/types/company-types";

export const InstrumentList = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [selectedInstrument, setSelectedInstrument] =
        useState<Instrument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<string>("");

    const companyId = searchParams.get("companyId");

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            const result = await deleteInstrumentAction({ id });

            if (result && !result.validationErrors && !result.serverError) {
                toast({
                    title: "Instrument deleted",
                    description:
                        "The instrument has been deleted successfully.",
                    variant: "success",
                });
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const loadCompanies = async () => {
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
    };

    const loadRounds = async () => {
        if (!companyId) return;

        try {
            const result = await listRoundsByCompanyAction({ companyId });

            if (
                result &&
                !result.validationErrors &&
                !result.serverError &&
                result.data
            ) {
                setRounds(result.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load rounds",
                variant: "destructive",
            });
        }
    };

    const loadInstruments = async () => {
        if (!selectedRoundId) {
            setInstruments([]);

            return;
        }

        try {
            const result = await listInstrumentsByRoundAction({
                roundId: selectedRoundId,
            });

            if (
                result &&
                !result.validationErrors &&
                !result.serverError &&
                result.data
            ) {
                setInstruments(result.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        loadRounds();
        setSelectedRoundId("");
    }, [companyId]);

    useEffect(() => {
        loadInstruments();
    }, [selectedRoundId]);

    return (
        <>
            <div className="space-y-4">
                <div>
                    <Select
                        value={companyId ?? ""}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(
                                searchParams.toString(),
                            );

                            if (value) {
                                params.set("companyId", value);
                            } else {
                                params.delete("companyId");
                            }
                            router.push(`/instruments?${params.toString()}`);
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
                </div>

                {companyId && (
                    <div>
                        <Select
                            value={selectedRoundId}
                            onValueChange={setSelectedRoundId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a round" />
                            </SelectTrigger>
                            <SelectContent>
                                {rounds.map((round) => (
                                    <SelectItem key={round.id} value={round.id}>
                                        {round.name} ({round.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {selectedRoundId ? (
                <Table className="mt-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Investor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[70px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instruments.map((instrument) => (
                            <TableRow key={instrument.id}>
                                <TableCell className="font-medium">
                                    {instrument.type}
                                </TableCell>
                                <TableCell>{instrument.investorId}</TableCell>
                                <TableCell>
                                    ${instrument.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {instrument.type === "EQUITY" && (
                                        <>
                                            {instrument.shareCount} shares at $
                                            {instrument.sharePrice}/share (
                                            {instrument.shareClass})
                                        </>
                                    )}
                                    {instrument.type === "SAFE" && (
                                        <>
                                            Cap: $
                                            {instrument.valuationCap?.toLocaleString()}
                                            , Discount:{" "}
                                            {instrument.discountRate}%
                                        </>
                                    )}
                                    {instrument.type === "CONVERTIBLE_NOTE" && (
                                        <>
                                            Interest: {instrument.interestRate}
                                            %, Cap: $
                                            {instrument.conversionCap?.toLocaleString()}
                                            , Discount:{" "}
                                            {instrument.discountRate}%
                                        </>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className="h-8 w-8 p-0"
                                                variant="ghost"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setSelectedInstrument(
                                                        instrument,
                                                    )
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                disabled={isDeleting}
                                                onClick={() =>
                                                    handleDelete(instrument.id)
                                                }
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {instruments.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="text-center py-4 text-muted-foreground"
                                    colSpan={5}
                                >
                                    No instruments found for this round
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    {companyId
                        ? "Please select a round to view its instruments"
                        : "Please select a company to view its instruments"}
                </div>
            )}

            <InstrumentUpdateDialog
                instrument={selectedInstrument}
                onClose={() => setSelectedInstrument(null)}
            />
        </>
    );
};
