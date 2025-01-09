"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
} from "@roxom-markets/spark-ui";
import { useState } from "react";
import { CompanyDetails } from "@/components/companies/company-details";
import { Company } from "@/lib/types/company-types";

interface CompanyDetailsModalProps {
    company: Company;
    trigger?: React.ReactNode;
}

export const CompanyDetailsModal = ({ company, trigger }: CompanyDetailsModalProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" className="w-full justify-start">
                        View Details
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{company.name}</DialogTitle>
                </DialogHeader>
                <CompanyDetails company={company} />
            </DialogContent>
        </Dialog>
    );
}; 