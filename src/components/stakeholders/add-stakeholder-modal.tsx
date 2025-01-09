"use client";

import { createStakeholderAction } from "@/lib/actions/stakeholder-actions";
import { stakeholderSchema } from "@/lib/schemas/stakeholder-schemas";
import { StakeholderRole, VestingScheduleType } from "@/lib/types/stakeholder-types";
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

interface AddStakeholderModalProps {
    companyId?: string;
    trigger?: React.ReactNode;
}

export const AddStakeholderModal = ({ companyId, trigger }: AddStakeholderModalProps) => {
    const [open, setOpen] = useState(false);
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(stakeholderSchema),
        defaultValues: {
            companyId: companyId || "",
            name: "",
            email: "",
            role: StakeholderRole.FOUNDER,
            title: "",
            sharesGranted: 0,
            vestingSchedule: {
                type: VestingScheduleType.STANDARD_4_YEARS,
                startDate: new Date(),
                cliffMonths: 12,
                vestingMonths: 48,
                initialVestingPercentage: 0,
            },
        },
    });

    const { execute, status } = useAction(createStakeholderAction, {
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Stakeholder created successfully",
                variant: "success",
            });
            form.reset();
            setOpen(false);
            router.refresh();
        },
        onError: (error) => {
            console.error("Error creating stakeholder:", error);
            const errorMessage = error.error?.serverError === SERVER_ERRORS.UNAUTHORIZED
                ? "You are not authorized to create stakeholders"
                : error.error?.serverError === SERVER_ERRORS.DATABASE_ERROR
                ? "Failed to create stakeholder due to a database error"
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
            
            if (result && !result.validationErrors && !result.serverError && result.data) {

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
        
        <Dialog open={open} onOpenChange={(newOpen) => {
            
            setOpen(newOpen);
            
            if (newOpen && !companyId) {

                loadCompanies();
            }
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 size-4" />
                        Add Stakeholder
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Stakeholder</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {!companyId && (
                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a company" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="John Doe" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="john@example.com" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={StakeholderRole.FOUNDER}>
                                                Founder
                                            </SelectItem>
                                            <SelectItem value={StakeholderRole.ADVISOR}>
                                                Advisor
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="CEO" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sharesGranted"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Shares Granted</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            step={1}
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vestingSchedule.type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vesting Schedule Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a vesting schedule" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={VestingScheduleType.STANDARD_4_YEARS}>
                                                Standard 4 Years
                                            </SelectItem>
                                            <SelectItem value={VestingScheduleType.CUSTOM}>
                                                Custom
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vestingSchedule.startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vesting Start Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vestingSchedule.cliffMonths"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Cliff Period (months)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={48}
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vestingSchedule.vestingMonths"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Vesting Period (months)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="vestingSchedule.initialVestingPercentage"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Initial Vesting Percentage</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={status === "executing"}>
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 