"use client";

import { deleteCompanyAction } from "@/lib/actions/company-actions";
import type { Company } from "@/lib/types/company-types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useRouter } from "next/navigation";
import { AddStakeholderModal } from "../stakeholders/add-stakeholder-modal";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { CompanyDetailsModal } from "./company-details-modal";

interface CompanyListProps {
    companies: Company[];
}

export const CompanyList = ({ companies }: CompanyListProps) => {
    const router = useRouter();
    const { toast } = useToast();

    const { execute: executeDelete } = useAction(deleteCompanyAction, {
        onSuccess: () => {
            toast({
                title: "Company deleted",
                description: "Company has been deleted successfully",
                variant: "success",
            });
            router.refresh();
        },
        onError: (error) => {
            console.error("Error deleting company:", error);
            toast({
                title: "Error",
                description: error.error?.serverError || "Failed to delete company",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="space-y-4">
            {companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No companies found
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Registration Number</TableHead>
                            <TableHead>Incorporation Date</TableHead>
                            <TableHead>Shares</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.registrationNumber}</TableCell>
                                <TableCell>
                                    {new Date(company.incorporationDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{company.shares.toLocaleString()}</TableCell>
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
                                                <CompanyDetailsModal 
                                                    company={company}
                                                    trigger={
                                                        <div className="w-full">
                                                            View Details
                                                        </div>
                                                    }
                                                />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <AddStakeholderModal
                                                    companyId={company.id}
                                                    trigger={<div className="w-full">Add Stakeholder</div>}
                                                />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <ConfirmDialog
                                                    confirmText="Delete"
                                                    description={`Are you sure you want to delete ${company.name}? This action cannot be undone.`}
                                                    title="Delete Company"
                                                    trigger={
                                                        <div className="w-full flex items-center text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Company
                                                        </div>
                                                    }
                                                    onConfirm={() => executeDelete({ id: company.id })}
                                                />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
