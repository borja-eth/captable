"use client";

import { Round } from "@/lib/types/round-types";
import { Routes } from "@/routes";
import { 
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@roxom-markets/spark-ui";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddRoundModal } from "./add-round-modal";

interface RoundListProps {
  rounds: Round[];
  companyId: string;
}

export const RoundList = ({ rounds, companyId }: RoundListProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddRoundModal companyId={companyId} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Pre-Money Valuation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round) => (
              <TableRow key={round.id}>
                <TableCell>{round.name}</TableCell>
                <TableCell>{round.type}</TableCell>
                <TableCell>${round.preMoneyValuation.toLocaleString()}</TableCell>
                <TableCell>{new Date(round.date).toLocaleDateString()}</TableCell>
                <TableCell>{round.status}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => 
                          router.push(Routes.COMPANIES.ROUNDS.DETAIL(companyId, round.id))
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 