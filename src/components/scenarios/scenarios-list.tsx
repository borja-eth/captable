"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Skeleton,
    useToast,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@roxom-markets/spark-ui";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { deleteScenarioAction } from "@/lib/actions/scenario-actions";
import { useAction } from "next-safe-action/hooks";
import type { Scenario } from "@/lib/types/scenario-types";

interface ScenariosListProps {
    scenarios: Scenario[];
    isLoading?: boolean;
}

export const ScenariosList = ({ scenarios, isLoading }: ScenariosListProps) => {
    const router = useRouter();
    const { toast } = useToast();

    const { execute: deleteScenario } = useAction(deleteScenarioAction, {
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Scenario deleted successfully",
                variant: "success",
            });
            router.refresh();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.error.serverError as string || "Failed to delete scenario",
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (scenarios.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground">
                No scenarios found. Create your first scenario to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Pre-money</TableHead>
                        <TableHead>Post-money</TableHead>
                        <TableHead>Share Price</TableHead>
                        <TableHead>New Shares</TableHead>
                        <TableHead>Total Shares</TableHead>
                        <TableHead>Dilution</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scenarios.map((scenario) => {
                        const stakeholderShares = scenario.result.stakeholders.reduce(
                            (sum, stakeholder) => sum + (stakeholder.currentShares ?? 0),
                            0
                        );
                        
                        const investorShares = scenario.result.investors.reduce(
                            (sum, investor) => sum + (investor.totalShares ?? 0),
                            0
                        );
                        
                        const totalShares = stakeholderShares + investorShares;

                        return (
                            <TableRow key={scenario.id}>
                                <TableCell>
                                    {new Date(scenario.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(Number(scenario.newInvestment))}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(Number(scenario.premoneyValuation))}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(scenario.result.postmoneyValuation)}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(scenario.result.newSharePrice)}
                                </TableCell>
                                <TableCell>{scenario.result.newShares.toLocaleString()}</TableCell>
                                <TableCell>{totalShares.toLocaleString()}</TableCell>
                                <TableCell>{scenario.result.dilution.toFixed(2)}%</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() =>
                                                router.push(
                                                    `/scenarios/${scenario.id}?companyId=${scenario.companyId}`,
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this scenario? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteScenario({ id: scenario.id })}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}; 