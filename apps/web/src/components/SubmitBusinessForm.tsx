// components/SubmitBusinessForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
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

  const form = useForm<SubmitBusinessFormData>({
    resolver: zodResolver(SubmitBusinessFormSchema as any),
    defaultValues: {
      ...defaultSubmitBusinessFormData,
      ...initialData,
    },
  });

  const onSubmitHandler = async (data: SubmitBusinessFormData) => {
    if (!onSubmit) return;

    startTransition(async () => {
      try {
        const submitData: SubmitBusinessFormData = {
          name: data.name.trim(),
          description: data.description.trim(),
          email: data.email.trim(),
          openingTime: data.openingTime?.trim() || '',
          closingTime: data.closingTime?.trim() || '',
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
            <CardTitle className="text-2xl font-bold">Submit Your Business</CardTitle>
          </div>
          <CardDescription>
            Get featured in our business directory.{' '}
            <span className="font-semibold">Name, description, and email are required.</span>
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
                        placeholder="e.g., ABC Trading Ltd, Smith & Sons Bakery"
                        className={cn(
                          'transition-colors focus-visible:ring-primary',
                          form.formState.errors.name && 
                          'border-destructive focus-visible:ring-destructive'
                        )}
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      Enter your full business name (required, max 100 characters)
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
                        placeholder="Tell us about your business - what you do, who you serve, what makes you unique. Include services offered, location, and any special features..."
                        className={cn(
                          'min-h-[120px] resize-none transition-colors',
                          form.formState.errors.description && 
                          'border-destructive focus-visible:ring-destructive'
                        )}
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      Describe your business in detail (required, 10-500 characters)
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
                        placeholder="contact@yourbusiness.com"
                        className={cn(
                          'transition-colors',
                          form.formState.errors.email && 
                          'border-destructive focus-visible:ring-destructive'
                        )}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.trim())}
                        required
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      Where we can contact you for verification and updates (required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              {/* Operating Hours - OPTIONAL */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Clock className="h-5 w-5 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">Operating Hours</h3>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Help customers know when you're available. These can be updated later.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3" />
                          Opening Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className={cn(
                              'h-10',
                              form.formState.errors.openingTime && 
                              'border-destructive focus-visible:ring-destructive'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs mt-1">
                          Typical opening hour (24-hour format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closingTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3" />
                          Closing Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className={cn(
                              'h-10',
                              form.formState.errors.closingTime && 
                              'border-destructive focus-visible:ring-destructive'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs mt-1">
                          Typical closing hour (24-hour format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  <span className="font-medium">Optional:</span> Leave blank if you operate 24/7 or have variable hours
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  disabled={isPending || isLoading || !isFormValid}
                  className={cn(
                    'w-full max-w-sm px-8 py-3 text-base',
                    'transition-all duration-200 ease-in-out',
                    isFormValid
                      ? 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform'
                      : 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400'
                  )}
                  size="lg"
                >
                  {isPending || isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Submit Business Listing
                    </>
                  )}
                </Button>
              </div>

              {/* Requirements Summary */}
              <div className="pt-6">
                <div className="bg-gradient-to-r from-muted/50 to-background rounded-lg p-4 border">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      What we need from you
                    </h4>
                  </div>
                  <div className="text-xs space-y-1 text-center">
                    <p className="font-medium">
                      <span className="text-destructive">Required</span> ({' '}
                      <span className="text-sm font-normal">3 fields</span>
                      {')'} {/* ✅ Fixed: just the closing parenthesis */}
                    </p>
                    <div className="text-muted-foreground flex flex-col sm:flex-row gap-2 justify-center text-[10px] sm:text-xs">
                      <span>• Business Name</span>
                      <span>• Description</span>
                      <span>• Email Address</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="font-medium text-muted-foreground">
                        <span className="text-foreground">Optional</span> ({' '}
                        <span className="text-sm font-normal">1 section</span>
                        {')'} {/* ✅ Fixed: just the closing parenthesis */}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        • Operating Hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBusinessForm;