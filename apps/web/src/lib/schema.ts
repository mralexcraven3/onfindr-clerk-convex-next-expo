import * as z from "zod"

export const submitBusinessFormSchema = z.object({
  name: z.string().min(1, "This field is required"),
  description: z.string().min(1, "This field is required"),
  email: z.email()
});

export const editBusinessFormSchema = z.object({
  name: z.string().min(1, "This field is required"),
  description: z.string().min(1, "This field is required"),
  email: z.email()
});

export type SubmitBusinessFormValues = z.infer<typeof submitBusinessFormSchema>
export type SubmitBusinessFormInput = z.input<typeof submitBusinessFormSchema>

export type EditBusinessFormValues = z.infer<typeof editBusinessFormSchema>
export type EditBusinessFormInput = z.input<typeof editBusinessFormSchema>