"use client";

import { useState } from "react";
import { Button } from "@roxom-markets/spark-ui";
import { Plus } from "lucide-react";
import { InvestorCreateDialog } from "./investor-create-dialog";

export const InvestorCreateButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Investor
            </Button>

            <InvestorCreateDialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
