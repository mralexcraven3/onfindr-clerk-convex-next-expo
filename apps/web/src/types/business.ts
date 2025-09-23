// types/submitBusiness.ts
import { z } from 'zod';

export const SubmitBusinessFormSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  openingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM format, 24-hour)')
    .min(5, 'Time is required'),
  closingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM format, 24-hour)')
    .min(5, 'Time is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[\d\s\-\(\).]+$/, 'Please enter a valid phone number'),
  website: z
    .string()
    .url('Please enter a valid URL (including https://)')
    .optional()
    .or(z.literal('')),
}).strict(); // Adding .strict() to ensure exact shape

export type SubmitBusinessFormData = z.infer<typeof SubmitBusinessFormSchema>;

export const defaultSubmitBusinessFormData: SubmitBusinessFormData = {
  description: '',
  email: '',
  openingTime: '',
  closingTime: '',
  phone: '',
  website: '',
};