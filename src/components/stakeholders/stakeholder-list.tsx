"use client";

import { deleteStakeholderAction } from "@/lib/actions/stakeholder-actions";
import type { Stakeholder } from "@/lib/types/stakeholder-types";
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
    useToast
} from "@roxom-markets/spark-ui";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "../ui/confirm-dialog";

interface StakeholderListProps {
    stakeholders: Stakeholder[];
}

export const StakeholderList = ({ stakeholders }: StakeholderListProps) => {
    const router = useRouter();
    const { toast } = useToast();

    const { execute: executeDelete } = useAction(deleteStakeholderAction, {
        onSuccess: () => {
            toast({
                title: "Stakeholder deleted",
                description: "Stakeholder has been deleted successfully",
                variant: "success",
            });
            router.refresh();
        },
        onError: (error) => {
            console.error("Error deleting stakeholder:", error);
            toast({
                title: "Error",
                description: error.error?.serverError || "Failed to delete stakeholder",
                variant: "destructive",
            });
        },
    });

    if (stakeholders.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No stakeholders found
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stakeholders.map((stakeholder) => (
                    <TableRow key={stakeholder.id}>
                        <TableCell>{stakeholder.name}</TableCell>
                        <TableCell>{stakeholder.email}</TableCell>
                        <TableCell>{stakeholder.role}</TableCell>
                        <TableCell>{stakeholder.title}</TableCell>
                        <TableCell className="text-right">
                            {stakeholder.sharesGranted.toLocaleString()}
                        </TableCell>
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
                                            title="Delete Stakeholder"
                                            description={`Are you sure you want to delete ${stakeholder.name}? This action cannot be undone.`}
                                            confirmText="Delete"
                                            trigger={
                                                <div className="w-full flex items-center text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Stakeholder
                                                </div>
                                            }
                                            onConfirm={() => executeDelete({ id: stakeholder.id })}
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