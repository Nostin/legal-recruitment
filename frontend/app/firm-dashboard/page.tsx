"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, Search, Clock, UserPlus, ArrowRight, Eye, Send, Building2, Briefcase, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const stats = [
  { label: "Introduction Credits Remaining", value: "7 / 10", icon: CreditCard, sub: "Resets in 18 days" },
  { label: "Active Searches", value: "3", icon: Search, sub: "Banking, Litigation, Corporate" },
  { label: "Pending Introduction Requests", value: "4", icon: Clock, sub: "2 sent this week" },
  { label: "New Candidates This Week", value: "12", icon: UserPlus, sub: "↑ 20% from last week" },
];

const savedSearches = [
  { label: "Banking & Finance — Melbourne — Top Tier", count: 34 },
  { label: "Corporate / M&A — Sydney — All Tiers", count: 21 },
  { label: "Litigation — Brisbane — Mid Tier", count: 9 },
];

const recentProfiles = [
  { area: "Corporate / M&A", pqe: 8, tier: "Top Tier", location: "Melbourne" },
  { area: "Banking & Finance", pqe: 12, tier: "Mid Tier", location: "Sydney" },
  { area: "Litigation", pqe: 5, tier: "Top Tier", location: "Brisbane" },
  { area: "Employment", pqe: 15, tier: "Boutique", location: "Melbourne" },
];

const connections = [
  { area: "Corporate / M&A", status: "Accepted", time: "2 days ago" },
  { area: "Banking & Finance", status: "Pending", time: "5 days ago" },
  { area: "Litigation", status: "Declined", time: "1 week ago" },
];

const FirmDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link href="/search">Search Talent</Link></Button>
            <Button size="sm" variant="outline" asChild><Link href="/">Sign Out</Link></Button>
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Firm Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage introductions and track hiring activity.</p>
          </div>
          <Button asChild>
            <Link href="/search"><Search className="mr-2 h-4 w-4" /> Search Talent</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
              initial="hidden" animate="visible" variants={fadeUp} custom={i}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent-muted flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Saved Searches */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Saved Candidate Searches</h3>
            <div className="space-y-3">
              {savedSearches.map(s => (
                <Link
                  key={s.label}
                  href="/search"
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recently Viewed */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Recently Viewed Profiles</h3>
            <div className="space-y-3">
              {recentProfiles.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.area}</p>
                    <p className="text-xs text-muted-foreground">{p.pqe} PQE · {p.tier}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{p.location}</Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Connections */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
            initial="hidden" animate="visible" variants={fadeUp} custom={6}
          >
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Attempted Connections</h3>
            <div className="space-y-3">
              {connections.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.area}</p>
                      <p className="text-xs text-muted-foreground">{c.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant={c.status === "Accepted" ? "default" : c.status === "Pending" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FirmDashboard;
