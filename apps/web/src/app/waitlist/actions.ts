"use server";

import { api } from "@onfindr-clerk-convex-next-expo/backend/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { z } from "zod";

const WaitlistSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function submitWaitlist(formData: FormData) {
  const parsed = WaitlistSchema.safeParse({
    email: formData.get("email")?.toString(),
    name: formData.get("name")?.toString() || undefined,
    phone: formData.get("phone")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid input" } as const;
  }

  await fetchMutation(api.waitlist.addEmail, parsed.data);
  return { ok: true } as const;
}


