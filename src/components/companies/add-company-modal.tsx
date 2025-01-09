"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
} from "@roxom-markets/spark-ui";
import { Plus } from "lucide-react";
import { CompanyForm } from "./company-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const AddCompanyModal = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Add Company
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Company</DialogTitle>
                </DialogHeader>
                <CompanyForm
                    onSuccess={() => {
                        setOpen(false);
                        router.refresh();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};
