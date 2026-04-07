"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  JobsApiError,
  createJob,
  listJobsForFirmUser,
  patchJobStatus,
  updateJob,
  type JobRead,
  type WorkArrangement,
} from "@/lib/jobs-api";

const practiceAreas = [
  "Corporate / M&A",
  "Litigation",
  "Banking & Finance",
  "Employment",
  "Real Estate",
  "Tax",
  "IP / Technology",
  "Regulatory",
  "Arbitration",
];

const locations = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Canberra",
];

type FormState = {
  role_title: string;
  location: string;
  practice_area: string;
  description: string;
  salary_min_k: string;
  salary_max_k: string;
  work_arrangement: WorkArrangement;
};

const emptyForm: FormState = {
  role_title: "",
  location: "",
  practice_area: "",
  description: "",
  salary_min_k: "",
  salary_max_k: "",
  work_arrangement: "hybrid",
};

function formFromJob(job: JobRead): FormState {
  return {
    role_title: job.role_title,
    location: job.location,
    practice_area: job.practice_area,
    description: job.description,
    salary_min_k: job.salary_min_k != null ? String(job.salary_min_k) : "",
    salary_max_k: job.salary_max_k != null ? String(job.salary_max_k) : "",
    work_arrangement: job.work_arrangement,
  };
}

export default function FirmOpportunitiesPage() {
  const { localUser, bootstrapError } = useOpenCourtUser();

  const [jobs, setJobs] = useState<JobRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [removeTargetJobId, setRemoveTargetJobId] = useState<number | null>(null);
  const [closeTargetJobId, setCloseTargetJobId] = useState<number | null>(null);
  const [closeReason, setCloseReason] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  const isFirm = localUser?.account_type === "firm";

  const loadJobs = useCallback(async () => {
    if (!localUser?.id || localUser.account_type !== "firm") {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await listJobsForFirmUser(localUser.id);
      setJobs(rows);
    } catch (e: unknown) {
      setLoadError(e instanceof JobsApiError ? e.message : "Could not load jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [localUser]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const activeJobs = useMemo(() => jobs.filter((j) => j.status === "open"), [jobs]);

  const salaryRangeInvalid =
    form.salary_min_k.trim() !== "" &&
    form.salary_max_k.trim() !== "" &&
    Number(form.salary_min_k) > Number(form.salary_max_k);

  const canSubmit =
    form.role_title.trim().length > 0 &&
    form.location &&
    form.practice_area &&
    form.description.trim().length > 0 &&
    !salaryRangeInvalid;

  async function submitForm() {
    if (!localUser?.id || localUser.account_type !== "firm") {
      toast.error("Sign in as a firm account.");
      return;
    }
    if (!canSubmit) {
      toast.error("Fill all required fields before saving.");
      return;
    }

    const body = {
      firm_user_id: localUser.id,
      role_title: form.role_title.trim(),
      location: form.location,
      practice_area: form.practice_area,
      description: form.description.trim(),
      salary_min_k: form.salary_min_k.trim() === "" ? null : Number(form.salary_min_k),
      salary_max_k: form.salary_max_k.trim() === "" ? null : Number(form.salary_max_k),
      work_arrangement: form.work_arrangement,
    };

    setSubmitting(true);
    try {
      if (editingJobId) {
        await updateJob(editingJobId, body);
        toast.success("Opportunity updated.");
      } else {
        await createJob(body);
        toast.success("Opportunity created.");
      }
      setEditingJobId(null);
      setForm(emptyForm);
      await loadJobs();
    } catch (e: unknown) {
      toast.error(e instanceof JobsApiError ? e.message : "Could not save opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function closeJob(jobId: number, reason: string) {
    if (!localUser?.id) return;
    setSubmitting(true);
    try {
      await patchJobStatus(jobId, {
        firm_user_id: localUser.id,
        status: "closed",
        close_reason: reason,
      });
      toast.success("Opportunity closed.");
      if (editingJobId === jobId) {
        setEditingJobId(null);
        setForm(emptyForm);
      }
      await loadJobs();
    } catch (e: unknown) {
      toast.error(e instanceof JobsApiError ? e.message : "Could not close opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeJob(jobId: number) {
    if (!localUser?.id) return;
    setSubmitting(true);
    try {
      await patchJobStatus(jobId, { firm_user_id: localUser.id, status: "removed" });
      toast.success("Opportunity removed.");
      if (editingJobId === jobId) {
        setEditingJobId(null);
        setForm(emptyForm);
      }
      await loadJobs();
    } catch (e: unknown) {
      toast.error(e instanceof JobsApiError ? e.message : "Could not remove opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reopenJob(jobId: number) {
    if (!localUser?.id) return;
    setSubmitting(true);
    try {
      await patchJobStatus(jobId, { firm_user_id: localUser.id, status: "open" });
      toast.success("Opportunity reopened.");
      await loadJobs();
    } catch (e: unknown) {
      toast.error(e instanceof JobsApiError ? e.message : "Could not reopen opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Add Opportunity
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and manage open roles for your firm.
              </p>
            </div>
            <Badge variant="secondary">{activeJobs.length} open</Badge>
          </div>

          {bootstrapError && (
            <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Could not reach the API. Check backend status and `NEXT_PUBLIC_API_URL`.
            </p>
          )}

          {!isFirm && (
            <p className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              This page is for firm accounts.
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role title</Label>
              <Input
                value={form.role_title}
                onChange={(e) => setForm((s) => ({ ...s, role_title: e.target.value }))}
                placeholder="Senior Associate — Corporate"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={form.location} onValueChange={(v) => setForm((s) => ({ ...s, location: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Practice area</Label>
                <Select value={form.practice_area} onValueChange={(v) => setForm((s) => ({ ...s, practice_area: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((pa) => (
                      <SelectItem key={pa} value={pa}>{pa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Describe the role responsibilities and requirements."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Salary min (k)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.salary_min_k}
                  onChange={(e) => setForm((s) => ({ ...s, salary_min_k: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Salary max (k)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.salary_max_k}
                  onChange={(e) => setForm((s) => ({ ...s, salary_max_k: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Work arrangement</Label>
                <Select
                  value={form.work_arrangement}
                  onValueChange={(v: WorkArrangement) =>
                    setForm((s) => ({ ...s, work_arrangement: v }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {salaryRangeInvalid && (
              <p className="text-sm text-destructive">Salary min cannot exceed salary max.</p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => void submitForm()} disabled={!isFirm || !canSubmit || submitting}>
                {editingJobId ? (
                  <><Pencil className="mr-2 h-4 w-4" /> Save changes</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Create opportunity</>
                )}
              </Button>
              {editingJobId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingJobId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel editing
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Your opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit, close, or remove posted roles.</p>

          {loadError && (
            <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loadError}
            </p>
          )}

          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading opportunities…</p>
          ) : jobs.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No opportunities yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job.role_title}</p>
                      <p className="text-xs text-muted-foreground">{job.practice_area} • {job.location}</p>
                    </div>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingJobId(job.id);
                        setForm(formFromJob(job));
                      }}
                      disabled={job.status === "removed"}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setCloseTargetJobId(job.id);
                        setCloseReason(job.close_reason ?? "");
                      }}
                      disabled={job.status !== "open" || submitting}
                    >
                      <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Close
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => void reopenJob(job.id)}
                      disabled={job.status !== "closed" || submitting}
                    >
                      Reopen
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => setRemoveTargetJobId(job.id)}
                      disabled={job.status === "removed" || submitting}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                  {job.status === "closed" && job.close_reason && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Close reason: {job.close_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={removeTargetJobId !== null} onOpenChange={(open) => !open && setRemoveTargetJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the opportunity as removed and hides it from active use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={() => {
                if (removeTargetJobId) void removeJob(removeTargetJobId);
                setRemoveTargetJobId(null);
              }}
            >
              Confirm remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={closeTargetJobId !== null} onOpenChange={(open) => !open && setCloseTargetJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close opportunity</DialogTitle>
            <DialogDescription>
              Add a reason for closing this role. You can reopen it later.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            placeholder="Why is this opportunity being closed?"
            className="min-h-[90px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseTargetJobId(null)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                if (!closeTargetJobId) return;
                void closeJob(closeTargetJobId, closeReason.trim());
                setCloseTargetJobId(null);
                setCloseReason("");
              }}
              disabled={!closeReason.trim()}
            >
              Close opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
