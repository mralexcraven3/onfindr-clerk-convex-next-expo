import { submitBusinessFormSchema } from '../lib/schema'
import { useAppForm } from "@/components/ui/tanstack-form"
import { revalidateLogic } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { SubmitBusiness } from '@/app/actions'

export default function SubmitBusinessForm() {
  const submitBusinessForm = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      email: ""
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: submitBusinessFormSchema,
      onDynamicAsyncDebounceMs: 300
    },
    onSubmit: ({
      value
    }) => {
      toast.success("success");
      console.log(value);
      // call the action
      SubmitBusiness(value);
    },
    onSubmitInvalid({
      formApi
    }) {
      const errorMap = formApi.state.errorMap['onDynamic'] !;
      const inputs = Array.from(document.querySelectorAll("#previewForm input"), ) as HTMLInputElement[];
      let firstInput: HTMLInputElement | undefined;
      for (const input of inputs) {
        if (errorMap[input.name]) {
          firstInput = input;
          break;
        }
      }
      firstInput?.focus();
    }
  });
  return (<div>
    <submitBusinessForm.AppForm>
      <submitBusinessForm.Form>
         <h1 className="text-3xl font-bold">Submit Business</h1>
<submitBusinessForm.AppField name={"name"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"name"}>Business Name *</field.FieldLabel>
                        <Input
                          name={"name"}
                          placeholder=""
                          type="text"
                          
                          value={(field.state.value as string | undefined) ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!!field.state.meta.errors.length}
                        />
                      </field.Field>
                      <field.FieldDescription>Enter your full business name</field.FieldDescription>
                      <field.FieldError />
                    </field.FieldSet>
                  )}
              </submitBusinessForm.AppField>
              
<submitBusinessForm.AppField name={"description"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"description"}>Business Description *</field.FieldLabel>
                        <Input
                          name={"description"}
                          placeholder="Tell us about your business"
                          type="text"
                          
                          value={(field.state.value as string | undefined) ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!!field.state.meta.errors.length}
                        />
                      </field.Field>
                      <field.FieldDescription>Describe your business in detail (required, 10-500 characters)</field.FieldDescription>
                      <field.FieldError />
                    </field.FieldSet>
                  )}
              </submitBusinessForm.AppField>
              
<submitBusinessForm.AppField name={"email"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"email"}>Business Email *</field.FieldLabel>
                        <Input
                          name={"email"}
                          placeholder="contact@yourbusiness.com"
                          type="email"
                          
                          value={(field.state.value as string | undefined) ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!!field.state.meta.errors.length}
                        />
                      </field.Field>
                      <field.FieldDescription>Where we can contact you for verification and updates (required)</field.FieldDescription>
                      <field.FieldError />
                    </field.FieldSet>
                  )}
              </submitBusinessForm.AppField>
              
         <div className="flex justify-end items-center w-full pt-3">
         <submitBusinessForm.SubmitButton label="Submit" />
        </div>
      </submitBusinessForm.Form>
    </submitBusinessForm.AppForm>
  </div>)
}