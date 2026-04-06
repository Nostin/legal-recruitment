import type { Metadata } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Toaster } from "sonner";

import { LocalUserProvider } from "@/app/components/LocalUserProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Open Court",
  description: "Legal recruitment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Home
            </Link>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </Show>
          </header>
          <LocalUserProvider>{children}</LocalUserProvider>
          <Toaster richColors position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
