"use client"
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Building2, MapPin, Eye, X, MessageSquare, Check, Phone, Mail, Download, HelpCircle, Briefcase, DollarSign, FileText, UsersRound, Calendar, Clock, Home, Globe } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import PipelineTracker, { type PipelineStage, type StageDetail } from "@/app/components/PipelineTracker";

const notifications = [
  {
    id: 1, firmTier: "Top Tier", location: "Melbourne", area: "Corporate / M&A", time: "2 hours ago",
    date: "15 Mar 2026",
    message: "We are expanding our M&A team and believe your experience would be a strong fit for our growing practice.",
    firmName: "Herbert Smith Freehills", contact: "Sarah Mitchell", email: "s.mitchell@hsf.com", phone: "+61 3 9288 1234",
    title: "Senior Associate",
    positionLocation: "Melbourne",
    positionArea: "Corporate / M&A",
    employmentType: "Full Time",
    workArrangement: "Hybrid",
    sponsorship: "Australian Qualified Only",
    salaryBand: "$400k – $500k",
    revealedFirmName: "Herbert Smith Freehills",
    compensationRange: "$400k–$500k + performance bonus",
    roleDescription: "Senior Associate to Partner-track role in our market-leading M&A practice, focusing on public company transactions.",
    teamName: "M&A Advisory",
  },
  {
    id: 2, firmTier: "Mid Tier", location: "Sydney", area: "Litigation", time: "1 day ago",
    date: "14 Mar 2026",
    message: "We have an immediate need for a senior litigator with commercial disputes expertise to join our partner track.",
    firmName: "Holding Redlich", contact: "James Park", email: "j.park@holdingredlich.com", phone: "+61 2 8083 0400",
    title: "Special Counsel",
    positionLocation: "Sydney",
    positionArea: "Litigation",
    employmentType: "Full Time",
    workArrangement: "On Site",
    sponsorship: "Open to Commonwealth Sponsorship",
    salaryBand: "$300k – $400k",
    revealedFirmName: null,
    compensationRange: null,
    roleDescription: "Lead litigator for complex commercial disputes across multiple industry verticals.",
    teamName: null,
  },
  {
    id: 3, firmTier: "Top Tier", location: "Brisbane", area: "Banking & Finance", time: "3 days ago",
    date: "12 Mar 2026",
    message: "Our finance practice is looking for experienced banking lawyers as we expand our Queensland operations.",
    firmName: "King & Wood Mallesons", contact: "Emily Chen", email: "e.chen@kwm.com", phone: "+61 7 3244 8000",
    title: "Senior Associate",
    positionLocation: "Brisbane",
    positionArea: "Banking & Finance",
    employmentType: "Full Time",
    workArrangement: "Hybrid",
    sponsorship: "Australian Qualified Only",
    salaryBand: "$300k – $400k",
    revealedFirmName: "King & Wood Mallesons",
    compensationRange: "$350k–$420k",
    roleDescription: null,
    teamName: "Finance & Projects",
  },
];

const Notifications = () => {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState<number | null>(null);
  const [moreInfoSent, setMoreInfoSent] = useState<Set<number>>(new Set());

  // Pipeline state per notification
  const [pipelineStages, setPipelineStages] = useState<Record<number, PipelineStage>>({});
  const [pipelineHistory, setPipelineHistory] = useState<Record<number, StageDetail[]>>({});

  const currentNotification = notifications.find(n => n.id === showModal);

  const handleUpdateStage = (notificationId: number, stage: PipelineStage, detail: StageDetail) => {
    setPipelineStages(prev => ({ ...prev, [notificationId]: stage }));
    setPipelineHistory(prev => ({
      ...prev,
      [notificationId]: [...(prev[notificationId] || []), detail],
    }));
  };

  // When accepting, initialise pipeline at cv_sent
  const handleAccept = (id: number) => {
    setRevealed(prev => new Set(prev).add(id));
    setPipelineStages(prev => ({ ...prev, [id]: "cv_sent" as PipelineStage }));
    setPipelineHistory(prev => ({
      ...prev,
      [id]: [{ stage: "cv_sent" as PipelineStage, date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) }],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</Link>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" asChild><Link href="/lawyer-settings">Settings</Link></Button>
            <Button size="sm" variant="outline" asChild><Link href="/">Sign Out</Link></Button>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Introduction Requests</h1>
            <p className="text-sm text-muted-foreground">{notifications.length} firms are interested in speaking with you.</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((n, i) => (
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
                    A <span className="font-semibold">{n.firmTier} {n.location}</span> firm is interested in speaking with you.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{n.firmTier}</Badge>
                    <Badge variant="outline" className="text-xs">{n.area}</Badge>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{n.date}</span>
                  </div>
                </div>
              </div>

              {/* Interest message */}
              <div className="rounded-lg bg-muted/50 border border-border p-3 mb-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground italic">"{n.message}"</p>
                </div>
              </div>

              {/* Shared details */}
              <div className="rounded-lg border border-border p-3 mb-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opportunity Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="font-medium text-foreground">{n.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{n.positionLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span>{n.positionArea}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{n.employmentType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Home className="h-3 w-3 shrink-0" />
                    <span>{n.workArrangement}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span>{n.sponsorship}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>{n.salaryBand}</span>
                  </div>
                </div>
                {n.revealedFirmName && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground pt-1 border-t border-border">
                    <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{n.revealedFirmName}</span>
                  </div>
                )}
                {n.compensationRange && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <DollarSign className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>{n.compensationRange}</span>
                  </div>
                )}
                {n.roleDescription && (
                  <div className="flex items-start gap-1.5 text-xs text-foreground">
                    <FileText className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{n.roleDescription}</span>
                  </div>
                )}
                {n.teamName && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <UsersRound className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>{n.teamName}</span>
                  </div>
                )}
              </div>

              {/* Pipeline tracker (only shown after acceptance) */}
              {revealed.has(n.id) && pipelineStages[n.id] && (
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

              {/* Blurred firm card */}
              <div className="relative mb-4">
                <div className={`rounded-lg border border-border p-4 transition-all duration-500 ${
                  revealed.has(n.id) ? "" : "blur-md select-none"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{n.firmName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {n.location}
                      </p>
                    </div>
                  </div>
                </div>
                {!revealed.has(n.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">Identity hidden — accept to reveal</Badge>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!revealed.has(n.id) ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setShowModal(n.id)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> Accept Introduction
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowModal(n.id)}>
                    <X className="mr-2 h-3.5 w-3.5" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={moreInfoSent.has(n.id)}
                    onClick={() => {
                      setMoreInfoSent(prev => new Set(prev).add(n.id));
                    }}
                  >
                    <HelpCircle className="mr-2 h-3.5 w-3.5" />
                    {moreInfoSent.has(n.id) ? "Info Requested" : "Request More Info"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3 text-accent" /> Introduction accepted — expand the pipeline tracker above to see progress.
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal !== null && currentNotification && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-card border border-border p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {!revealed.has(showModal) ? (
                <>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">Accept Introduction?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    If you accept this request, your name and contact details will be shared with the firm. A recruitment pipeline will be started so you can track progress.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleAccept(showModal);
                        setShowModal(null);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" /> Accept Introduction
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowModal(null)}>
                      Decline
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-4">
                      <motion.svg
                        className="h-8 w-8 text-accent"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-1">You're now connected</h2>
                    <p className="text-sm text-muted-foreground">The firm will contact you shortly.</p>
                  </div>

                  {/* Contact Details */}
                  <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Firm</p>
                        <p className="text-sm font-medium text-foreground">{currentNotification.firmName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contact Person</p>
                        <p className="text-sm font-medium text-foreground">{currentNotification.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{currentNotification.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{currentNotification.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowModal(null)}>
                      <Download className="mr-2 h-4 w-4" /> Download Contact Card
                    </Button>
                    <Button className="flex-1" onClick={() => setShowModal(null)}>Done</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
