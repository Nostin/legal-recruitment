"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Building2, Briefcase, MapPin, Users, Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  fetchFirmForUser,
  FirmsApiError,
  type FirmRead,
} from "@/lib/firms-api";
import {
  listSavedCandidatesForFirm,
  SavedCandidatesApiError,
  type SavedCandidateRead,
} from "@/lib/saved-candidates-api";
import {
  listJobInterestsForFirm,
  JobInterestsApiError,
  type JobInterestFirmRead,
} from "@/lib/job-interests-api";
import {
  listIntroductionsForFirm,
  createIntroductionRequest,
  IntroductionApiError,
  type IntroductionRead,
} from "@/lib/introduction-requests-api";

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
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidateRead[]>([]);
  const [jobApplications, setJobApplications] = useState<JobInterestFirmRead[]>([]);
  const [firmIntroductions, setFirmIntroductions] = useState<IntroductionRead[]>([]);
  const [introTargetCandidateId, setIntroTargetCandidateId] = useState<number | null>(null);
  const [introRoleTitle, setIntroRoleTitle] = useState("Confidential Opportunity");
  const [introMessage, setIntroMessage] = useState("");
  const [sendingIntro, setSendingIntro] = useState(false);
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

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "firm") {
      setFirmIntroductions([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const rows = await listIntroductionsForFirm(localUser.id);
        if (!cancelled) setFirmIntroductions(rows);
      } catch (e: unknown) {
        if (!cancelled) {
          setFirmIntroductions([]);
          setLoadError(
            e instanceof IntroductionApiError
              ? e.message
              : "Could not load introduction requests.",
          );
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "firm") {
      setJobApplications([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const rows = await listJobInterestsForFirm(localUser.id);
        if (!cancelled) setJobApplications(rows);
      } catch (e: unknown) {
        if (!cancelled) {
          setJobApplications([]);
          setLoadError(
            e instanceof JobInterestsApiError
              ? e.message
              : "Could not load job applications.",
          );
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "firm") {
      setSavedCandidates([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const rows = await listSavedCandidatesForFirm(localUser.id);
        if (!cancelled) setSavedCandidates(rows);
      } catch (e: unknown) {
        if (!cancelled) {
          setSavedCandidates([]);
          setLoadError(
            e instanceof SavedCandidatesApiError
              ? e.message
              : "Could not load saved candidates.",
          );
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  const isFirm = localUser?.account_type === "firm";
  const introStatusByCandidateId = new Map<number, IntroductionRead["status"]>(
    firmIntroductions.map((row) => [row.candidate_profile_id, row.status]),
  );
  const applicationsByJob = new Map<number, JobInterestFirmRead[]>();
  for (const row of jobApplications) {
    const prev = applicationsByJob.get(row.job_id) ?? [];
    prev.push(row);
    applicationsByJob.set(row.job_id, prev);
  }
  const introTarget = savedCandidates.find((s) => s.candidate_profile_id === introTargetCandidateId) ?? null;

  async function sendIntroFromSavedCandidate() {
    if (!localUser?.id || !introTargetCandidateId) return;
    setSendingIntro(true);
    try {
      await createIntroductionRequest({
        firm_user_id: localUser.id,
        candidate_profile_id: introTargetCandidateId,
        role_title: introRoleTitle.trim() || "Confidential Opportunity",
        role_location: "Sydney",
        practice_area: introTarget?.practice_area ?? "Corporate / M&A",
        employment_type: "Full Time",
        work_arrangement: "Hybrid",
        sponsorship_qualification: "Australian Qualified Only",
        salary_band: "Undisclosed",
        firm_message: introMessage.trim() || "We would like to connect about a relevant role.",
      });
      toast.success("Introduction request sent");
      setIntroTargetCandidateId(null);
      setIntroMessage("");
      setIntroRoleTitle("Confidential Opportunity");
      if (localUser.account_type === "firm") {
        const rows = await listIntroductionsForFirm(localUser.id);
        setFirmIntroductions(rows);
      }
    } catch (e: unknown) {
      toast.error(
        e instanceof IntroductionApiError ? e.message : "Could not send introduction request.",
      );
    } finally {
      setSendingIntro(false);
    }
  }

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
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Saved Candidates</h3>
            {savedCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved candidates yet. Save profiles from{" "}
                <Link href="/search" className="text-accent underline">Find Talent</Link>.
              </p>
            ) : (
              <div className="space-y-2">
                {savedCandidates.slice(0, 6).map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {(s.practice_area ?? "Lawyer")} {s.title ? `· ${s.title}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.pqe_is_range
                        ? `${s.pqe_range_min ?? "?"}-${s.pqe_range_max ?? "?"} PQE`
                        : `${s.years_post_qualification ?? "?"} PQE`}
                      {" · "}
                      {s.firm_tier ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {introStatusByCandidateId.get(s.candidate_profile_id) === "accepted"
                        ? "connected"
                        : introStatusByCandidateId.get(s.candidate_profile_id) === "pending"
                          ? "request sent"
                          : "saved"}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 cursor-pointer"
                      variant={introStatusByCandidateId.get(s.candidate_profile_id) === "pending" ? "outline" : "default"}
                      disabled={introStatusByCandidateId.get(s.candidate_profile_id) === "pending" || introStatusByCandidateId.get(s.candidate_profile_id) === "accepted"}
                      onClick={() => setIntroTargetCandidateId(s.candidate_profile_id)}
                    >
                      {introStatusByCandidateId.get(s.candidate_profile_id) === "accepted"
                        ? "Connected"
                        : introStatusByCandidateId.get(s.candidate_profile_id) === "pending"
                          ? "Request sent"
                          : "Request introduction"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Job Applications</h3>
            {jobApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No job applications yet.
              </p>
            ) : (
              <div className="space-y-2">
                {Array.from(applicationsByJob.entries()).slice(0, 6).map(([jobId, rows]) => (
                  <Link key={jobId} href={`/firm-job-applications/${jobId}`} className="block rounded-lg border border-border p-3 hover:bg-muted/40">
                    <p className="text-sm font-medium text-foreground">
                      {rows[0].job_role_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} applicant{rows.length === 1 ? "" : "s"} · {rows[0].job_location}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Introduction Requests</h3>
            {firmIntroductions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No introduction requests yet.</p>
            ) : (
              <div className="space-y-2">
                {firmIntroductions.slice(0, 6).map((row) => (
                  <div key={row.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{row.role_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.practice_area} · status: {row.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Dialog open={introTargetCandidateId !== null} onOpenChange={(open) => !open && setIntroTargetCandidateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request introduction</DialogTitle>
            <DialogDescription>
              Send an introduction request directly for this saved candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={introRoleTitle}
              onChange={(e) => setIntroRoleTitle(e.target.value)}
              placeholder="Role title"
            />
            <Textarea
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Short message to candidate"
              className="min-h-[90px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntroTargetCandidateId(null)}>
              Cancel
            </Button>
            <Button onClick={() => void sendIntroFromSavedCandidate()} disabled={sendingIntro}>
              {sendingIntro ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FirmDashboard;
