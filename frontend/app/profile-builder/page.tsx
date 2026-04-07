"use client"
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Briefcase, MapPin, GraduationCap, Shield, BadgeCheck, Linkedin, Mail, X, Star, StickyNote, Clock, Home, DollarSign, Languages } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  createCandidate,
  updateCandidate,
  fetchCandidateForUser,
  wizardStateToCandidateBody,
  CandidatesApiError,
  type CandidateRead,
} from "@/lib/candidates-api";

const practiceAreas = ["Corporate / M&A", "Litigation", "Banking & Finance", "Employment", "Real Estate", "Tax", "IP / Technology", "Regulatory"];
const firmTiers = ["Top Tier", "Mid Tier", "Boutique"];
const universities = ["University of Melbourne", "University of Sydney", "UNSW", "ANU", "Monash University", "University of Queensland", "Other"];
const locationsList = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"];

const knownFirms = [
  "Allens", "Ashurst", "Baker McKenzie", "Clayton Utz", "Corrs", "DLA Piper",
  "Gilbert + Tobin", "Herbert Smith Freehills", "King & Wood Mallesons", "MinterEllison",
  "Norton Rose Fulbright", "Gadens", "Hall & Wilcox", "HWL Ebsworth", "Holding Redlich",
  "Dentons", "Arnold Bloch Leibler", "Johnson Winter Slattery", "Lander & Rogers", "Mills Oakley"
];

const preferredOptions = ["Top Tier Firm", "Mid Tier Firm", "Boutique Firm", "In-House", "Government"];

const salaryMarks = [0, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600, 750, 1000];
const formatSalary = (v: number) => v === 0 ? "$0" : v >= 1000 ? "$1m+" : `$${v}k`;

const commonLanguages = ["English", "Mandarin", "Cantonese", "Japanese", "Korean", "Hindi", "Arabic", "French", "Spanish", "Italian", "German", "Greek", "Vietnamese", "Indonesian", "Malay", "Thai", "Portuguese"];

const employmentTypes = ["Full Time", "Part Time", "Contract"];
const workArrangements = ["On Site", "Hybrid", "Remote"];

const TOTAL_STEPS = 5;

function nearestSalaryIndex(k: number): number {
  let best = 0;
  let bestD = Infinity;
  salaryMarks.forEach((m, idx) => {
    const d = Math.abs(m - k);
    if (d < bestD) {
      bestD = d;
      best = idx;
    }
  });
  return best;
}

const ProfileBuilder = () => {
  const router = useRouter();
  const { isLoaded: clerkLoaded } = useUser();
  const { localUser, bootstrapLoading, bootstrapError } = useOpenCourtUser();

  const [step, setStep] = useState(1);
  const [practiceArea, setPracticeArea] = useState("");
  const [pqe, setPqe] = useState([5]);
  const [pqeIsRange, setPqeIsRange] = useState(false);
  const [pqeRange, setPqeRange] = useState([3, 7]);
  const [firmTier, setFirmTier] = useState("");
  const [university, setUniversity] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [openToRoles, setOpenToRoles] = useState(true);
  const [notes, setNotes] = useState("");

  // New fields
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 1000]);
  const [salarySet, setSalarySet] = useState(false);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedWorkArrangements, setSelectedWorkArrangements] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState("");

  // Verification
  const [verificationEmail, setVerificationEmail] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");

  // Exclusions & Preferences
  const [excludedFirms, setExcludedFirms] = useState<string[]>([]);
  const [excludeSearch, setExcludeSearch] = useState("");
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>([]);
  const [specificFirmPreference, setSpecificFirmPreference] = useState("");

  const [loadedRow, setLoadedRow] = useState<CandidateRead | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const applyLoadedProfile = useCallback((p: CandidateRead) => {
    setLoadedRow(p);
    setPracticeArea(p.practice_area ?? "");
    setPqeIsRange(p.pqe_is_range);
    if (p.pqe_is_range) {
      setPqeRange([
        p.pqe_range_min ?? 0,
        p.pqe_range_max ?? 0,
      ]);
    } else {
      setPqe([p.years_post_qualification ?? 0]);
    }
    setFirmTier(p.firm_tier ?? "");
    setUniversity(p.university ?? "");
    setSelectedLocations(p.preferred_locations ?? []);
    setOpenToRoles(p.open_to_roles);
    setNotes(p.profile_summary ?? "");
    if (
      p.salary_disclosed &&
      p.salary_min_k != null &&
      p.salary_max_k != null
    ) {
      setSalarySet(true);
      const lo = salaryMarks[nearestSalaryIndex(p.salary_min_k)];
      const hi = salaryMarks[nearestSalaryIndex(p.salary_max_k)];
      setSalaryRange([Math.min(lo, hi), Math.max(lo, hi)]);
    } else {
      setSalarySet(false);
    }
    setSelectedEmploymentTypes(p.employment_types ?? []);
    setSelectedWorkArrangements(p.work_arrangements ?? []);
    setLanguages(p.languages ?? []);
    setVerificationEmail(p.verification_professional_email ?? "");
    setLinkedInUrl(p.linkedin_url ?? "");
    setExcludedFirms(p.excluded_firms ?? []);
    setPreferredDestinations(p.preferred_destinations ?? []);
    setSpecificFirmPreference(p.specific_firm_preference ?? "");
  }, []);

  useEffect(() => {
    if (!clerkLoaded || bootstrapLoading || bootstrapError) return;
    if (!localUser || localUser.account_type !== "candidate") return;
    let cancelled = false;
    setProfileLoadError(null);
    fetchCandidateForUser(localUser.id)
      .then((row) => {
        if (cancelled || !row) return;
        applyLoadedProfile(row);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg =
          e instanceof CandidatesApiError ? e.message : "Could not load profile.";
        setProfileLoadError(msg);
      });
    return () => {
      cancelled = true;
    };
  }, [
    applyLoadedProfile,
    bootstrapError,
    bootstrapLoading,
    clerkLoaded,
    localUser,
  ]);

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!practiceArea.trim()) {
        toast.error("Select a practice area.");
        return false;
      }
      if (!firmTier.trim()) {
        toast.error("Select a firm tier.");
        return false;
      }
      if (selectedEmploymentTypes.length === 0) {
        toast.error("Select at least one employment type.");
        return false;
      }
      if (selectedWorkArrangements.length === 0) {
        toast.error("Select at least one work arrangement.");
        return false;
      }
    }
    if (s === 2) {
      if (!university.trim()) {
        toast.error("Select a university.");
        return false;
      }
      if (selectedLocations.length === 0) {
        toast.error("Select at least one preferred location.");
        return false;
      }
    }
    if (s === 4) {
      const em = verificationEmail.trim();
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        toast.error("Enter a valid professional email or leave it blank.");
        return false;
      }
      const li = linkedInUrl.trim();
      if (li) {
        try {
          new URL(li);
        } catch {
          toast.error("Enter a valid LinkedIn URL or leave it blank.");
          return false;
        }
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
  };

  const submitProfile = async () => {
    for (let s = 1; s <= 2; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    if (!validateStep(4)) {
      setStep(4);
      return;
    }
    if (!localUser?.id || localUser.account_type !== "candidate") {
      toast.error("You need a lawyer account to save a profile.");
      return;
    }
    const wizard = {
      practiceArea,
      pqeIsRange,
      pqe,
      pqeRange,
      firmTier,
      university,
      selectedLocations,
      notes,
      salarySet,
      salaryRange,
      selectedEmploymentTypes,
      selectedWorkArrangements,
      languages,
      verificationEmail,
      linkedInUrl,
      excludedFirms,
      preferredDestinations,
      specificFirmPreference,
      openToRoles,
    };
    const body = wizardStateToCandidateBody(wizard, loadedRow);
    setSubmitting(true);
    try {
      if (loadedRow) {
        await updateCandidate(loadedRow.id, body);
        toast.success("Profile updated.");
      } else {
        await createCandidate({ user_id: localUser.id, ...body });
        toast.success("Profile saved.");
      }
      router.push("/search");
    } catch (e: unknown) {
      const msg =
        e instanceof CandidatesApiError
          ? e.message
          : "Could not save profile. Is the API running?";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleExcludedFirm = (firm: string) => {
    setExcludedFirms(prev =>
      prev.includes(firm) ? prev.filter(f => f !== firm) : [...prev, firm]
    );
  };

  const togglePreferred = (pref: string) => {
    setPreferredDestinations(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const toggleEmploymentType = (type: string) => {
    setSelectedEmploymentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleWorkArrangement = (arr: string) => {
    setSelectedWorkArrangements(prev =>
      prev.includes(arr) ? prev.filter(a => a !== arr) : [...prev, arr]
    );
  };

  const filteredFirms = knownFirms.filter(f =>
    f.toLowerCase().includes(excludeSearch.toLowerCase()) && !excludedFirms.includes(f)
  );

  const hasVerification = verificationEmail.trim() !== "" || linkedInUrl.trim() !== "";

  const pqeDisplay = pqeIsRange ? `${pqeRange[0]}–${pqeRange[1]}` : `${pqe[0]}`;
  const salaryDisplay = salarySet ? `${formatSalary(salaryRange[0])} – ${formatSalary(salaryRange[1])}` : "";

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };
  const filteredLanguages = commonLanguages.filter(l =>
    l.toLowerCase().includes(languageSearch.toLowerCase()) && !languages.includes(l)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-12">
        {bootstrapError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            Could not reach the API to load your account. Start the backend and
            check{" "}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code>.
          </p>
        )}
        {profileLoadError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {profileLoadError}
          </p>
        )}
        {clerkLoaded &&
          localUser &&
          localUser.account_type !== "candidate" && (
            <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 mb-6">
              This page is for lawyer profiles.{" "}
              <Link href="/join" className="underline font-medium">
                Choose lawyer
              </Link>{" "}
              on the join page, or use a different account.
            </p>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-3xl font-semibold text-foreground">Build your anonymous profile</h1>
                <span className="text-sm text-muted-foreground shrink-0">
                  Step {step} of {TOTAL_STEPS}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">Your identity is never shown. Only structured data is visible to firms.</p>
              {loadedRow && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Editing your saved profile (updates the live record when you
                  submit).
                </p>
              )}
            </div>

            {/* Step 1: Practice details */}
            {step === 1 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-2">
                  <Label>Practice Area</Label>
                  <Select value={practiceArea} onValueChange={setPracticeArea}>
                    <SelectTrigger><SelectValue placeholder="Select practice area" /></SelectTrigger>
                    <SelectContent>
                      {practiceAreas.map(pa => <SelectItem key={pa} value={pa}>{pa}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* PQE with range option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Years PQE: {pqeDisplay}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Range</span>
                      <Switch checked={pqeIsRange} onCheckedChange={setPqeIsRange} />
                    </div>
                  </div>
                  {pqeIsRange ? (
                    <>
                      <Slider value={pqeRange} onValueChange={setPqeRange} min={0} max={25} step={1} className="py-2" minStepsBetweenThumbs={1} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span><span>25+</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Slider value={pqe} onValueChange={setPqe} min={0} max={25} step={1} className="py-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span><span>25+</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Current Firm Tier</Label>
                  <Select value={firmTier} onValueChange={setFirmTier}>
                    <SelectTrigger><SelectValue placeholder="Select firm tier" /></SelectTrigger>
                    <SelectContent>
                      {firmTiers.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary range */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Desired Salary Range <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="px-1">
                    <Slider
                      value={[
                        salaryMarks.indexOf(salaryRange[0]) >= 0 ? salaryMarks.indexOf(salaryRange[0]) : 0,
                        salaryMarks.indexOf(salaryRange[1]) >= 0 ? salaryMarks.indexOf(salaryRange[1]) : salaryMarks.length - 1,
                      ]}
                      min={0}
                      max={salaryMarks.length - 1}
                      step={1}
                      minStepsBetweenThumbs={1}
                      onValueChange={(vals: number[]) => {
                        setSalaryRange([salaryMarks[vals[0]], salaryMarks[vals[1]]]);
                        setSalarySet(true);
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span>{formatSalary(salaryRange[0])}</span>
                      <span>{formatSalary(salaryRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" />
                    Languages <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  {languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {languages.map(lang => (
                        <Badge key={lang} variant="secondary" className="text-xs gap-1">
                          {lang}
                          <button onClick={() => toggleLanguage(lang)}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    placeholder="Search languages..."
                    value={languageSearch}
                    onChange={e => setLanguageSearch(e.target.value)}
                    className="h-9"
                  />
                  {languageSearch && filteredLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {filteredLanguages.slice(0, 8).map(lang => (
                        <button
                          key={lang}
                          onClick={() => { toggleLanguage(lang); setLanguageSearch(""); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Employment type */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Desired Employment Type
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {employmentTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleEmploymentType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedEmploymentTypes.includes(type)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work arrangement */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    Desired Work Arrangement
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {workArrangements.map(arr => (
                      <button
                        key={arr}
                        onClick={() => toggleWorkArrangement(arr)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedWorkArrangements.includes(arr)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {arr}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Education & Location */}
            {step === 2 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-2">
                  <Label>University</Label>
                  <Select value={university} onValueChange={setUniversity}>
                    <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                    <SelectContent>
                      {universities.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Preferred Locations</Label>
                  <div className="flex flex-wrap gap-2">
                    {locationsList.map(loc => (
                      <button
                        key={loc}
                        onClick={() => toggleLocation(loc)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedLocations.includes(loc)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Profile Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea
                    placeholder="Anything you'd like firms to know — e.g. areas of interest, deal experience, availability..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="min-h-[80px]"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">{notes.length}/200 characters</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Firm Exclusions & Preferences */}
            {step === 3 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    Exclude Firms from Viewing Your Profile
                  </Label>
                  <p className="text-sm text-muted-foreground">Select firms you do not want to see your anonymous profile — such as your current employer.</p>
                  <Input
                    placeholder="Search firms..."
                    value={excludeSearch}
                    onChange={e => setExcludeSearch(e.target.value)}
                  />
                  {excludeSearch && (
                    <div className="border border-border rounded-lg max-h-40 overflow-y-auto">
                      {filteredFirms.map(firm => (
                        <button
                          key={firm}
                          onClick={() => { toggleExcludedFirm(firm); setExcludeSearch(""); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                        >
                          {firm}
                        </button>
                      ))}
                    </div>
                  )}
                  {excludedFirms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {excludedFirms.map(firm => (
                        <Badge key={firm} variant="secondary" className="gap-1">
                          {firm}
                          <button onClick={() => toggleExcludedFirm(firm)}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6 space-y-3">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    Preferred Destinations
                  </Label>
                  <p className="text-sm text-muted-foreground">What type of move are you considering?</p>
                  <div className="flex flex-wrap gap-2">
                    {preferredOptions.map(pref => (
                      <button
                        key={pref}
                        onClick={() => togglePreferred(pref)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          preferredDestinations.includes(pref)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label className="text-sm font-normal text-muted-foreground">Or nominate a specific firm</Label>
                    <Input
                      placeholder="e.g. Herbert Smith Freehills"
                      value={specificFirmPreference}
                      onChange={e => setSpecificFirmPreference(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Verification */}
            {step === 4 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="p-4 rounded-xl border border-border bg-accent-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="h-5 w-5 text-accent" />
                    <p className="text-sm font-semibold text-foreground">Profile Verification</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verified profiles receive a badge and appear higher in search results. We manually check your identity against public records. This step is optional.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Professional Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@firmname.com.au"
                    value={verificationEmail}
                    onChange={e => setVerificationEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">We use this only for verification; it is never shared.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={linkedInUrl}
                    onChange={e => setLinkedInUrl(e.target.value)}
                  />
                </div>

                {!hasVerification && (
                  <div className="p-3 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      You can skip this step, but your profile will not receive the verified badge.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-medium text-foreground">Open to hearing about roles?</p>
                    <p className="text-sm text-muted-foreground">Firms can only reach you when this is on.</p>
                  </div>
                  <Switch checked={openToRoles} onCheckedChange={setOpenToRoles} />
                </div>
                <div className="p-4 rounded-xl border border-border bg-accent-muted">
                  <p className="text-sm text-accent font-medium">Your profile is ready to go live.</p>
                  <p className="text-sm text-muted-foreground mt-1">Review your anonymous preview card on the right, then submit.</p>
                </div>
                {excludedFirms.length > 0 && (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-sm font-medium text-foreground mb-2">Excluded Firms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {excludedFirms.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                    </div>
                  </div>
                )}
                {(preferredDestinations.length > 0 || specificFirmPreference) && (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-sm font-medium text-foreground mb-2">Preferred Destinations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferredDestinations.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                      {specificFirmPreference && <Badge variant="secondary" className="text-xs">{specificFirmPreference}</Badge>}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < TOTAL_STEPS ? (
                <Button onClick={goNext}>
                  {step === 4 && !hasVerification ? "Skip" : "Continue"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  disabled={
                    submitting ||
                    bootstrapLoading ||
                    bootstrapError ||
                    !localUser ||
                    localUser.account_type !== "candidate"
                  }
                  onClick={() => void submitProfile()}
                >
                  {submitting ? "Saving…" : "Submit Profile"}{" "}
                  {!submitting && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Preview card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Anonymous Preview</p>
              <motion.div
                className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4"
                layout
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{practiceArea || "Practice Area"} Lawyer</p>
                      {hasVerification && (
                        <BadgeCheck className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{pqeDisplay} Years PQE</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{firmTier || "Firm Tier"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{university || "University"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedLocations.length > 0 ? selectedLocations.join(", ") : "Location"}</span>
                  </div>
                  {salarySet && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{salaryDisplay}</span>
                    </div>
                  )}
                  {languages.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="h-4 w-4" />
                      <span>{languages.join(", ")}</span>
                    </div>
                  )}
                </div>
                {(selectedEmploymentTypes.length > 0 || selectedWorkArrangements.length > 0) && (
                  <div className="flex items-center gap-1.5 flex-wrap border-t border-border pt-3">
                    {selectedEmploymentTypes.map(t => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                    {selectedWorkArrangements.map(a => (
                      <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                )}
                {notes && (
                  <div className="text-sm text-muted-foreground italic border-t border-border pt-3 flex items-start gap-2">
                    <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>&ldquo;{notes}&rdquo;</span>
                  </div>
                )}
                {(preferredDestinations.length > 0 || specificFirmPreference) && (
                  <div className="flex items-center gap-1.5 flex-wrap border-t border-border pt-3">
                    <Star className="h-3.5 w-3.5 text-accent shrink-0" />
                    {preferredDestinations.map(p => (
                      <Badge key={p} variant="outline" className="text-[10px] border-accent/30 text-accent">{p}</Badge>
                    ))}
                    {specificFirmPreference && (
                      <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">{specificFirmPreference}</Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {openToRoles && <Badge variant="secondary" className="bg-accent-muted text-accent text-xs">Open to roles</Badge>}
                  {hasVerification && <Badge variant="secondary" className="bg-accent-muted text-accent text-xs">Verified</Badge>}
                  <Badge variant="secondary" className="text-xs">Active this month</Badge>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBuilder;
