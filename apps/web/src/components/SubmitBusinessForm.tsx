// components/SubmitBusinessForm.tsx
'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Clock, Mail, FileText, Building2 } from 'lucide-react';
import { 
  type SubmitBusinessFormData, 
  SubmitBusinessFormSchema, 
  defaultSubmitBusinessFormData 
} from '@/types/submitBusiness';
import { cn } from '@/lib/utils';

interface SubmitBusinessFormProps {
  onSubmit?: (data: SubmitBusinessFormData) => Promise<void>;
  initialData?: Partial<SubmitBusinessFormData>;
  isLoading?: boolean;
}

const SubmitBusinessForm: React.FC<SubmitBusinessFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [isPending, startTransition] = useTransition();

  // Initialize form with resolver and default values
  const form = useForm<SubmitBusinessFormData>({
    resolver: zodResolver(SubmitBusinessFormSchema),
    defaultValues: {
      ...defaultSubmitBusinessFormData,
      ...initialData,
    },
  });

  const onSubmitHandler = async (data: SubmitBusinessFormData) => {
    if (!onSubmit) return;

    startTransition(async () => {
      try {
        // Format data before submission
        const submitData: SubmitBusinessFormData = {
          ...data,
          name: data.name.trim(),
          description: data.description.trim(),
          email: data.email.trim(),
          openingTime: data.openingTime ? data.openingTime.trim() : '',
          closingTime: data.closingTime ? data.closingTime.trim() : '',
        };
        
        await onSubmit(submitData);
        toast.success('Business information submitted successfully!');
        form.reset(defaultSubmitBusinessFormData);
      } catch (error) {
        toast.error('Failed to submit information. Please try again.');
        console.error('Submission error:', error);
      }
    });
  };

  // Check if required fields are valid
  const isFormValid = form.formState.isValid &&
    Boolean(form.getValues('name')?.trim()) &&
    Boolean(form.getValues('description')?.trim()) &&
    Boolean(form.getValues('email')?.trim());

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Submit Your Business</CardTitle>
          </div>
          <CardDescription>
            Share your business details to get featured in our directory.{' '}
            <span className="font-medium">Business name, description, and email are required.</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
              {/* Business Name - REQUIRED */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>
                        Business Name <span className="text-destructive">*</span>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your business name (e.g., ABC Trading Ltd)"
                        {...field}
                        className={cn(
                          'transition-colors',
                          form.formState.errors.name && 'border-destructive focus-visible:ring-destructive',
                        )}
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      The legal name of your business as registered (required, max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Description - REQUIRED */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>
                        Business Description <span className="text-destructive">*</span>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your business, services, and what makes you unique. Include what you offer, your target customers, and your unique selling points..."
                        className={cn(
                          'min-h-[120px] resize-none transition-colors',
                          form.formState.errors.description && 'border-destructive focus-visible:ring-destructive',
                        )}
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your business (required, 10-500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              {/* Email - REQUIRED */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>
                        Email Address <span className="text-destructive">*</span>
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="business@example.com"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.trim())}
                        className={cn(
                          'transition-colors',
                          form.formState.errors.email && 'border-destructive focus-visible:ring-destructive',
                        )}
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      Your primary business email address for verification and communication (required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              {/* Operating Hours - OPTIONAL */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Operating Hours (Optional)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Help customers find you at the right time. These can be updated later.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Opening Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className={cn(
                              'h-10 transition-colors',
                              form.formState.errors.openingTime && 'border-destructive focus-visible:ring-destructive',
                            )}
                          />
                        </FormControl>
                        <FormDescription className="text-sm">
                          Standard opening time (24-hour format: 09:00 = 9:00 AM)
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
                          Closing Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className={cn(
                              'h-10 transition-colors',
                              form.formState.errors.closingTime && 'border-destructive focus-visible:ring-destructive',
                            )}
                          />
                        </FormControl>
                        <FormDescription className="text-sm">
                          Standard closing time (24-hour format: 17:00 = 5:00 PM)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These hours help customers plan their visits. Leave blank if you operate 24/7 or have variable hours.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  disabled={isPending || isLoading || !isFormValid}
                  className={cn(
                    'w-full max-w-md transition-all duration-200 ease-in-out',
                    isFormValid
                      ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      : 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400',
                  )}
                  size="lg"
                >
                  {isPending || isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Submit Business
                    </>
                  )}
                </Button>
              </div>

              {/* Field Requirements Summary */}
              
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBusinessForm;