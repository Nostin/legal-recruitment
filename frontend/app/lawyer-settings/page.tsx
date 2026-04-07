"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Shield, Eye, EyeOff, Ban, Bell, Save, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  fetchCandidateForUser,
  updateCandidate,
  CandidatesApiError,
} from "@/lib/candidates-api";
import { listFirms, FirmsApiError } from "@/lib/firms-api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const LawyerSettings = () => {
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [blockedFirms, setBlockedFirms] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"anonymous" | "tier" | "firm">("anonymous");
  const [openToIntros, setOpenToIntros] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [allFirmNames, setAllFirmNames] = useState<string[]>([]);
  const [firmSearch, setFirmSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "candidate") {
      setLoadingProfile(false);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    setLoadingProfile(true);
    fetchCandidateForUser(localUser.id)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setProfileId(null);
          setBlockedFirms([]);
          setOpenToIntros(true);
          return;
        }
        setProfileId(row.id);
        setBlockedFirms(Array.from(new Set(row.excluded_firms ?? [])));
        setOpenToIntros(row.open_to_roles);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(
            e instanceof CandidatesApiError
              ? e.message
              : "Could not load your profile.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  useEffect(() => {
    listFirms()
      .then((rows) => {
        const names = rows
          .map((r) => r.firm_name.trim())
          .filter(Boolean);
        setAllFirmNames(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
      })
      .catch((e: unknown) => {
        if (e instanceof FirmsApiError) {
          setLoadError((prev) => prev ?? e.message);
        }
      });
  }, []);

  const removeBlockedFirm = (firm: string) => {
    setBlockedFirms((prev) => prev.filter((f) => f !== firm));
  };

  const addBlockedFirm = (firm: string) => {
    setBlockedFirms((prev) => (prev.includes(firm) ? prev : [...prev, firm]));
    setFirmSearch("");
  };

  const availableFirms = allFirmNames.filter((firm) => {
    if (blockedFirms.includes(firm)) return false;
    if (!firmSearch.trim()) return true;
    return firm.toLowerCase().includes(firmSearch.toLowerCase().trim());
  });

  const handleSave = async () => {
    if (!profileId) {
      toast.error("Create your profile first in the profile builder.");
      return;
    }
    setSaving(true);
    try {
      await updateCandidate(profileId, {
        excluded_firms:
          blockedFirms.length > 0
            ? Array.from(new Set(blockedFirms))
            : null,
        open_to_roles: openToIntros,
      });
      toast.success("Settings saved", {
        description:
          "Blocked firms and availability were updated. Visibility level is preview-only until the API supports it.",
      });
    } catch (e: unknown) {
      toast.error(
        e instanceof CandidatesApiError
          ? e.message
          : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-6 py-12">
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
        {clerkLoaded &&
          localUser &&
          localUser.account_type !== "candidate" && (
            <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 mb-6">
              These settings apply to lawyer accounts.{" "}
              <Link href="/join" className="underline font-medium">
                Join as a lawyer
              </Link>{" "}
              or switch accounts.
            </p>
          )}

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">Visibility Controls</h1>
          <p className="text-muted-foreground text-sm mb-10">
            Manage how your anonymous profile appears to hiring firms and control who can contact you.
          </p>
        </motion.div>

        {loadingProfile && (
          <p className="text-sm text-muted-foreground mb-6">Loading your profile…</p>
        )}

        {!loadingProfile &&
          localUser?.account_type === "candidate" &&
          !profileId &&
          !loadError && (
            <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground mb-6">
              You do not have a saved profile yet.{" "}
              <Link href="/profile-builder" className="text-accent underline">
                Complete the profile builder
              </Link>{" "}
              first; then you can manage blocks and availability here.
            </p>
          )}

        {/* Block Firms */}
        <motion.div
          className="rounded-2xl border border-border bg-card p-6 mb-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Ban className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Block Specific Firms</h3>
              <p className="text-xs text-muted-foreground">Your profile will be hidden from these firms entirely.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Add blocked firm</Label>
              <input
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Search firm names..."
                value={firmSearch}
                onChange={(e) => setFirmSearch(e.target.value)}
                disabled={loadingProfile || localUser?.account_type !== "candidate"}
              />
            </div>
            {availableFirms.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-lg border border-border">
                {availableFirms.slice(0, 12).map((firm) => (
                  <button
                    key={firm}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => addBlockedFirm(firm)}
                    type="button"
                  >
                    {firm}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {blockedFirms.length === 0 && (
                <p className="text-xs text-muted-foreground">No blocked firms selected.</p>
              )}
              {blockedFirms.map((firm) => (
                <Badge key={firm} variant="secondary" className="gap-1.5">
                  <Ban className="h-3 w-3" />
                  {firm}
                  <button
                    type="button"
                    onClick={() => removeBlockedFirm(firm)}
                    aria-label={`Remove ${firm}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visibility Level */}
        <motion.div
          className="rounded-2xl border border-border bg-card p-6 mb-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent-muted flex items-center justify-center">
              <Eye className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Visibility Level</h3>
              <p className="text-xs text-muted-foreground">Choose how much information firms can see before you accept an introduction.</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "anonymous" as const, label: "Fully Anonymous", desc: "Only practice area, PQE, and location are visible.", icon: EyeOff },
              { key: "tier" as const, label: "Tier Only Visible", desc: "Firm tier is shown alongside practice area and PQE.", icon: Shield },
              { key: "firm" as const, label: "Current Firm Visible", desc: "Your current firm name is displayed on your profile.", icon: Eye },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setVisibility(opt.key)}
                className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  visibility === opt.key
                    ? "border-accent bg-accent-muted/50"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  visibility === opt.key ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <opt.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          className="rounded-2xl border border-border bg-card p-6 mb-8"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent-muted flex items-center justify-center">
              <Bell className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Availability</h3>
              <p className="text-xs text-muted-foreground">Control whether firms can send you introduction requests this month.</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Open to introductions this month</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {openToIntros ? "You will appear in search results and receive requests." : "Your profile is hidden from all searches."}
              </p>
            </div>
            <Switch checked={openToIntros} onCheckedChange={setOpenToIntros} />
          </div>
        </motion.div>

        <Button
          size="lg"
          className="w-full cursor-pointer"
          disabled={
            saving ||
            loadingProfile ||
            bootstrapLoading ||
            !profileId ||
            localUser?.account_type !== "candidate"
          }
          onClick={() => void handleSave()}
        >
          <Save className="mr-2 h-4 w-4" />{" "}
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default LawyerSettings;
