"use client";

import { createInstrumentAction } from "@/lib/actions/instrument-actions";
import { listInvestorsAction } from "@/lib/actions/investor-actions";
import { listRoundsByCompanyAction } from "@/lib/actions/round-actions";
import { instrumentSchema } from "@/lib/schemas/instrument-schemas";
import { useToast } from "@roxom-markets/spark-ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateInstrumentInput } from "@/lib/types/instrument-types";
import type { Investor } from "@/lib/types/investor-types";
import type { Round } from "@/lib/types/round-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@roxom-markets/spark-ui";
import { useEffect, useState } from "react";

interface InstrumentCreateDialogProps {
    open: boolean;
    onClose: () => void;
    companyId?: string;
}

export const InstrumentCreateDialog = ({
    open,
    onClose,
    companyId,
}: InstrumentCreateDialogProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);

    const form = useForm<CreateInstrumentInput>({
        resolver: zodResolver(instrumentSchema),
        defaultValues: {
            type: "EQUITY",
            roundId: "",
            investorId: "",
            amount: 0,
            sharePrice: 0,
            shareCount: 0,
            shareClass: "COMMON",
        },
    });

    // Reset form with appropriate default values when type changes
    useEffect(() => {
        const type = form.watch("type");
        const commonFields = {
            roundId: form.getValues("roundId"),
            investorId: form.getValues("investorId"),
            amount: form.getValues("amount"),
        };

        switch (type) {
            case "EQUITY":
                form.reset({
                    ...commonFields,
                    type: "EQUITY",
                    sharePrice: 0,
                    shareCount: 0,
                    shareClass: "COMMON",
                });
                break;
            case "SAFE":
                form.reset({
                    ...commonFields,
                    type: "SAFE",
                    valuationCap: 0,
                    discountRate: 0,
                });
                break;
            case "CONVERTIBLE_NOTE":
                form.reset({
                    ...commonFields,
                    type: "CONVERTIBLE_NOTE",
                    conversionCap: 0,
                    discountRate: 0,
                    interestRate: 0,
                    maturityDate: new Date(),
                });
                break;
        }
    }, [form.watch("type")]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load investors
                const investorsResult = await listInvestorsAction({});

                if (
                    investorsResult &&
                    !investorsResult.validationErrors &&
                    !investorsResult.serverError &&
                    investorsResult.data
                ) {
                    setInvestors(investorsResult.data);
                }

                // Load rounds if companyId is provided
                if (companyId) {
                    const roundsResult = await listRoundsByCompanyAction({
                        companyId,
                    });

                    if (
                        roundsResult &&
                        !roundsResult.validationErrors &&
                        !roundsResult.serverError &&
                        roundsResult.data
                    ) {
                        setRounds(roundsResult.data);
                    }
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load form data",
                    variant: "destructive",
                });
            }
        };

        if (open) {
            loadData();
        }
    }, [open, companyId, toast]);

    const onSubmit = async (data: CreateInstrumentInput) => {
        try {
            setIsSubmitting(true);
            await createInstrumentAction(data);
            toast({
                title: "Success",
                description: "Instrument created successfully",
                variant: "success",
            });
            form.reset();
            onClose();
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const instrumentType = form.watch("type");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Instrument</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select instrument type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="EQUITY">
                                                Equity
                                            </SelectItem>
                                            <SelectItem value="SAFE">
                                                SAFE
                                            </SelectItem>
                                            <SelectItem value="CONVERTIBLE_NOTE">
                                                Convertible Note
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roundId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Round</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a round" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rounds.map((round) => (
                                                <SelectItem
                                                    key={round.id}
                                                    value={round.id}
                                                >
                                                    {round.name} ({round.type})
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
                            name="investorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Investor</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an investor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {investors.map((investor) => (
                                                <SelectItem
                                                    key={investor.id}
                                                    value={investor.id}
                                                >
                                                    {investor.name} (
                                                    {investor.type})
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) =>
                                                field.onChange(
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {instrumentType === "EQUITY" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="sharePrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Share Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="shareCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Share Count</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="shareClass"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Share Class</FormLabel>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select share class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="COMMON">
                                                        Common
                                                    </SelectItem>
                                                    <SelectItem value="PREFERRED">
                                                        Preferred
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {instrumentType === "SAFE" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="valuationCap"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valuation Cap</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="discountRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Discount Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {instrumentType === "CONVERTIBLE_NOTE" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="conversionCap"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Conversion Cap
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="discountRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Discount Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="interestRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Interest Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
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
                                    name="maturityDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maturity Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    value={
                                                        field.value
                                                            ? field.value
                                                                  .toISOString()
                                                                  .split("T")[0]
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            new Date(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button disabled={isSubmitting} type="submit">
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
