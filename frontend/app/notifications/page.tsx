"use client"
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  MapPin,
  Eye,
  X,
  MessageSquare,
  Check,
  HelpCircle,
  Briefcase,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Home,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import PipelineTracker, {
  type PipelineStage,
  type StageDetail,
} from "@/app/components/PipelineTracker";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  listIntroductionsForCandidate,
  patchIntroductionStatus,
  IntroductionApiError,
  type IntroductionRead,
} from "@/lib/introduction-requests-api";

function formatIntroDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const Notifications = () => {
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [intros, setIntros] = useState<IntroductionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<number | null>(null);
  const [moreInfoSent, setMoreInfoSent] = useState<Set<number>>(new Set());
  const [pipelineStages, setPipelineStages] = useState<Record<number, PipelineStage>>({});
  const [pipelineHistory, setPipelineHistory] = useState<Record<number, StageDetail[]>>({});

  const loadIntros = useCallback(async () => {
    if (!localUser?.id || localUser.account_type !== "candidate") {
      setIntros([]);
      return;
    }
    setLoadError(null);
    try {
      const rows = await listIntroductionsForCandidate(localUser.id);
      setIntros(rows);
    } catch (e: unknown) {
      setLoadError(
        e instanceof IntroductionApiError
          ? e.message
          : "Could not load introduction requests.",
      );
      setIntros([]);
    }
  }, [localUser]);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!localUser?.id || localUser.account_type !== "candidate") {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await loadIntros();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser, loadIntros]);

  const currentNotification = intros.find((n) => n.id === showModal);

  const handleUpdateStage = (notificationId: number, stage: PipelineStage, detail: StageDetail) => {
    setPipelineStages((prev) => ({ ...prev, [notificationId]: stage }));
    setPipelineHistory((prev) => ({
      ...prev,
      [notificationId]: [...(prev[notificationId] || []), detail],
    }));
  };

  const initPipelineAfterAccept = (id: number) => {
    setPipelineStages((prev) => ({ ...prev, [id]: "cv_sent" as PipelineStage }));
    setPipelineHistory((prev) => ({
      ...prev,
      [id]: [
        {
          stage: "cv_sent" as PipelineStage,
          date: new Date().toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        },
      ],
    }));
  };

  const handleConfirmAccept = async () => {
    if (showModal === null || !localUser?.id) return;
    try {
      await patchIntroductionStatus(showModal, {
        candidate_user_id: localUser.id,
        status: "accepted",
      });
      initPipelineAfterAccept(showModal);
      setShowModal(null);
      await loadIntros();
      toast.success("Introduction accepted");
    } catch (e: unknown) {
      toast.error(
        e instanceof IntroductionApiError
          ? e.message
          : "Could not accept this request.",
      );
    }
  };

  const handleDecline = async (id: number) => {
    if (!localUser?.id) return;
    if (!window.confirm("Decline this introduction request?")) return;
    try {
      await patchIntroductionStatus(id, {
        candidate_user_id: localUser.id,
        status: "declined",
      });
      await loadIntros();
      toast.success("Request declined");
    } catch (e: unknown) {
      toast.error(
        e instanceof IntroductionApiError
          ? e.message
          : "Could not decline this request.",
      );
    }
  };

  const isCandidate = localUser?.account_type === "candidate";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Open Court</Link>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" asChild><Link href="/lawyer-settings">Settings</Link></Button>
            <Button size="sm" variant="outline" asChild><Link href="/">Home</Link></Button>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl mx-auto px-6 py-12">
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
        {clerkLoaded && localUser && !isCandidate && (
          <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 mb-6">
            Introduction requests are shown to lawyer accounts.{" "}
            <Link href="/join" className="underline font-medium">Join as a lawyer</Link> or switch accounts.
          </p>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Introduction Requests</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading…"
                : isCandidate
                  ? `${intros.length} request${intros.length === 1 ? "" : "s"} in your inbox`
                  : "Sign in as a lawyer to view requests."}
            </p>
          </div>
        </div>

        {!loading && isCandidate && intros.length === 0 && !loadError && (
          <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-6">
            No introduction requests yet. When a firm sends a request from Find Talent, it will appear here.
          </p>
        )}

        <div className="space-y-4">
          {intros.map((n, i) => (
            <motion.div
              key={n.id}
              className="rounded-xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">
                    A hiring firm is interested in speaking with you about a{" "}
                    <span className="font-semibold">{n.practice_area}</span> role in{" "}
                    <span className="font-semibold">{n.role_location}</span>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{n.practice_area}</Badge>
                    <Badge variant="secondary" className="text-xs">{n.status}</Badge>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatIntroDate(n.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 border border-border p-3 mb-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground italic">&ldquo;{n.firm_message}&rdquo;</p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 mb-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opportunity Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="font-medium text-foreground">{n.role_title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{n.role_location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span>{n.practice_area}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{n.employment_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Home className="h-3 w-3 shrink-0" />
                    <span>{n.work_arrangement}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span>{n.sponsorship_qualification}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>{n.salary_band}</span>
                  </div>
                </div>
                {n.revealed_firm_name && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground pt-1 border-t border-border">
                    <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{n.revealed_firm_name}</span>
                  </div>
                )}
                {n.revealed_compensation && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <DollarSign className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>{n.revealed_compensation}</span>
                  </div>
                )}
                {n.revealed_role_description && (
                  <div className="flex items-start gap-1.5 text-xs text-foreground">
                    <FileText className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{n.revealed_role_description}</span>
                  </div>
                )}
              </div>

              {n.status === "accepted" && pipelineStages[n.id] && (
                <div className="mb-4">
                  <PipelineTracker
                    notificationId={n.id}
                    currentStage={pipelineStages[n.id]}
                    stageHistory={pipelineHistory[n.id] || []}
                    onUpdateStage={handleUpdateStage}
                    viewAs="firm"
                  />
                </div>
              )}

              <div className="relative mb-4">
                <div className={`rounded-lg border border-border p-4 transition-all duration-500 ${
                  n.status === "pending" ? "blur-md select-none" : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {n.status === "accepted"
                          ? n.firm_name
                          : n.status === "declined"
                            ? "Request declined"
                            : "Firm identity hidden"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {n.role_location}
                      </p>
                    </div>
                  </div>
                </div>
                {n.status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Badge variant="secondary" className="text-xs">Identity hidden — accept to reveal</Badge>
                  </div>
                )}
              </div>

              {n.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setShowModal(n.id)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> Accept Introduction
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void handleDecline(n.id)}>
                    <X className="mr-2 h-3.5 w-3.5" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={moreInfoSent.has(n.id)}
                    onClick={() => {
                      setMoreInfoSent((prev) => new Set(prev).add(n.id));
                      toast.message("More info is not wired to the API in this phase.");
                    }}
                  >
                    <HelpCircle className="mr-2 h-3.5 w-3.5" />
                    {moreInfoSent.has(n.id) ? "Info Requested" : "Request More Info"}
                  </Button>
                </div>
              )}

              {n.status === "accepted" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3 text-accent" /> Introduction accepted — use the pipeline tracker above for your local progress notes.
                </p>
              )}

              {n.status === "declined" && (
                <p className="text-xs text-muted-foreground">You declined this introduction request.</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal !== null && currentNotification && currentNotification.status === "pending" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-card border border-border p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">Accept Introduction?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                If you accept, the firm name will be shown on this request. Contact details are not stored in OpenCourt in this phase — coordinate next steps through your usual professional channels.
              </p>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => void handleConfirmAccept()}>
                  <Check className="mr-2 h-4 w-4" /> Accept Introduction
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(null)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
