// components/SubmitBusinessForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useForm, type UseFormProps, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Mail, Phone, Globe, FileText } from 'lucide-react';
import { 
  type SubmitBusinessFormData, 
  SubmitBusinessFormSchema, 
  defaultSubmitBusinessFormData 
} from '@/types/business';
import { cn } from '@/lib/utils';

interface SubmitBusinessFormProps {
  onSubmit?: (data: SubmitBusinessFormData) => Promise<void>;
  initialData?: Partial<SubmitBusinessFormData>;
  isLoading?: boolean;
}

const formOptions: UseFormProps<SubmitBusinessFormData> = {
  resolver: zodResolver(SubmitBusinessFormSchema) as any, // Type assertion as temporary fix
  defaultValues: defaultSubmitBusinessFormData,
};

const SubmitBusinessForm: React.FC<SubmitBusinessFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SubmitBusinessFormData>(formOptions);

  const onSubmitHandler: SubmitHandler<SubmitBusinessFormData> = async (data) => {
    if (!onSubmit) return;

    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success('Business information submitted successfully!');
        form.reset();
      } catch (error) {
        toast.error('Failed to submit information. Please try again.');
        console.error('Submission error:', error);
      }
    });
  };

  // Update default values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...defaultSubmitBusinessFormData,
        ...initialData,
      });
    }
  }, [initialData, form]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Submit Business Information</CardTitle>
          </div>
          <CardDescription>
            Please provide your business details. All fields are required.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
              {/* Business Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Business Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your business, services, and what makes you unique..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of your business (10-500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="business@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your primary business email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your business phone number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Opening Time *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="09:00"
                          {...field}
                          className="pr-10"
                        />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g., 09:00, 14:30)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Closing Time *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="17:00"
                          {...field}
                          className="pr-10"
                        />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g., 17:00, 21:30)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.example.com"
                        {...field}
                        className={field.value ? 'text-blue-600' : ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Your business website URL (must include https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isPending || isLoading || !form.formState.isValid}
                  className="w-full max-w-sm"
                  size="lg"
                >
                  {isPending || isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Business Information
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBusinessForm;