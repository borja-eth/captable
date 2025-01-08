"use client";

import { createCompanyAction } from "@/lib/actions/company-actions";
import { companySchema } from "@/lib/schemas/company-schemas";
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
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast
} from "@roxom-markets/spark-ui";
import { CalendarIcon } from "lucide-react";
import type { z } from "zod";
import { cn } from "@/lib/utils/classnames";

type FormData = z.infer<typeof companySchema>;

export const CompanyForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(companySchema),
  });

  const { execute, status } = useAction(createCompanyAction, {
    onSuccess: () => {
      toast({
        title: "Company created",
        description: "Company has been created successfully",
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
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="incorporationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Incorporation Date</FormLabel>
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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

        <Button disabled={status === "executing"} type="submit">
          Create Company
        </Button>
      </form>
    </Form>
  );
}; 