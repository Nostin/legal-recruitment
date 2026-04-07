"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { JobInterestsApiError, JobInterestFirmRead, listJobInterestsForFirm } from "@/lib/job-interests-api";
import { getJob, JobRead, JobsApiError } from "@/lib/jobs-api";
import {
  createIntroductionRequest,
  IntroductionApiError,
  listIntroductionsForFirm,
} from "@/lib/introduction-requests-api";

export default function FirmJobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { localUser, bootstrapError } = useOpenCourtUser();
  const [job, setJob] = useState<JobRead | null>(null);
  const [applications, setApplications] = useState<JobInterestFirmRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingCandidateId, setConnectingCandidateId] = useState<number | null>(null);
  const [introCandidateIds, setIntroCandidateIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!jobId) return;
    if (!localUser?.id || localUser.account_type !== "firm") {
      setLoading(false);
      setApplications([]);
      setJob(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [jobRow, allApplications, intros] = await Promise.all([
          getJob(Number(jobId)),
          listJobInterestsForFirm(localUser.id),
          listIntroductionsForFirm(localUser.id),
        ]);
        if (cancelled) return;
        setJob(jobRow);
        setApplications(allApplications.filter((a) => a.job_id === Number(jobId)));
        setIntroCandidateIds(new Set(intros.map((row) => row.candidate_profile_id)));
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof JobsApiError || e instanceof JobInterestsApiError
              ? e.message
              : "Could not load job application details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [jobId, localUser]);

  const title = useMemo(() => job?.role_title ?? `Job #${jobId}`, [job?.role_title, jobId]);

  async function connectCandidate(application: JobInterestFirmRead) {
    if (!localUser?.id || !job) return;
    setConnectingCandidateId(application.candidate_profile_id);
    try {
      await createIntroductionRequest({
        firm_user_id: localUser.id,
        candidate_profile_id: application.candidate_profile_id,
        role_title: job.role_title,
        role_location: job.location,
        practice_area: job.practice_area,
        employment_type: "Full Time",
        work_arrangement: job.work_arrangement === "onsite" ? "On Site" : job.work_arrangement === "remote" ? "Remote" : "Hybrid",
        sponsorship_qualification: "Australian Qualified Only",
        salary_band:
          job.salary_min_k != null && job.salary_max_k != null
            ? `$${job.salary_min_k}k - $${job.salary_max_k}k`
            : "Undisclosed",
        firm_message: `We'd like to connect regarding your application to ${job.role_title}.`,
      });
      setIntroCandidateIds((prev) => new Set(prev).add(application.candidate_profile_id));
      toast.success("Introduction request sent");
    } catch (e: unknown) {
      toast.error(
        e instanceof IntroductionApiError ? e.message : "Could not start connection flow.",
      );
    } finally {
      setConnectingCandidateId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Job Applications</h1>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/firm-dashboard">Back to dashboard</Link>
          </Button>
        </div>

        {(bootstrapError || error) && (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error ?? "Could not reach the API. Check backend status and NEXT_PUBLIC_API_URL."}
          </p>
        )}

        {job && (
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-base font-semibold text-foreground">{job.role_title}</p>
              <Badge variant="secondary">{job.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {job.practice_area} · {job.location} · {job.work_arrangement}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        ) : applications.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            No applications for this job yet.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-medium text-foreground">
                  {a.candidate_practice_area ?? "Lawyer"} ·{" "}
                  {a.candidate_pqe_is_range
                    ? `${a.candidate_pqe_range_min ?? "?"}-${a.candidate_pqe_range_max ?? "?"} PQE`
                    : `${a.candidate_years_post_qualification ?? "?"} PQE`}
                </p>
                <p className="text-xs text-muted-foreground">Candidate profile #{a.candidate_profile_id}</p>
                <Button
                  size="sm"
                  className="mt-3"
                  disabled={introCandidateIds.has(a.candidate_profile_id) || connectingCandidateId === a.candidate_profile_id}
                  onClick={() => void connectCandidate(a)}
                >
                  {introCandidateIds.has(a.candidate_profile_id)
                    ? "Request sent"
                    : connectingCandidateId === a.candidate_profile_id
                      ? "Connecting..."
                      : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
