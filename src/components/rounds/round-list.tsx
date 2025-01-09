"use client";

import { deleteRoundAction, listRoundsAction } from "@/lib/actions/round-actions";
import type { Round } from "@/lib/types/round-types";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    useToast,
} from "@roxom-markets/spark-ui";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../ui/confirm-dialog";

export const RoundList = () => {
    const { toast } = useToast();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRounds = async () => {
        try {
            const result = await listRoundsAction();
            
            if (result && !result.validationErrors && !result.serverError && result.data) {

                setRounds(result.data);
            }
        } catch (error) {
            console.error("Error loading rounds:", error);
            toast({
                title: "Error",
                description: "Failed to load rounds",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRounds();
    }, []);

    const { execute: executeDelete } = useAction(deleteRoundAction, {
        onSuccess: () => {
            toast({
                title: "Round deleted",
                description: "Round has been deleted successfully",
                variant: "success",
            });
            loadRounds();
        },
        onError: (error) => {
            console.error("Error deleting round:", error);
            toast({
                title: "Error",
                description: error.error?.serverError || "Failed to delete round",
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Loading rounds...
            </div>
        );
    }

    if (rounds.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No rounds found
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Round Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Pre-Money Valuation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rounds.map((round) => (
                    <TableRow key={round.id}>
                        <TableCell>{round.company?.name || `Company ${round.companyId}`}</TableCell>
                        <TableCell>{round.name}</TableCell>
                        <TableCell>{round.type.replace("_", " ")}</TableCell>
                        <TableCell>{new Date(round.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            ${round.preMoneyValuation.toLocaleString()}
                        </TableCell>
                        <TableCell>{round.status}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="h-8 w-8 p-0"
                                        variant="ghost"
                                    >
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <ConfirmDialog
                                            title="Delete Round"
                                            description={`Are you sure you want to delete ${round.name}? This action cannot be undone.`}
                                            confirmText="Delete"
                                            trigger={
                                                <div className="w-full flex items-center text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Round
                                                </div>
                                            }
                                            onConfirm={() => executeDelete({ id: round.id })}
                                        />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
