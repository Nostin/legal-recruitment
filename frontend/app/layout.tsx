import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import { AppHeader } from "@/app/components/AppHeader";
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
          <LocalUserProvider>
            <AppHeader />
            {children}
          </LocalUserProvider>
          <Toaster richColors position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
