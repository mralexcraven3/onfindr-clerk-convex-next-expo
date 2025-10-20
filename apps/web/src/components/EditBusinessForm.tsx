import { editBusinessFormSchema } from '../lib/schema'
import { useAppForm } from "@/components/ui/tanstack-form"
import { revalidateLogic } from "@tanstack/react-form"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { EditBusiness } from "@/app/actions"

type EditBusinessFormProps = {
  name?: string
  description?: string
  email?: string
}

export function EditBusinessForm(props: EditBusinessFormProps) {
  const editBusinessForm = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      email: ""
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: editBusinessFormSchema,
      onDynamicAsyncDebounceMs: 300
    },
    onSubmit: ({
      value
    }) => {
      toast.success("success");
      EditBusiness(value);
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
    <editBusinessForm.AppForm>
      <editBusinessForm.Form>
         <h1 className="text-3xl font-bold">Edit Business</h1>
<editBusinessForm.AppField name={"name"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"name"}>Business Name *</field.FieldLabel>
                        <Input
                          name={"name"}
                          placeholder={props.name ?? ""}
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
              </editBusinessForm.AppField>
              
<editBusinessForm.AppField name={"description"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"description"}>Business Description *</field.FieldLabel>
                        <Input
                          name={"description"}
                          placeholder={props.description ?? "Tell us about your business"}
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
              </editBusinessForm.AppField>
              
<editBusinessForm.AppField name={"email"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"email"}>Business Email *</field.FieldLabel>
                        <Input
                          name={"email"}
                          placeholder={props.email ?? "contact@yourbusiness.com"}
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
              </editBusinessForm.AppField>
              
         <div className="flex justify-end items-center w-full pt-3">
         <editBusinessForm.SubmitButton label="Submit" />
        </div>
      </editBusinessForm.Form>
    </editBusinessForm.AppForm>
  </div>)
}