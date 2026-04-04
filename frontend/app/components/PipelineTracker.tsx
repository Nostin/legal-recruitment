"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, FileText, Search, CalendarClock, Users, Award, XCircle, CheckCircle2, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

export type PipelineStage =
  | "cv_sent"
  | "cv_reviewing"
  | "cv_rejected"
  | "interview_scheduling"
  | "interview_1"
  | "interview_2"
  | "interview_3"
  | "offer_made"
  | "offer_rejected"
  | "offer_accepted";

interface StageConfig {
  key: PipelineStage;
  label: string;
  icon: React.ElementType;
  group: "cv" | "interview" | "offer";
}

const STAGES: StageConfig[] = [
  { key: "cv_sent", label: "CV Sent", icon: FileText, group: "cv" },
  { key: "cv_reviewing", label: "CV Under Review", icon: Search, group: "cv" },
  { key: "cv_rejected", label: "CV Not Progressed", icon: XCircle, group: "cv" },
  { key: "interview_scheduling", label: "Interview Scheduling", icon: CalendarClock, group: "interview" },
  { key: "interview_1", label: "First Interview", icon: Users, group: "interview" },
  { key: "interview_2", label: "Second Interview", icon: Users, group: "interview" },
  { key: "interview_3", label: "Third Interview", icon: Users, group: "interview" },
  { key: "offer_made", label: "Offer Made", icon: Award, group: "offer" },
  { key: "offer_rejected", label: "Offer Declined", icon: XCircle, group: "offer" },
  { key: "offer_accepted", label: "Offer Accepted", icon: CheckCircle2, group: "offer" },
];

// The normal forward path (excluding rejection branches)
const FORWARD_PATH: PipelineStage[] = [
  "cv_sent", "cv_reviewing", "interview_scheduling", "interview_1",
  "interview_2", "interview_3", "offer_made", "offer_accepted",
];

export interface StageDetail {
  stage: PipelineStage;
  date: string;
  note?: string;
  // Interview specifics
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewWith?: string;
  // Offer specifics
  offerSalary?: string;
  offerDetails?: string;
}

interface PipelineTrackerProps {
  notificationId: number;
  currentStage: PipelineStage;
  stageHistory: StageDetail[];
  onUpdateStage: (notificationId: number, stage: PipelineStage, detail: StageDetail) => void;
  /** Whether the viewer is the firm (can advance stages) or candidate (read-only mostly) */
  viewAs: "firm" | "candidate";
}

function getStageIndex(stage: PipelineStage): number {
  return FORWARD_PATH.indexOf(stage);
}

function isTerminal(stage: PipelineStage): boolean {
  return stage === "cv_rejected" || stage === "offer_rejected" || stage === "offer_accepted";
}

function getStageStatus(stage: PipelineStage, currentStage: PipelineStage): "completed" | "current" | "upcoming" | "rejected" {
  if (stage === currentStage) {
    if (stage === "cv_rejected" || stage === "offer_rejected") return "rejected";
    return "current";
  }
  const currentIdx = getStageIndex(currentStage);
  const stageIdx = getStageIndex(stage);
  if (currentStage === "cv_rejected" && (stage === "cv_sent" || stage === "cv_reviewing")) return "completed";
  if (currentStage === "offer_rejected") {
    const offerIdx = getStageIndex("offer_made");
    if (stageIdx <= offerIdx && stageIdx >= 0) return "completed";
  }
  if (stageIdx >= 0 && currentIdx >= 0 && stageIdx < currentIdx) return "completed";
  return "upcoming";
}

const PipelineTracker = ({ notificationId, currentStage, stageHistory, onUpdateStage, viewAs }: PipelineTrackerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [selectedNext, setSelectedNext] = useState<PipelineStage | "">("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewWith, setInterviewWith] = useState("");
  const [offerSalary, setOfferSalary] = useState("");
  const [offerDetails, setOfferDetails] = useState("");

  const currentConfig = STAGES.find(s => s.key === currentStage)!;
  const terminal = isTerminal(currentStage);

  // Determine which stages can come next
  const getNextOptions = (): PipelineStage[] => {
    if (terminal) return [];
    const idx = getStageIndex(currentStage);
    const options: PipelineStage[] = [];

    if (currentStage === "cv_reviewing") {
      options.push("cv_rejected", "interview_scheduling");
    } else if (currentStage === "offer_made") {
      options.push("offer_rejected", "offer_accepted");
    } else if (idx >= 0 && idx < FORWARD_PATH.length - 1) {
      // Allow skipping interviews
      const remaining = FORWARD_PATH.slice(idx + 1);
      remaining.forEach(s => options.push(s));
      // Add rejection branches where applicable
      if (currentStage === "cv_sent") options.push("cv_rejected");
    }

    return options;
  };

  const nextOptions = getNextOptions();
  const isInterviewStage = (s: string) => s.startsWith("interview_") && s !== "interview_scheduling";
  const isOfferStage = (s: string) => s === "offer_made";

  const handleAdvance = () => {
    if (!selectedNext) return;
    const detail: StageDetail = {
      stage: selectedNext,
      date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      note: advanceNote || undefined,
    };
    if (isInterviewStage(selectedNext)) {
      detail.interviewDate = interviewDate || undefined;
      detail.interviewTime = interviewTime || undefined;
      detail.interviewLocation = interviewLocation || undefined;
      detail.interviewWith = interviewWith || undefined;
    }
    if (isOfferStage(selectedNext) || selectedNext === "offer_accepted") {
      detail.offerSalary = offerSalary || undefined;
      detail.offerDetails = offerDetails || undefined;
    }
    onUpdateStage(notificationId, selectedNext, detail);
    setShowAdvance(false);
    setSelectedNext("");
    setAdvanceNote("");
    setInterviewDate("");
    setInterviewTime("");
    setInterviewLocation("");
    setInterviewWith("");
    setOfferSalary("");
    setOfferDetails("");
  };

  // Build display stages: show the main path filtering out irrelevant rejection branches
  const displayStages = FORWARD_PATH.filter(s => {
    // Always show completed and current stages
    const status = getStageStatus(s, currentStage);
    if (status === "completed" || status === "current") return true;
    // Show next few upcoming
    const currentIdx = getStageIndex(currentStage);
    const stageIdx = getStageIndex(s);
    if (stageIdx >= 0 && currentIdx >= 0 && stageIdx <= currentIdx + 2) return true;
    return false;
  });

  // Add the current stage if it's a rejection branch not in FORWARD_PATH
  if (currentStage === "cv_rejected" || currentStage === "offer_rejected") {
    // It's already handled visually
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      {/* Header */}
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <currentConfig.icon className={`h-4 w-4 shrink-0 ${
            terminal && currentStage !== "offer_accepted"
              ? "text-destructive"
              : currentStage === "offer_accepted"
              ? "text-accent"
              : "text-primary"
          }`} />
          <span className="text-sm font-medium text-foreground">{currentConfig.label}</span>
          <Badge variant={
            terminal && currentStage !== "offer_accepted" ? "destructive"
              : currentStage === "offer_accepted" ? "default"
              : "secondary"
          } className="text-xs">
            {terminal ? (currentStage === "offer_accepted" ? "Complete" : "Closed") : "In Progress"}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Expanded view */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-4 space-y-4"
        >
          {/* Visual pipeline */}
          <div className="space-y-1">
            {displayStages.map((stageKey, idx) => {
              const config = STAGES.find(s => s.key === stageKey)!;
              const status = getStageStatus(stageKey, currentStage);
              const historyEntry = stageHistory.find(h => h.stage === stageKey);
              const Icon = config.icon;

              return (
                <div key={stageKey} className="flex items-start gap-3">
                  {/* Dot / line */}
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      status === "completed" ? "bg-primary text-primary-foreground"
                        : status === "current" ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {status === "completed" ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    </div>
                    {idx < displayStages.length - 1 && (
                      <div className={`w-0.5 h-6 ${status === "completed" ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  {/* Label + details */}
                  <div className="pb-2 min-w-0">
                    <p className={`text-sm ${status === "current" ? "font-semibold text-foreground" : status === "completed" ? "text-foreground" : "text-muted-foreground"}`}>
                      {config.label}
                    </p>
                    {historyEntry && (
                      <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{historyEntry.date}</span>
                        {historyEntry.note && <p className="italic">"{historyEntry.note}"</p>}
                        {historyEntry.interviewDate && (
                          <p className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{historyEntry.interviewDate} at {historyEntry.interviewTime}</p>
                        )}
                        {historyEntry.interviewLocation && (
                          <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{historyEntry.interviewLocation}</p>
                        )}
                        {historyEntry.interviewWith && (
                          <p className="flex items-center gap-1"><User className="h-3 w-3" />With: {historyEntry.interviewWith}</p>
                        )}
                        {historyEntry.offerSalary && (
                          <p className="flex items-center gap-1"><Award className="h-3 w-3" />Salary: {historyEntry.offerSalary}</p>
                        )}
                        {historyEntry.offerDetails && (
                          <p>{historyEntry.offerDetails}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Show rejection stage inline if applicable */}
            {(currentStage === "cv_rejected" || currentStage === "offer_rejected") && (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-destructive text-destructive-foreground">
                    <XCircle className="h-3 w-3" />
                  </div>
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-destructive">{currentConfig.label}</p>
                  {stageHistory.find(h => h.stage === currentStage)?.note && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">
                      "{stageHistory.find(h => h.stage === currentStage)?.note}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advance stage controls */}
          {!terminal && viewAs === "firm" && (
            <div>
              {!showAdvance ? (
                <Button size="sm" variant="outline" onClick={() => setShowAdvance(true)}>
                  Update Stage
                </Button>
              ) : (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Advance to next stage</p>
                  <Select value={selectedNext} onValueChange={(v) => setSelectedNext(v as PipelineStage)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select next stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextOptions.map(opt => {
                        const c = STAGES.find(s => s.key === opt)!;
                        return <SelectItem key={opt} value={opt}>{c.label}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>

                  {/* Interview-specific fields */}
                  {selectedNext && isInterviewStage(selectedNext) && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Date (e.g. 28 Mar 2026)" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
                      <Input placeholder="Time (e.g. 10:00 AM)" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} />
                      <Input placeholder="Location / Video link" value={interviewLocation} onChange={e => setInterviewLocation(e.target.value)} className="col-span-2" />
                      <Input placeholder="Interviewer names" value={interviewWith} onChange={e => setInterviewWith(e.target.value)} className="col-span-2" />
                    </div>
                  )}

                  {/* Offer-specific fields */}
                  {selectedNext && (selectedNext === "offer_made" || selectedNext === "offer_accepted") && (
                    <div className="space-y-2">
                      <Input placeholder="Salary package (e.g. $450k + super)" value={offerSalary} onChange={e => setOfferSalary(e.target.value)} />
                      <Textarea placeholder="Offer details (start date, benefits, etc.)" value={offerDetails} onChange={e => setOfferDetails(e.target.value)} rows={2} />
                    </div>
                  )}

                  <Textarea placeholder="Add a note (optional)" value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} rows={2} />

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAdvance} disabled={!selectedNext}>Confirm Update</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowAdvance(false); setSelectedNext(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Candidate can accept/decline offer */}
          {!terminal && viewAs === "candidate" && currentStage === "offer_made" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onUpdateStage(notificationId, "offer_accepted", { stage: "offer_accepted", date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) })}>
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Accept Offer
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateStage(notificationId, "offer_rejected", { stage: "offer_rejected", date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) })}>
                <XCircle className="mr-2 h-3.5 w-3.5" /> Decline Offer
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PipelineTracker;
