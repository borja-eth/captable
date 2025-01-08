"use client";

import { createRoundAction } from "@/lib/actions/round-actions";
import { roundSchema } from "@/lib/schemas/round-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns";
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
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast
} from "@roxom-markets/spark-ui";
import { CalendarIcon } from "lucide-react";
import type { z } from "zod";
import { cn } from "@/lib/utils/classnames";

type FormData = z.infer<typeof roundSchema>;

interface RoundFormProps {
  companyId: string;
  onSuccess?: () => void;
}

export const RoundForm = ({ companyId, onSuccess }: RoundFormProps) => {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      companyId,
    },
  });

  const { execute, status } = useAction(createRoundAction, {
    onSuccess: () => {
      toast({
        title: "Round created",
        description: "Round has been created successfully",
        variant: "success",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.error.serverError || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    execute(data);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Type</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SEED">Seed</SelectItem>
                  <SelectItem value="SERIES_A">Series A</SelectItem>
                  <SelectItem value="SERIES_B">Series B</SelectItem>
                  <SelectItem value="SERIES_C">Series C</SelectItem>
                  <SelectItem value="SERIES_D">Series D</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preMoneyValuation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pre-Money Valuation</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(Number(e.target.value))}
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
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      variant="outline"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
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
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={status === "executing"} type="submit">
          Create Round
        </Button>
      </form>
    </Form>
  );
}; 