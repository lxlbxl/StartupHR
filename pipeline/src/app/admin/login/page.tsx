import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Team login | Pipeline" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mx-auto block w-fit">
          <Image src="/pipeline-logo.jpg" alt="Pipeline by StartupHR" width={2127} height={709} className="h-12 w-auto" priority />
        </Link>
        <div className="mt-8 rounded-2xl bg-paper p-7 text-teal-900 shadow-xl">
          <h1 className="font-mono text-xl font-bold">Team login</h1>
          <p className="mt-1 text-sm text-teal-900/60">Sign in to view talent requests.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
