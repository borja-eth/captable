"use client";

import { listCompaniesAction } from "@/lib/actions/company-actions";
import type { Company } from "@/lib/types/company-types";
import { Routes } from "@/routes";
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
  useToast,
} from "@roxom-markets/spark-ui";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CompanyListProps {
  companies: Company[];
}

export const CompanyList = ({ companies }: CompanyListProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>(companies);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoading(true);
        const result = await listCompaniesAction();

        if (result && !result.validationErrors && !result.serverError && result.data) {
          setCompanyList(result.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load companies",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, [toast]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8">Loading companies...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyList.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-8 w-8 p-0" variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(Routes.COMPANIES.DETAIL(company.id))}
                      >
                        View details
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