"use client";

import { Company } from "@/lib/types/company-types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@roxom-markets/spark-ui";
import { StakeholderCreateButton } from "../stakeholders/stakeholder-create-button";
import { StakeholderList } from "../stakeholders/stakeholder-list";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { listStakeholdersByCompanyAction } from "@/lib/actions/stakeholder-actions";
import type { Stakeholder } from "@/lib/types/stakeholder-types";

interface CompanyDetailsProps {
    company: Company;
}

export const CompanyDetails = ({ company }: CompanyDetailsProps) => {
    const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

    useEffect(() => {
        const loadStakeholders = async () => {
            const result = await listStakeholdersByCompanyAction({
                companyId: company.id,
            });

            if (
                result &&
                !result.validationErrors &&
                !result.serverError &&
                result.data
            ) {
                setStakeholders(result.data);
            }
        };

        loadStakeholders();
    }, [company.id]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <span className="font-medium">Name:</span>
                            <span className="ml-2">{company.name}</span>
                        </div>
                        <div>
                            <span className="font-medium">
                                Registration Number:
                            </span>
                            <span className="ml-2">
                                {company.registrationNumber}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">
                                Incorporation Date:
                            </span>
                            <span className="ml-2">
                                {format(company.incorporationDate, "PP")}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">
                                {format(company.createdAt, "PP")}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Last Updated:</span>
                            <span className="ml-2">
                                {format(company.updatedAt, "PP")}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="stakeholders">
                <TabsList>
                    <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                    <TabsTrigger value="rounds">Funding Rounds</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent className="space-y-4" value="stakeholders">
                    <div className="flex justify-end">
                        <StakeholderCreateButton companyId={company.id} />
                    </div>
                    <StakeholderList stakeholders={stakeholders} />
                </TabsContent>
                <TabsContent value="rounds">
                    {/* Funding rounds will go here */}
                </TabsContent>
                <TabsContent value="documents">
                    {/* Documents will go here */}
                </TabsContent>
            </Tabs>
        </div>
    );
};
