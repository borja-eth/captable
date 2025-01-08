"use client";

import { listInvestorsAction, deleteInvestorAction } from "@/lib/actions/investor-actions";
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
} from "@roxom-markets/spark-ui";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { InvestorUpdateDialog } from "./investor-update-dialog";
import type { Investor } from "@/lib/types/investor-types";

export const InvestorList = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteInvestorAction({ id });

      if (result && !result.validationErrors && !result.serverError) {
        toast({
          title: "Investor deleted",
          description: "The investor has been deleted successfully.",
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

  const loadInvestors = async () => {
    try {
      const result = await listInvestorsAction({});

      if (result && !result.validationErrors && !result.serverError && result.data) {
        setInvestors(result.data);
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
    loadInvestors();
  }, []);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((investor) => (
            <TableRow key={investor.id}>
              <TableCell className="font-medium">{investor.name}</TableCell>
              <TableCell>{investor.type}</TableCell>
              <TableCell>{investor.email}</TableCell>
              <TableCell>{investor.phone}</TableCell>
              <TableCell>{investor.address}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSelectedInvestor(investor)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={isDeleting}
                      onClick={() => handleDelete(investor.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {investors.length === 0 && (
            <TableRow>
              <TableCell className="text-center py-4 text-muted-foreground" colSpan={6}>
                No investors found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <InvestorUpdateDialog
        investor={selectedInvestor}
        onClose={() => setSelectedInvestor(null)}
      />
    </>
  );
}; 