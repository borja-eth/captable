"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button
} from "@roxom-markets/spark-ui";
import { Plus } from "lucide-react";
import { RoundForm } from "./round-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddRoundModalProps {
  companyId: string;
}

export const AddRoundModal = ({ companyId }: AddRoundModalProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Round
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Round</DialogTitle>
        </DialogHeader>
        <RoundForm 
          companyId={companyId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }} 
        />
      </DialogContent>
    </Dialog>
  );
}; 