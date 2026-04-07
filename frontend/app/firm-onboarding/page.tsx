"use client"
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Briefcase, Users, CreditCard, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  createFirm,
  updateFirm,
  fetchFirmForUser,
  FirmsApiError,
  type FirmRead,
  type HiringPartnersBand,
} from "@/lib/firms-api";

const practiceAreas = [
  "Banking & Finance", "Corporate / M&A", "Litigation", "Real Estate",
  "Employment", "IP / Technology", "Tax", "Arbitration", "Construction",
];

const locations = [
  "Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Canberra",
];

const FirmOnboarding = () => {
  const router = useRouter();
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [step, setStep] = useState(1);
  const [firmName, setFirmName] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [hiringPartners, setHiringPartners] = useState<HiringPartnersBand>("1-3");

  const [loadedRow, setLoadedRow] = useState<FirmRead | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const applyLoaded = useCallback((row: FirmRead) => {
    setLoadedRow(row);
    setFirmName(row.firm_name);
    setSelectedLocations(row.office_locations ?? []);
    setSelectedAreas(row.hiring_practice_areas ?? []);
    const band = row.hiring_partners_band;
    if (band === "1-3" || band === "4-10" || band === "11+") {
      setHiringPartners(band);
    }
  }, []);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "firm") {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setProfileLoading(true);
      setProfileLoadError(null);
      try {
        const row = await fetchFirmForUser(localUser.id);
        if (!cancelled && row) applyLoaded(row);
      } catch (e: unknown) {
        if (!cancelled) {
          setProfileLoadError(
            e instanceof FirmsApiError ? e.message : "Could not load firm profile.",
          );
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [applyLoaded, bootstrapError, bootstrapLoading, clerkLoaded, localUser]);

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(l => l !== item) : [...list, item]);
  };

  const validateStep1 = () => {
    if (!firmName.trim()) {
      toast.error("Enter your firm name.");
      return false;
    }
    if (selectedLocations.length === 0) {
      toast.error("Select at least one office location.");
      return false;
    }
    if (selectedAreas.length === 0) {
      toast.error("Select at least one practice area you are hiring in.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => Math.min(3, s + 1));
  };

  const canContinue = step === 1
    ? firmName.trim().length > 0 && selectedLocations.length > 0 && selectedAreas.length > 0
    : true;

  const submitFirm = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!localUser?.id || localUser.account_type !== "firm") {
      toast.error("Sign in with a hiring firm account to continue.");
      return;
    }
    const body = {
      firm_name: firmName.trim(),
      office_locations: selectedLocations.length > 0 ? selectedLocations : null,
      hiring_practice_areas: selectedAreas.length > 0 ? selectedAreas : null,
      hiring_partners_band: hiringPartners,
    };
    setSubmitting(true);
    try {
      if (loadedRow) {
        await updateFirm(loadedRow.id, body);
        toast.success("Firm profile updated.");
      } else {
        await createFirm({ user_id: localUser.id, ...body });
        toast.success("Firm profile created.");
      }
      router.push("/firm-dashboard");
    } catch (e: unknown) {
      const msg =
        e instanceof FirmsApiError
          ? e.message
          : "Could not save firm profile. Is the API running?";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-6 pt-6">
        <Button size="sm" variant="ghost" asChild>
          <Link href="/join">Back</Link>
        </Button>
      </div>

      <div className="container max-w-2xl mx-auto px-6 py-12">
        {bootstrapError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            Could not reach the API to load your account. Start the backend and check{" "}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code>.
          </p>
        )}
        {profileLoadError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {profileLoadError}
          </p>
        )}
        {clerkLoaded && localUser && localUser.account_type !== "firm" && (
          <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 mb-6">
            This onboarding is for hiring firms.{" "}
            <Link href="/join" className="underline font-medium">Choose firm access</Link> on the join page, or switch accounts.
          </p>
        )}

        {profileLoading && (
          <p className="text-sm text-muted-foreground mb-6">Loading your firm profile…</p>
        )}

        {loadedRow && !profileLoading && (
          <p className="text-xs text-muted-foreground mb-4">
            You already have a saved firm profile. Update the details below and save to apply changes.
          </p>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={false}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Firm Details</h2>
              <p className="text-muted-foreground text-sm mb-8">Tell us about your firm so we can match you with the right candidates.</p>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Firm Name</Label>
                  <Input
                    placeholder="e.g. Herbert Smith Freehills"
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    <MapPin className="inline h-4 w-4 mr-1" />Office Locations
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                      <Badge
                        key={loc}
                        variant={selectedLocations.includes(loc) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleItem(loc, selectedLocations, setSelectedLocations)}
                      >
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    <Briefcase className="inline h-4 w-4 mr-1" />Practice Areas Hiring
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.map(area => (
                      <Badge
                        key={area}
                        variant={selectedAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleItem(area, selectedAreas, setSelectedAreas)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Team Access</h2>
              <p className="text-muted-foreground text-sm mb-8">Configure how your hiring team will use the platform.</p>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    <Users className="inline h-4 w-4 mr-1" />How many hiring partners will use the platform?
                  </Label>
                  <Select value={hiringPartners} onValueChange={(v) => setHiringPartners(v as HiringPartnersBand)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1–3 partners</SelectItem>
                      <SelectItem value="4-10">4–10 partners</SelectItem>
                      <SelectItem value="11+">11+ partners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <p className="text-sm text-foreground font-medium mb-2">Multi-seat access</p>
                  <p className="text-sm text-muted-foreground">
                    Each hiring partner receives their own dashboard with shared introduction credits.
                    All team activity is logged for compliance and audit purposes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Your Plan</h2>
              <p className="text-muted-foreground text-sm mb-8">Review your access plan and activate your firm account.</p>

              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Starter Plan</h3>
                    <p className="text-xs text-muted-foreground">Included with your Open Court account</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-foreground mb-8">
                  {[
                    "10 introduction requests per month",
                    "Access to active verified lawyers",
                    "Market movement insights",
                    "Team dashboard with activity logs",
                    "Priority support via email",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl bg-muted/50 border border-border p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Firm</span>
                    <span className="font-medium text-foreground text-right">{firmName.trim() || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Locations</span>
                    <span className="font-medium text-foreground text-right">{selectedLocations.length ? selectedLocations.join(", ") : "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Practice areas</span>
                    <span className="font-medium text-foreground text-right">{selectedAreas.length ? selectedAreas.join(", ") : "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Hiring partners</span>
                    <span className="font-medium text-foreground text-right">{hiringPartners}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={goNext} disabled={!canContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={
                submitting ||
                bootstrapLoading ||
                bootstrapError ||
                !localUser ||
                localUser.account_type !== "firm"
              }
              onClick={() => void submitFirm()}
            >
              {submitting ? "Saving…" : loadedRow ? "Save firm profile" : "Activate Firm Access"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirmOnboarding;
