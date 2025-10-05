// types/submitBusiness.ts
import { z } from 'zod';

// Define the base shape first
const baseSchema = z.object({
  name: z.string()
    .min(1, 'Business name is required')
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .refine((val) => {
      const trimmed = val.trim();
      return trimmed.length >= 2 && trimmed !== '';
    }, 'Business name cannot consist only of whitespace'),
  
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .refine((val) => {
      const trimmed = val.trim();
      return trimmed.length >= 10 && trimmed !== '';
    }, 'Description cannot consist only of whitespace'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  openingTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter opening time in HH:MM format (24-hour)')
    .optional()
    .or(z.literal('')),
  
  closingTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter closing time in HH:MM format (24-hour)')
    .optional()
    .or(z.literal('')),
});

// Use .strict() to prevent extra fields and maintain type consistency
export const SubmitBusinessFormSchema = baseSchema
  .transform((val) => {
    // Clean up data for submission - ensure all fields are strings
    return {
      name: typeof val.name === 'string' ? val.name.trim() : '',
      description: typeof val.description === 'string' ? val.description.trim() : '',
      email: typeof val.email === 'string' ? val.email.trim() : '',
      openingTime: typeof val.openingTime === 'string' ? val.openingTime.trim() : '',
      closingTime: typeof val.closingTime === 'string' ? val.closingTime.trim() : '',
    };
  });

// Explicitly define the type to match the expected output
export type SubmitBusinessFormData = z.infer<typeof baseSchema>;

// This ensures the type matches what the form expects
export type SubmitBusinessSubmitData = z.infer<typeof SubmitBusinessFormSchema>;

// Default values matching the form data type
export const defaultSubmitBusinessFormData: SubmitBusinessFormData = {
  name: '',
  description: '',
  email: '',
  address: '',
  phone: '',
  website: '',
  openingTime: '',
  closingTime: '',
};
