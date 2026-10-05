import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "Pipeline by StartupHR | Hire from a verified talent pipeline",
  description:
    "Pre-screened talent. Smarter matching. Faster hiring. A verified talent network for companies building Africa's startups.",
  openGraph: {
    title: "Pipeline by StartupHR",
    description: "Hire from a verified talent pipeline.",
    images: ["/pipeline-logo.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
