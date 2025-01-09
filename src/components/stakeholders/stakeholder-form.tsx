"use client";

import { createStakeholderAction } from "@/lib/actions/stakeholder-actions";
import { stakeholderSchema } from "@/lib/schemas/stakeholder-schemas";
import { StakeholderRole, VestingScheduleType } from "@/lib/types/stakeholder-types";
import { SERVER_ERRORS } from "@/lib/types/server-error";
import {
  Button,
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

interface StakeholderFormProps {
  companyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StakeholderForm = ({ companyId, onSuccess, onCancel }: StakeholderFormProps) => {
  const router = useRouter();
  const { toast } = useToast();

  console.log("Company ID:", companyId);

  const form = useForm({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: {
      companyId,
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
      console.log("Stakeholder created successfully");
      toast({
        title: "Success",
        description: "Stakeholder created successfully",
        variant: "success",
      });
      form.reset();
      onSuccess?.();
      router.refresh();
    },
    onError: (error) => {
      console.error("Error creating stakeholder:", error);
      console.error("Error details:", {
        serverError: error.error?.serverError,
        validationErrors: error.error?.validationErrors,
      });
      toast({
        title: "Error",
        description: error.error?.serverError === SERVER_ERRORS.UNAUTHORIZED 
          ? "You are not authorized to create stakeholders"
          : "Failed to create stakeholder",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    console.log("Form data being submitted:", data);
    
    try {
      await execute(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shares Granted</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
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
                  {...field}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliff Period (months)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="48"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vestingSchedule.vestingMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vesting Period (months)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  max="60"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vestingSchedule.initialVestingPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Vesting Percentage</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="100"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={status === "executing"}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}; 