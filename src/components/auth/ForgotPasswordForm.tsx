import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit?: (values: ForgotPasswordFormValues) => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

const ForgotPasswordForm = ({
  onSubmit = () => {},
  onBack = () => {},
  isLoading = false,
  error = "",
  success = "",
}: ForgotPasswordFormProps) => {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    onSubmit(values);
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
        Reset Password
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Enter your email address and we'll send you a link to reset your
        password
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full flex items-center justify-center mt-4 text-blue-600 dark:text-blue-400"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
