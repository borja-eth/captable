"use client";

import { createScenarioAction } from "@/lib/actions/scenario-actions";
import { simpleScenarioSchema } from "@/lib/schemas/scenario-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    useToast,
} from "@roxom-markets/spark-ui";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { SERVER_ERRORS } from "@/lib/types/server-error";

interface CreateScenarioModalProps {
    companyId: string;
}

type FormData = z.infer<typeof simpleScenarioSchema>;

export const CreateScenarioModal = ({ companyId }: CreateScenarioModalProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    
    const form = useForm<FormData>({
        resolver: zodResolver(simpleScenarioSchema),
        defaultValues: {
            companyId,
            newInvestment: 0,
            premoneyValuation: 0,
        },
    });

    const { execute: createScenario, status } = useAction(createScenarioAction, {
        onSuccess: () => {
            form.reset();
            setOpen(false);
            router.refresh();
            toast({
                title: "Success",
                description: "Scenario created successfully",
                variant: "success",
            });
        },
        onError: ({ error }) => {
            const errorMessage = error.serverError === SERVER_ERRORS.UNAUTHORIZED
                ? "You don't have permission to create scenarios"
                : "Failed to create scenario";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const onSubmit = form.handleSubmit((data) => {
        createScenario(data);
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    New Scenario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Scenario</DialogTitle>
                    <DialogDescription>
                        Model a new investment scenario for your company
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newInvestment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Investment</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter investment amount"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="premoneyValuation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pre-money Valuation</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter pre-money valuation"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={status === "executing"}>
                                Create Scenario
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 