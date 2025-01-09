"use client";

import { createRoundAction } from "@/lib/actions/round-actions";
import {
    roundSchema,
    roundTypeEnum,
    roundStatusEnum,
} from "@/lib/schemas/round-schemas";
import { SERVER_ERRORS } from "@/lib/types/server-error";
import {
    Button,
    Dialog,
    DialogContent,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast,
} from "@roxom-markets/spark-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { Plus } from "lucide-react";
import { useState } from "react";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import type { z } from "zod";

type FormData = z.infer<typeof roundSchema>;

const ROUND_TYPES = roundTypeEnum.options;
const ROUND_STATUS = roundStatusEnum.options;

export const AddRoundModal = () => {
    const [open, setOpen] = useState(false);
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
        [],
    );
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(roundSchema),
        defaultValues: {
            companyId: "",
            name: "",
            type: "SEED",
            preMoneyValuation: 0,
            date: new Date(),
            status: "DRAFT",
        },
    });

    const { execute, status } = useAction(createRoundAction, {
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Round created successfully",
                variant: "success",
            });
            form.reset();
            setOpen(false);
            router.refresh();
        },
        onError: (error) => {
            console.error("Error creating round:", error);
            const errorMessage =
                error.error?.serverError === SERVER_ERRORS.UNAUTHORIZED
                    ? "You are not authorized to create rounds"
                    : error.error?.serverError === SERVER_ERRORS.DATABASE_ERROR
                      ? "Failed to create round due to a database error"
                      : "Something went wrong";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const loadCompanies = async () => {
        try {
            const result = await listCompaniesAction();

            if (
                result &&
                !result.validationErrors &&
                !result.serverError &&
                result.data
            ) {
                setCompanies(result.data);
            }
        } catch (error) {
            console.error("Error loading companies:", error);
            toast({
                title: "Error",
                description: "Failed to load companies",
                variant: "destructive",
            });
        }
    };

    const onSubmit = form.handleSubmit(async (data) => {
        console.log("Form data being submitted:", data);

        try {
            await execute(data);
        } catch (error) {
            console.error("Form submission error:", error);
        }
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);

                if (newOpen) {
                    loadCompanies();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Add Round
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Funding Round</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <FormField
                            control={form.control}
                            name="companyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a company" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem
                                                    key={company.id}
                                                    value={company.id}
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Round Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Series A"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Round Type</FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a round type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROUND_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type.replace("_", " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preMoneyValuation"
                            render={({
                                field: { onChange, value, ...field },
                            }) => (
                                <FormItem>
                                    <FormLabel>Pre-Money Valuation</FormLabel>
                                    <FormControl>
                                        <Input
                                            min={0}
                                            step={1}
                                            type="number"
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => {
                                                const value = parseInt(
                                                    e.target.value,
                                                );
                                                onChange(
                                                    isNaN(value) ? 0 : value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Round Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value
                                                        ? new Date(
                                                              e.target.value,
                                                          )
                                                        : null,
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROUND_STATUS.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={status === "executing"}
                                type="submit"
                            >
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
