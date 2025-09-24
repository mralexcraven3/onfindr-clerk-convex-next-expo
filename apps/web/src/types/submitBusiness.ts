// types/submitBusiness.ts
import { z } from 'zod';

export const SubmitBusinessFormSchema = z.object({
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
  
  // Optional time fields
  openingTime: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val.trim());
    }, 'Please enter opening time in HH:MM format (24-hour)'),
  
  closingTime: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val.trim());
    }, 'Please enter closing time in HH:MM format (24-hour)'),
}).transform((val) => {
  // Clean up data on submission
  return {
    ...val,
    name: val.name ? val.name.trim() : '',
    description: val.description ? val.description.trim() : '',
    email: val.email ? val.email.trim() : '',
    openingTime: val.openingTime ? val.openingTime.trim() : '',
    closingTime: val.closingTime ? val.closingTime.trim() : '',
  };
});

export type SubmitBusinessFormData = z.infer<typeof SubmitBusinessFormSchema>;

export const defaultSubmitBusinessFormData: SubmitBusinessFormData = {
  name: '',
  description: '',
  email: '',
  openingTime: '',
  closingTime: '',
};