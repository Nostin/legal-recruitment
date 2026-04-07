"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Search, Building2, Briefcase, MapPin, Users, Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  fetchFirmForUser,
  FirmsApiError,
  type FirmRead,
} from "@/lib/firms-api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const FirmDashboard = () => {
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [firm, setFirm] = useState<FirmRead | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "firm") {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setLoadError(null);
      try {
        const row = await fetchFirmForUser(localUser.id);
        if (!cancelled) setFirm(row);
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadError(
            e instanceof FirmsApiError ? e.message : "Could not load firm profile.",
          );
          setFirm(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  const isFirm = localUser?.account_type === "firm";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {bootstrapError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            Could not reach the API. Start the backend and check{" "}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code>.
          </p>
        )}
        {loadError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {loadError}
          </p>
        )}
        {clerkLoaded && localUser && !isFirm && (
          <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 mb-6">
            This dashboard is for hiring firm accounts.{" "}
            <Link href="/join" className="underline font-medium">Join as a firm</Link> or switch accounts.
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Firm Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading…" : firm ? firm.firm_name : "Manage introductions and track hiring activity."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/firm-onboarding"><Pencil className="mr-2 h-4 w-4" /> Edit firm profile</Link>
            </Button>
            <Button asChild>
              <Link href="/search"><Search className="mr-2 h-4 w-4" /> Search Talent</Link>
            </Button>
          </div>
        </div>

        {isFirm && !loading && !firm && !loadError && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground mb-8">
            You have not saved a firm profile yet.{" "}
            <Link href="/firm-onboarding" className="text-accent font-medium underline">Complete firm onboarding</Link>{" "}
            to store your details in OpenCourt.
          </p>
        )}

        {/* Firm profile summary (structured fields from API) */}
        {firm && (
          <motion.div
            className="rounded-xl border border-border bg-card p-6 mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{firm.firm_name}</h2>
                <p className="text-xs text-muted-foreground">On file in OpenCourt</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2 items-start">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Office locations</p>
                  <p className="text-foreground font-medium">
                    {firm.office_locations?.length
                      ? firm.office_locations.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Hiring practice areas</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {firm.hiring_practice_areas?.length ? (
                      firm.hiring_practice_areas.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))
                    ) : (
                      <span className="text-foreground font-medium">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-start sm:col-span-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Hiring partners (band)</p>
                  <p className="text-foreground font-medium">
                    {firm.hiring_partners_band ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Saved Candidate Searches</h3>
            <p className="text-sm text-muted-foreground">
              Saved searches and counts are not connected to the API in this phase. Use{" "}
              <Link href="/search" className="text-accent underline">Find Talent</Link>{" "}
              to browse live profiles.
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Introduction Requests</h3>
            <p className="text-sm text-muted-foreground">
              Introduction workflow is out of scope for this phase. No mock connection data is shown here.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FirmDashboard;
