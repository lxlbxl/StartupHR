"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  authenticate,
  clearFailedLogins,
  createSession,
  destroySession,
  isLoginThrottled,
  recordFailedLogin,
  requireAdmin,
} from "@/lib/auth";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/talent-request-schema";
import { updateTalentRequestStatus } from "@/lib/talent-requests";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (isLoginThrottled(ip)) return { error: "Too many attempts. Try again in 15 minutes." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = email && password ? authenticate(email, password) : null;
  if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
    recordFailedLogin(ip);
    return { error: "Incorrect email or password." };
  }

  clearFailedLogins(ip);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateRequest(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as RequestStatus;
  const notes = String(formData.get("internal_notes") ?? "").trim() || null;
  if (!Number.isInteger(id) || !REQUEST_STATUSES.includes(status)) return;
  updateTalentRequestStatus(id, status, notes);
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");
}
