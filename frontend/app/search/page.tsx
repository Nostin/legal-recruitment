"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { Briefcase, MapPin, GraduationCap, Search, Send, Building, Scale, ChevronLeft, ChevronRight, X, MessageSquare, BadgeCheck, StickyNote, Users, ArrowRight, Star, ChevronUp, User, ChevronDown, Settings, Globe, DollarSign, FileText, CreditCard, Clock, Home } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import {
  listCandidates,
  mapCandidateToSearchList,
  type SearchListCandidate,
  CandidatesApiError,
} from "@/lib/candidates-api";
import {
  createIntroductionRequest,
  IntroductionApiError,
} from "@/lib/introduction-requests-api";

const ITEMS_PER_PAGE = 12;

const signInSearch = `/sign-in?redirect_url=${encodeURIComponent("/search")}`;

const practiceAreas = ["Corporate / M&A", "Litigation", "Banking & Finance", "Employment", "Real Estate", "Tax", "IP / Technology", "Regulatory", "Arbitration", "DCM"];
const firmTiers = ["Top Tier", "Mid Tier", "Boutique"];
const locationsList = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"];

const introSalaryBands = [
  "Under $100k", "$100k – $150k", "$150k – $200k", "$200k – $250k",
  "$250k – $300k", "$300k – $400k", "$400k – $500k", "$500k+",
];

const TalentSearch = () => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { localUser } = useOpenCourtUser();

  const [areaFilter, setAreaFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [introModal, setIntroModal] = useState<SearchListCandidate | null>(null);
  const [introSent, setIntroSent] = useState(false);
  const [showJoinOverlay, setShowJoinOverlay] = useState(true);
  const [joinOverlayCollapsed, setJoinOverlayCollapsed] = useState(false);

  const [candidates, setCandidates] = useState<SearchListCandidate[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const isFirm = localUser?.account_type === "firm";
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setListLoading(true);
      setListError(null);
      try {
        const rows = await listCandidates({
          openToRolesOnly: true,
          sortVerifiedFirst: true,
          practiceArea: areaFilter !== "all" ? areaFilter : undefined,
          firmTier: tierFilter !== "all" ? tierFilter : undefined,
          location: locationFilter !== "all" ? locationFilter : undefined,
        });
        if (!cancelled) {
          setCandidates(rows.map(mapCandidateToSearchList));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg =
            e instanceof CandidatesApiError
              ? e.message
              : "Could not load candidates.";
          setListError(msg);
          setCandidates([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [areaFilter, tierFilter, locationFilter]);

  // Intro request fields
  const [introMessage, setIntroMessage] = useState("");
  const [introTitle, setIntroTitle] = useState("");
  const [introLocation, setIntroLocation] = useState("");
  const [introPracticeArea, setIntroPracticeArea] = useState("");
  const [introEmploymentType, setIntroEmploymentType] = useState("");
  const [introWorkArrangement, setIntroWorkArrangement] = useState("");
  const [introSponsorship, setIntroSponsorship] = useState("");
  const [introSalaryBand, setIntroSalaryBand] = useState("");

  // Optional reveal values (empty or "Don't share" = not shared)
  const [firmNameValue, setFirmNameValue] = useState("");
  const [compRangeValue, setCompRangeValue] = useState("");
  const [revealRoleDesc, setRevealRoleDesc] = useState(false);
  const [roleDescValue, setRoleDescValue] = useState("");

  const totalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);
  const paginated = candidates.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const openIntroModal = (c: SearchListCandidate) => {
    setIntroModal(c);
    setIntroMessage("");
    setIntroTitle("");
    setIntroLocation("");
    setIntroPracticeArea("");
    setIntroEmploymentType("");
    setIntroWorkArrangement("");
    setIntroSponsorship("");
    setIntroSalaryBand("");
    setFirmNameValue("");
    setCompRangeValue("");
    setRevealRoleDesc(false);
    setRoleDescValue("");
    setIntroSent(false);
  };

  const sendIntro = async () => {
    if (!introModal || !localUser?.id) {
      toast.error("Sign in as a firm to send introduction requests.");
      return;
    }
    try {
      await createIntroductionRequest({
        firm_user_id: localUser.id,
        candidate_profile_id: introModal.id,
        role_title: introTitle.trim(),
        role_location: introLocation,
        practice_area: introPracticeArea,
        employment_type: introEmploymentType,
        work_arrangement: introWorkArrangement,
        sponsorship_qualification: introSponsorship,
        salary_band: introSalaryBand,
        firm_message: introMessage.trim(),
        revealed_firm_name: firmNameValue.trim() || undefined,
        revealed_compensation: compRangeValue.trim() || undefined,
        revealed_role_description: revealRoleDesc
          ? roleDescValue.trim() || undefined
          : undefined,
      });
      setIntroSent(true);
      toast.success("Introduction request sent");
    } catch (e: unknown) {
      const msg =
        e instanceof IntroductionApiError
          ? e.message
          : "Could not send introduction request. Is the API running?";
      toast.error(msg);
    }
  };

  const dismissOverlay = () => {
    setShowJoinOverlay(false);
    setJoinOverlayCollapsed(true);
  };

  const canSendIntro = introMessage.trim() && introTitle.trim() && introLocation && introPracticeArea && introEmploymentType && introWorkArrangement && introSponsorship;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</Link>
          <div className="flex items-center gap-3">
            {signedIn && clerkLoaded ? (
              <>
                {isFirm && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/firm-dashboard">Dashboard</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/notifications">Notifications</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <User className="h-3.5 w-3.5" /> Account{" "}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {localUser?.account_type === "candidate" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile-builder"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> My profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/lawyer-settings"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Settings className="h-3.5 w-3.5" /> Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        void signOut({ redirectUrl: "/" }).catch(() =>
                          toast.error("Could not sign out"),
                        )
                      }
                      className="cursor-pointer"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile-builder">Join as Lawyer</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/firm-onboarding">Join as Firm</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={signInSearch}>Log In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Find Talent</h1>
            <p className="text-muted-foreground mt-1">Browse anonymous lawyer profiles and request introductions.</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {listLoading
              ? "Loading…"
              : `${candidates.length} open to approaches`}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card mb-8">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Select value={areaFilter} onValueChange={handleFilterChange(setAreaFilter)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Practice Area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practice Areas</SelectItem>
              {practiceAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={handleFilterChange(setTierFilter)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Firm Tier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {firmTiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={handleFilterChange(setLocationFilter)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locationsList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">
            {listLoading ? "…" : `${candidates.length} candidates`}
          </span>
        </div>

        {listError && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {listError} Check that the API is running and{" "}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> is
            correct.
          </p>
        )}

        {listLoading && (
          <p className="text-sm text-muted-foreground mb-6">Loading profiles…</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!listLoading &&
            paginated.map((c, i) => (
            <motion.div
              key={c.id}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-foreground text-sm">{c.area} Lawyer</p>
                      {c.verified && (
                        <BadgeCheck className="h-4 w-4 text-accent shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.title} · {c.pqeLabel} Years PQE</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  {c.showCurrentFirm && c.currentFirm && (
                    <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 shrink-0" />{c.currentFirm} ({c.tier})</div>
                  )}
                  {!c.showCurrentFirm && (
                    <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 shrink-0" />{c.tier}</div>
                  )}
                  {c.showUniversity && c.uni && (
                    <div className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 shrink-0" />{c.uni}</div>
                  )}
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{c.locationLabel}</div>
                  {c.showAdmission && c.primaryAdmission && (
                    <div className="flex items-center gap-2"><Scale className="h-3.5 w-3.5 shrink-0" />Admitted in {c.primaryAdmission}{c.admissionYear ? ` (${c.admissionYear})` : ''}</div>
                  )}
                  {c.showFormerFirms && c.formerFirms && (
                    <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 shrink-0" />Former: {c.formerFirms}</div>
                  )}
                  {c.showTraineeFirm && c.traineeFirm && (
                    <div className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 shrink-0" />Trained at {c.traineeFirm}</div>
                  )}
                </div>
                {c.notes && (
                  <div className="text-xs text-muted-foreground italic mb-3 flex items-start gap-1.5">
                    <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>&ldquo;{c.notes}&rdquo;</span>
                  </div>
                )}
                {c.preferredDestinations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <Star className="h-3 w-3 text-accent shrink-0" />
                    {c.preferredDestinations.map((dest) => (
                      <Badge key={dest} variant="outline" className="text-[10px] border-accent/30 text-accent">
                        {dest}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                  {c.verified && <Badge variant="secondary" className="bg-accent-muted text-accent text-xs">Verified</Badge>}
                  <Badge variant="secondary" className="text-xs">Active this month</Badge>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => openIntroModal(c)}
                disabled={!isFirm}
                title={
                  !signedIn
                    ? "Sign in to request introductions"
                    : !isFirm
                      ? "Firm accounts can request introductions"
                      : undefined
                }
              >
                <Send className="mr-2 h-3.5 w-3.5" /> Request Introduction
              </Button>
              {signedIn && !isFirm && (
                <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                  Switch to a hiring firm account to send introduction requests.
                </p>
              )}
              {!signedIn && (
                <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                  <Link href={signInSearch} className="text-accent underline">
                    Sign in
                  </Link>{" "}
                  as a firm to request introductions.
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {!listLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Collapsed join bar */}
      <AnimatePresence>
        {!signedIn && joinOverlayCollapsed && !showJoinOverlay && (
          <motion.button
            className="fixed bottom-0 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-t-xl border border-b-0 border-border bg-card shadow-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => { setShowJoinOverlay(true); setJoinOverlayCollapsed(false); }}
          >
            <Users className="h-4 w-4 text-accent" />
            Join Counsel
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Join Overlay for non-logged-in users */}
      <AnimatePresence>
        {!signedIn && showJoinOverlay && (
          <motion.div
            className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl border border-border bg-card shadow-2xl p-6"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={dismissOverlay}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-accent" />
              <h3 className="font-display text-base font-semibold text-foreground">How would you like to join?</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/profile-builder"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Join as Lawyer</p>
                  <p className="text-xs text-muted-foreground">Anonymous profile · Passive alerts</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              <Link
                href="/firm-onboarding"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Join as Hiring Firm</p>
                  <p className="text-xs text-muted-foreground">Search talent · Send introductions</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                href={signInSearch}
                className="text-xs text-accent hover:underline w-full text-center block"
              >
                Already have an account? Log in
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Browse live profiles from the OpenCourt database.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Introduction Request Modal */}
      <AnimatePresence>
        {introModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIntroModal(null)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl bg-card border border-border p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {!introSent ? (
                <>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">Request Introduction</h2>
                  
                  <div className="rounded-lg bg-muted/50 border border-border p-3 mb-5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{introModal.area} Lawyer</p>
                      {introModal.verified && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{introModal.pqeLabel} PQE · {introModal.tier} Background · {introModal.locationLabel}</p>
                  </div>

                  {/* Required fields */}
                  <div className="space-y-4 mb-5">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Role Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. Senior Associate, Special Counsel"
                        value={introTitle}
                        onChange={e => setIntroTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          Location <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introLocation} onValueChange={setIntroLocation}>
                          <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                          <SelectContent>
                            {locationsList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          Practice Area <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introPracticeArea} onValueChange={setIntroPracticeArea}>
                          <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                          <SelectContent>
                            {practiceAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Employment Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introEmploymentType} onValueChange={setIntroEmploymentType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Time">Full Time</SelectItem>
                            <SelectItem value="Part Time">Part Time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5" />
                          Work Arrangement <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introWorkArrangement} onValueChange={setIntroWorkArrangement}>
                          <SelectTrigger><SelectValue placeholder="Select arrangement" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On Site">On Site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          Qualification <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introSponsorship} onValueChange={setIntroSponsorship}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Australian Qualified Only">Australian Qualified Only</SelectItem>
                            <SelectItem value="Open to Commonwealth Sponsorship">Open to Commonwealth Sponsorship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Salary Band <span className="text-destructive">*</span>
                        </Label>
                        <Select value={introSalaryBand} onValueChange={setIntroSalaryBand}>
                          <SelectTrigger><SelectValue placeholder="Select band" /></SelectTrigger>
                          <SelectContent>
                            {introSalaryBands.map(sb => <SelectItem key={sb} value={sb}>{sb}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Why are you interested? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Briefly describe the opportunity or your interest in this candidate..."
                        value={introMessage}
                        onChange={e => setIntroMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                   {/* Optional reveal fields */}
                  <div className="border-t border-border pt-4 mb-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Optional — share more to stand out</p>
                    <div className="space-y-3">
                      {/* Firm Name */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5" />
                          Firm Name
                        </Label>
                        <Input placeholder="Don't share" value={firmNameValue} onChange={e => setFirmNameValue(e.target.value)} />
                      </div>

                      {/* Compensation Details */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Compensation Details
                        </Label>
                        <Input placeholder="Don't share" value={compRangeValue} onChange={e => setCompRangeValue(e.target.value)} />
                        <p className="text-[11px] text-muted-foreground">e.g. $350k–$450k base + 20% bonus. Leave blank to not share.</p>
                      </div>

                      {/* Role Description */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Add Role Description</span>
                          </div>
                          <Switch checked={revealRoleDesc} onCheckedChange={setRevealRoleDesc} />
                        </div>
                        {revealRoleDesc && (
                          <div className="px-3 pb-3">
                            <Textarea placeholder="Describe the role in more detail..." value={roleDescValue} onChange={e => setRoleDescValue(e.target.value)} className="min-h-[60px]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-accent-muted/50 border border-accent/20 p-3 mb-6">
                    <CreditCard className="h-4 w-4 text-accent shrink-0" />
                    <p className="text-xs text-foreground">This request will use <span className="font-semibold">1 introduction credit</span>.</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => void sendIntro()}
                      disabled={!canSendIntro}
                    >
                      <Send className="mr-2 h-4 w-4" /> Send Request
                    </Button>
                    <Button variant="outline" onClick={() => setIntroModal(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-4">
                    <motion.svg
                      className="h-8 w-8 text-accent"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">Request Sent</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Candidate notified. You will be informed if they accept.
                  </p>
                  <Button onClick={() => setIntroModal(null)} className="w-full">Done</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalentSearch;
