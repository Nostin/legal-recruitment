"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Building2, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  createJobInterest,
  JobInterestsApiError,
  listJobInterestsForCandidate,
} from "@/lib/job-interests-api";
import { JobRead, JobsApiError, listOpenJobs } from "@/lib/jobs-api";

function pqeLabel(): string {
  return "Open to relevant candidates";
}

export default function CandidateOpportunitiesPage() {
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [jobs, setJobs] = useState<JobRead[]>([]);
  const [interestJobIds, setInterestJobIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interestModalJob, setInterestModalJob] = useState<JobRead | null>(null);
  const [submittingInterest, setSubmittingInterest] = useState(false);

  const isCandidate = localUser?.account_type === "candidate";

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const openJobs = await listOpenJobs();
        if (!cancelled) setJobs(openJobs);
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadError(
            e instanceof JobsApiError ? e.message : "Could not load opportunities.",
          );
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded]);

  useEffect(() => {
    if (!localUser?.id || localUser.account_type !== "candidate") {
      setInterestJobIds(new Set());
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const rows = await listJobInterestsForCandidate(localUser.id);
        if (!cancelled) setInterestJobIds(new Set(rows.map((r) => r.job_id)));
      } catch {
        if (!cancelled) setInterestJobIds(new Set());
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [localUser?.account_type, localUser?.id]);

  const sortedJobs = useMemo(() => jobs, [jobs]);

  const confirmInterest = async () => {
    if (!interestModalJob || !localUser?.id) return;
    setSubmittingInterest(true);
    try {
      await createJobInterest({
        candidate_user_id: localUser.id,
        job_id: interestModalJob.id,
      });
      setInterestJobIds((prev) => {
        const next = new Set(prev);
        next.add(interestModalJob.id);
        return next;
      });
      toast.success("Interest submitted to firm");
      setInterestModalJob(null);
    } catch (e: unknown) {
      toast.error(
        e instanceof JobInterestsApiError
          ? e.message
          : "Could not submit interest.",
      );
    } finally {
      setSubmittingInterest(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">Opportunities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse open roles from hiring firms and express interest in opportunities that fit.
        </p>

        {bootstrapError && (
          <p className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not reach the API. Check backend status and `NEXT_PUBLIC_API_URL`.
          </p>
        )}
        {loadError && (
          <p className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}
        {!isCandidate && clerkLoaded && localUser && (
          <p className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            Opportunities is for candidate accounts.
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading opportunities…</p>
        ) : sortedJobs.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No open opportunities right now.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sortedJobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-foreground">{job.role_title}</p>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.practice_area}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location} · {job.work_arrangement}</p>
                  <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {pqeLabel()}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => setInterestModalJob(job)}
                  disabled={!isCandidate || interestJobIds.has(job.id)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {interestJobIds.has(job.id) ? "Interest sent" : "I am interested"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={interestModalJob !== null} onOpenChange={(open) => !open && setInterestModalJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send profile to firm?</DialogTitle>
            <DialogDescription>
              Confirm to send your profile for this opportunity. The firm will see your interest submission for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterestModalJob(null)}>Cancel</Button>
            <Button onClick={() => void confirmInterest()} disabled={submittingInterest}>
              {submittingInterest ? "Sending…" : "Confirm interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
