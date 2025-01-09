"use client";

import { listCompaniesAction } from "@/lib/actions/company-actions";
import { listScenariosAction } from "@/lib/actions/scenario-actions";
import type { Company } from "@/lib/types/company-types";
import type { Scenario } from "@/lib/types/scenario-types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast,
} from "@roxom-markets/spark-ui";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreateScenarioModal } from "./create-scenario-modal";
import { ScenarioCaptable } from "./scenario-captable";
import { ScenariosList } from "./scenarios-list";

interface ScenariosViewProps {
    companyId?: string;
}

export const ScenariosView = ({ companyId }: ScenariosViewProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");

    const { execute: listScenarios, result, status } = useAction(listScenariosAction, {
        onSuccess: (result) => {
            if (result?.data) {
                setScenarios(result.data as Scenario[]);
            }
        },
    });

    const loadCompanies = useCallback(async () => {
        try {
            const result = await listCompaniesAction();

            if (result && !result.validationErrors && !result.serverError && result.data) {
                setCompanies(result.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load companies",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    useEffect(() => {
        if (companyId) {
            listScenarios({ companyId });
        }
    }, [companyId, listScenarios]);

    useEffect(() => {
        if (scenarios.length > 0 && !selectedScenarioId) {
            setSelectedScenarioId(scenarios[0].id);
        }
    }, [scenarios, selectedScenarioId]);

    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-4 flex-1">
                    <Select
                        value={companyId ?? ""}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString());

                            if (value) {
                                params.set("companyId", value);
                            } else {
                                params.delete("companyId");
                            }
                            router.push(`/scenarios?${params.toString()}`);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!companyId ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Company Selected</CardTitle>
                        <CardDescription>
                            Please select a company to view its scenarios
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Investment Scenarios</CardTitle>
                                    <CardDescription>
                                        Create and manage investment scenarios
                                    </CardDescription>
                                </div>
                                <CreateScenarioModal companyId={companyId} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScenariosList 
                                scenarios={(result?.data || []) as Scenario[]} 
                                isLoading={status === "executing"} 
                            />
                        </CardContent>
                    </Card>
                    {selectedScenario && (
                        <ScenarioCaptable 
                            scenario={selectedScenario.result}
                            premoneyValuation={Number(selectedScenario.premoneyValuation)}
                            scenarios={scenarios}
                            onScenarioChange={setSelectedScenarioId}
                            currentScenarioId={selectedScenarioId}
                        />
                    )}
                </div>
            )}
        </div>
    );
}; 