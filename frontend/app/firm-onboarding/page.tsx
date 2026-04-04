"use client"
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Briefcase, Users, CreditCard, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

const practiceAreas = [
  "Banking & Finance", "Corporate / M&A", "Litigation", "Real Estate",
  "Employment", "IP / Technology", "Tax", "Arbitration", "Construction",
];

const locations = [
  "Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Canberra",
];

const FirmOnboarding = () => {
  const [step, setStep] = useState(1);
  const [firmName, setFirmName] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [hiringPartners, setHiringPartners] = useState("1-3");

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(l => l !== item) : [...list, item]);
  };

  const canContinue = step === 1
    ? firmName.trim().length > 0 && selectedLocations.length > 0 && selectedAreas.length > 0
    : true;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</Link>
          <Button size="sm" variant="ghost" asChild><Link href="/join">Back</Link></Button>
        </div>
      </nav>

      <div className="container max-w-2xl mx-auto px-6 py-12">
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
                  <Select value={hiringPartners} onValueChange={setHiringPartners}>
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
                    <p className="text-xs text-muted-foreground">Included with your Counsel account</p>
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

                <div className="rounded-xl bg-muted/50 border border-border p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Firm</span>
                    <span className="font-medium text-foreground">{firmName || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Locations</span>
                    <span className="font-medium text-foreground">{selectedLocations.join(", ") || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Hiring partners</span>
                    <span className="font-medium text-foreground">{hiringPartners}</span>
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
            <Button onClick={() => setStep(s => s + 1)} disabled={!canContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild>
              <Link href="/firm-dashboard">
                Activate Firm Access <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirmOnboarding;
