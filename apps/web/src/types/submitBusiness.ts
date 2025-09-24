// types/submitBusiness.ts
import { z } from 'zod';

export const SubmitBusinessFormSchema = z.object({
  name: z.string()
    .min(1, 'Business name is required')
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .refine((val) => {
      const trimmed = val.trim();
      // Allow names with only spaces if they pass length check after trim
      return trimmed.length >= 2;
    }, 'Business name cannot be only whitespace'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .refine((val) => {
      const trimmed = val.trim();
      // Allow descriptions with spaces but not only whitespace
      return trimmed.length >= 10;
    }, 'Description cannot be only whitespace'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  // Optional fields - validate format but don't require presence
  openingTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM format, 24-hour)')
    .optional()
    .or(z.literal('')),
  closingTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM format, 24-hour)')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(
      /^(\+44\s?7\d{3}|\(?07\d{3}\)?\s?\d{3}\s?\d{3}|7\d{3}\s?\d{3}\s?\d{3})$/, 
      'Please enter a valid UK phone number (e.g., +44 7123 456789, 07123 456789, or 07123456789)'
    )
    .optional()
    .or(z.literal('')),
  website: z.string()
    .min(3, 'Website must be at least 3 characters')
    .max(100, 'Website cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.?$/,
      "Please enter a valid domain name (e.g., example.com, www.example.co.uk)"
    )
    .optional()
    .or(z.literal('')),
}).transform((val) => {
  // Final cleanup - only trim leading/trailing whitespace for submission
  return {
    ...val,
    name: val.name ? val.name.trim() : '',
    description: val.description ? val.description.trim() : '',
    email: val.email ? val.email.trim() : '',
    phone: val.phone ? val.phone.trim() : '',
    website: val.website ? val.website.trim().replace(/^www\./i, '') : '',
  };
});

export type SubmitBusinessFormData = z.infer<typeof SubmitBusinessFormSchema>;

export const defaultSubmitBusinessFormData: SubmitBusinessFormData = {
  name: '',
  description: '',
  email: '',
  openingTime: '',
  closingTime: '',
  phone: '',
  website: '',
};