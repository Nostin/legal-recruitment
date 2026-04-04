"use client"
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, GraduationCap, Search, Send, Building, Scale, ChevronLeft, ChevronRight, CreditCard, X, MessageSquare, BadgeCheck, StickyNote, Users, ArrowRight, Star, Mail, ChevronUp, Eye, EyeOff, DollarSign, FileText, Clock, Home, Globe, User, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { toast } from "sonner";
import { candidates } from "@/data/candidates";

const ITEMS_PER_PAGE = 12;

interface Candidate {
  id: number;
  area: string;
  title: string;
  pqe: number;
  tier: string;
  currentFirm: string | null;
  uni: string | null;
  location: string;
  primaryAdmission: string | null;
  admissionYear: number | null;
  formerFirms: string | null;
  traineeFirm: string | null;
  notes: string | null;
  showCurrentFirm: boolean;
  showUniversity: boolean;
  showFormerFirms: boolean;
  showTraineeFirm: boolean;
  showAdmission: boolean;
  verified: boolean;
  preferredDestinations?: string[];
}

const practiceAreas = ["Corporate / M&A", "Litigation", "Banking & Finance", "Employment", "Real Estate", "Tax", "IP / Technology", "Regulatory", "Arbitration", "DCM"];
const locationsList = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"];

const introSalaryBands = [
  "Under $100k", "$100k – $150k", "$150k – $200k", "$200k – $250k",
  "$250k – $300k", "$300k – $400k", "$400k – $500k", "$500k+",
];

const TalentSearch = () => {
  const [areaFilter, setAreaFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [introModal, setIntroModal] = useState<Candidate | null>(null);
  const [introSent, setIntroSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showJoinOverlay, setShowJoinOverlay] = useState(true);
  const [joinOverlayCollapsed, setJoinOverlayCollapsed] = useState(false);

  // Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);

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

  // My Account
  const [openToRoles, setOpenToRoles] = useState(true);

  const areas = useMemo(() => [...new Set(candidates.map(c => c.area))].sort(), []);
  const tiers = useMemo(() => [...new Set(candidates.map(c => c.tier))].sort(), []);
  const locations = useMemo(() => [...new Set(candidates.map(c => c.location))].sort(), []);

  const filtered = useMemo(() => {
    const result = candidates.filter(c => {
      if (areaFilter !== "all" && c.area !== areaFilter) return false;
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (locationFilter !== "all" && c.location !== locationFilter) return false;
      return true;
    });
    return result.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
  }, [areaFilter, tierFilter, locationFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const openIntroModal = (c: Candidate) => {
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

  const sendIntro = () => {
    setIntroSent(true);
    toast.success("Introduction request sent");
  };

  const handleLogin = () => {
    setLoginSent(true);
  };

  const handleSimulateLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setLoginSent(false);
    setLoginEmail("");
    setShowJoinOverlay(false);
    toast.success("Signed in successfully");
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
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild><Link href="/firm-dashboard">Dashboard</Link></Button>
                <Button variant="ghost" size="sm" asChild><Link href="/notifications">Notifications</Link></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <User className="h-3.5 w-3.5" /> My Account <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">Open to roles</span>
                      </div>
                      <Switch checked={openToRoles} onCheckedChange={(v) => { setOpenToRoles(v); toast(v ? "Now visible to firms" : "Hidden from searches"); }} />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/lawyer-settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-3.5 w-3.5" /> Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setIsLoggedIn(false); toast("Signed out"); }} className="cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><Link href="/profile-builder">Join as Lawyer</Link></Button>
                <Button variant="ghost" size="sm" asChild><Link href="/firm-onboarding">Join as Firm</Link></Button>
                <Button size="sm" onClick={() => setShowLoginModal(true)}>Log In</Button>
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
          <Badge variant="secondary" className="text-xs">128 active lawyers this week</Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card mb-8">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Select value={areaFilter} onValueChange={handleFilterChange(setAreaFilter)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Practice Area" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practice Areas</SelectItem>
              {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={handleFilterChange(setTierFilter)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Firm Tier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={handleFilterChange(setLocationFilter)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">{filtered.length} candidates</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((c, i) => (
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
                    <p className="text-xs text-muted-foreground">{c.title} · {c.pqe} Years PQE</p>
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
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{c.location}</div>
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
                    <span>"{c.notes}"</span>
                  </div>
                )}
                {(c as any).preferredDestinations && (c as any).preferredDestinations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <Star className="h-3 w-3 text-accent shrink-0" />
                    {(c as any).preferredDestinations.map((dest: string) => (
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
                onClick={() => openIntroModal(c as Candidate)}
                disabled={!isLoggedIn}
                title={!isLoggedIn ? "Sign in as a firm to request introductions" : undefined}
              >
                <Send className="mr-2 h-3.5 w-3.5" /> Request Introduction
              </Button>
              {!isLoggedIn && (
                <p className="text-[11px] text-muted-foreground text-center mt-1.5">Sign in as a firm to request introductions</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
        {!isLoggedIn && joinOverlayCollapsed && !showJoinOverlay && (
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
        {!isLoggedIn && showJoinOverlay && (
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
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-xs text-accent hover:underline w-full text-center"
              >
                Already have an account? Log in
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">128 active lawyers this week</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowLoginModal(false); setLoginSent(false); setLoginEmail(""); }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl bg-card border border-border p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {!loginSent ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-xl font-semibold text-foreground">Log In</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your email and we'll send you a magic link to sign in.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" onClick={handleLogin} disabled={!loginEmail.trim()}>
                      <Mail className="mr-2 h-4 w-4" /> Send Magic Link
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">Check Your Email</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    We've sent a magic link to <span className="font-medium text-foreground">{loginEmail}</span>. Click it to sign in.
                  </p>
                  <Button variant="outline" className="w-full mb-2" onClick={() => { setLoginSent(false); setLoginEmail(""); }}>
                    Try a different email
                  </Button>
                  <button
                    onClick={handleSimulateLogin}
                    className="text-xs text-accent hover:underline"
                  >
                    Simulate sign-in (demo)
                  </button>
                </div>
              )}
            </motion.div>
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
                    <p className="text-xs text-muted-foreground">{introModal.pqe} PQE · {introModal.tier} Background · {introModal.location}</p>
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
                    <Button className="flex-1" onClick={sendIntro} disabled={!canSendIntro}>
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
