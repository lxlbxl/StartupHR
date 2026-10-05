import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const metadata = { title: "Talent requests | Pipeline" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper text-teal-900">
      <header className="bg-teal-900 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/pipeline-logo.jpg" alt="Pipeline" width={2127} height={709} className="h-7 w-auto" />
            <span className="hidden font-mono text-xs text-mint-400 sm:inline">/ admin</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/60 sm:inline">{user.email}</span>
            <form action={logout}>
              <button className="text-white/80 hover:text-mint-400">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
