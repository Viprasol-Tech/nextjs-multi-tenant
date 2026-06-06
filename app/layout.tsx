import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nextjs-multi-tenant",
  description:
    "Next.js multi-tenant starter — subdomain/path tenant resolution with middleware.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
