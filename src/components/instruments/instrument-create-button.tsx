"use client";

import { useState } from "react";
import { Button } from "@roxom-markets/spark-ui";
import { Plus } from "lucide-react";
import { InstrumentCreateDialog } from "./instrument-create-dialog";

interface InstrumentCreateButtonProps {
    companyId?: string;
}

export const InstrumentCreateButton = ({
    companyId,
}: InstrumentCreateButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Instrument
            </Button>

            <InstrumentCreateDialog
                companyId={companyId}
                open={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
