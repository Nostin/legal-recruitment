"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function FirmOpportunitiesPlaceholder() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Add Opportunity
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Posting discrete roles to Open Court is not available in this build.
          Use Search Talent to browse candidates and send introduction requests.
        </p>
        <Button asChild className="mt-8">
          <Link href="/search">Go to Search Talent</Link>
        </Button>
      </div>
    </div>
  );
}
