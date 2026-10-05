"use server";

import { headers } from "next/headers";
import { talentRequestSchema, type FieldErrors } from "@/lib/talent-request-schema";
import { createTalentRequest } from "@/lib/talent-requests";

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: FieldErrors }
  | { status: "success"; id: number; pipeline: string };

export async function submitTalentRequest(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get("fax_number")) return { status: "success", id: 0, pipeline: "" };

  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  const parsed = talentRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and submit again.",
      errors,
    };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const id = createTalentRequest(parsed.data, { ip, userAgent: h.get("user-agent") });

  return {
    status: "success",
    id,
    pipeline: `${parsed.data.function} — ${parsed.data.seniority}`,
  };
}
