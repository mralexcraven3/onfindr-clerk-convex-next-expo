// components/SubmitBusinessForm.tsx
'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useForm, type UseFormProps } from 'react-hook-form';
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
import { Clock, Mail, Phone, Globe, FileText, Building2 } from 'lucide-react';
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

  // Initialize form with resolver and merge initial data with defaults
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
        // Format data before submission - only trim leading/trailing whitespace
        const submitData: SubmitBusinessFormData = {
          ...data,
          name: data.name ? data.name.trim() : '',
          description: data.description ? data.description.trim() : '',
          email: data.email ? data.email.trim() : '',
          phone: data.phone ? data.phone.trim() : '',
          website: data.website ? data.website.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '') : '',
        };
        
        await onSubmit(submitData);
        toast.success('Business information submitted successfully!');
        form.reset({ ...defaultSubmitBusinessFormData });
      } catch (error) {
        toast.error('Failed to submit information. Please try again.');
        console.error('Submission error:', error);
      }
    });
  };

  // Helper to check if form is valid (only check required fields)
  const isFormValid = form.formState.isValid && 
    Boolean(form.getValues('name')?.trim()) && 
    Boolean(form.getValues('description')?.trim()) && 
    Boolean(form.getValues('email')?.trim());

  // Helper for website display formatting (without affecting form value)
  const formatWebsiteDisplay = useCallback((value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Submit Your Business</CardTitle>
          </div>
          <CardDescription>
            Please provide your business details. <span className="font-medium">Business name, description, and email are required.</span>
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
                      <span>Business Name <span className="text-destructive">*</span></span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your business name (e.g., ABC Trading Ltd)"
                        {...field}
                        className={cn(
                          "transition-colors",
                          form.formState.errors.name && 'border-destructive focus-visible:ring-destructive'
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
                      <span>Business Description <span className="text-destructive">*</span></span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your business, services, and what makes you unique. Include what you offer, your target customers, and your unique selling points..."
                        className="min-h-[120px] resize-none transition-colors"
                        {...field}
                        className={cn(
                          form.formState.errors.description && 'border-destructive focus-visible:ring-destructive'
                        )}
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

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email - REQUIRED */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Email Address <span className="text-destructive">*</span></span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="business@example.com"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.trim())}
                            className={cn(
                              "transition-colors",
                              form.formState.errors.email && 'border-destructive focus-visible:ring-destructive'
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

                  {/* Phone - OPTIONAL */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          UK Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="07123 456789 (optional)"
                            {...field}
                            onChange={(e) => {
                              // Normalize spaces but preserve single spaces for phone numbers
                              const value = e.target.value.replace(/\s{2,}/g, ' ');
                              field.onChange(value);
                            }}
                            className={cn(
                              "transition-colors",
                              form.formState.errors.phone && 'border-destructive focus-visible:ring-destructive'
                            )}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          UK mobile or landline number (optional). Spaces are allowed:
                          <br />
                          <span className="text-muted-foreground">
                            07123 456789, +44 7123 456789, 07123456789
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Website - OPTIONAL */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="example.com (optional)"
                          value={formatWebsiteDisplay(field.value)}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            // Store the raw domain name (without protocol/www)
                            const cleanValue = rawValue.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
                            field.onChange(cleanValue);
                          }}
                          className={cn(
                            "transition-colors",
                            form.formState.errors.website && 'border-destructive focus-visible:ring-destructive',
                            field.value && !form.formState.errors.website ? 'text-blue-600 border-blue-200' : '',
                            'placeholder:text-gray-500'
                          )}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Your business website URL (optional). Enter just the domain name:
                        <br />
                        <span className="text-muted-foreground">
                          example.com, www.example.co.uk, mybusiness.org
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-6" />

              {/* Operating Hours - OPTIONAL */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">Operating Hours (Optional)</h3>
                </div>
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
                              "h-10 transition-colors",
                              form.formState.errors.openingTime && 'border-destructive focus-visible:ring-destructive'
                            )}
                          />
                        </FormControl>
                        <FormDescription className="text-sm">
                          When your business opens (24-hour format: 09:00 = 9:00 AM)
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
                              "h-10 transition-colors",
                              form.formState.errors.closingTime && 'border-destructive focus-visible:ring-destructive'
                            )}
                          />
                        </FormControl>
                        <FormDescription className="text-sm">
                          When your business closes (24-hour format: 17:00 = 5:00 PM)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Operating hours help customers know when you're available. Both fields are optional.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  disabled={isPending || isLoading || !isFormValid}
                  className={cn(
                    "w-full max-w-sm transition-all duration-200 ease-in-out",
                    isFormValid 
                      ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                      : "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                  )}
                  size="lg"
                >
                  {isPending || isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing Submission...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Submit Business Information
                    </>
                  )}
                </Button>
              </div>

              {/* Required Fields Legend
              <div className="text-center pt-6">
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Required Fields:</span> 
                    <span className="text-destructive ml-1">Business Name</span>, 
                    <span className="text-destructive ml-1">Description</span>, 
                    <span className="text-destructive ml-1">Email Address</span>
                    <br />
                    <span className="font-semibold text-foreground">Optional Fields:</span> 
                    Phone Number, Website URL, Operating Hours
                  </p>
                </div>
              </div> */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBusinessForm;