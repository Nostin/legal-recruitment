"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Scale, Building2, Shield, Eye, Users, Zap, Check } from "lucide-react";
import { toast } from "sonner";

import { useOpenCourtUser } from "@/app/components/LocalUserProvider";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const JoinChoice = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const {
    localUser,
    bootstrapLoading,
    bootstrapError,
    emailMissing,
    setAccountType,
  } = useOpenCourtUser();

  const choiceDisabled =
    !isLoaded ||
    (!!user && bootstrapLoading) ||
    bootstrapError ||
    emailMissing;

  const signInJoin = `/sign-in?redirect_url=${encodeURIComponent("/join")}`;

  async function goLawyer() {
    if (!isLoaded) return;
    if (!user) {
      router.push(signInJoin);
      return;
    }
    if (localUser?.account_type === "candidate") {
      router.push("/profile-builder");
      return;
    }
    if (localUser?.account_type === "firm") {
      toast.error(
        "This account is registered as a hiring firm. Use another account to join as a lawyer.",
      );
      return;
    }
    const ok = await setAccountType("candidate");
    if (ok) router.push("/profile-builder");
    else toast.error("Could not save account type. Is the API running?");
  }

  async function goFirm() {
    if (!isLoaded) return;
    if (!user) {
      router.push(signInJoin);
      return;
    }
    if (localUser?.account_type === "firm") {
      router.push("/firm-onboarding");
      return;
    }
    if (localUser?.account_type === "candidate") {
      toast.error(
        "This account is registered as a lawyer. Use another account for firm access.",
      );
      return;
    }
    const ok = await setAccountType("firm");
    if (ok) router.push("/firm-onboarding");
    else toast.error("Could not save account type. Is the API running?");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</Link>
          <Button size="sm" variant="ghost" asChild><Link href="/">Back to Home</Link></Button>
        </div>
      </nav>

      {bootstrapError && (
        <div className="container max-w-5xl mx-auto px-6 pt-4">
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not reach the OpenCourt API. Start the backend (e.g.{" "}
            <code className="rounded bg-muted px-1">uvicorn app.main:app</code>
            ) and set{" "}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> if
            it is not on 127.0.0.1:8000.
          </p>
        </div>
      )}

      {emailMissing && (
        <div className="container max-w-5xl mx-auto px-6 pt-4">
          <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            Your Clerk account does not have an email address yet. Add one in
            your account settings, then return here to continue.
          </p>
        </div>
      )}

      <div className="container max-w-5xl mx-auto px-6 py-16">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Badge variant="secondary" className="mb-4 text-xs">128 active lawyers this week</Badge>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3">How would you like to join?</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select your role to get started. All profiles are verified and introductions are managed discreetly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div
            className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            <div className="h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mb-6">
              <Scale className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Join as Lawyer</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an anonymous profile and hear about opportunities from verified firms — on your terms.
            </p>
            <ul className="space-y-3 text-sm text-foreground mb-8 flex-1">
              <li className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Anonymous profile — your identity is never shared without consent</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Passive opportunity alerts from hiring firms</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Eye className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Full control over visibility and availability</span>
              </li>
            </ul>
            <Button
              size="lg"
              className="w-full"
              onClick={goLawyer}
              disabled={choiceDisabled}
            >
              Create Anonymous Profile
            </Button>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            <div className="h-12 w-12 rounded-xl bg-accent-muted flex items-center justify-center mb-6">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Join as Hiring Firm</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Search verified talent and send confidential introduction requests to passive candidates.
            </p>
            <ul className="space-y-3 text-sm text-foreground mb-8 flex-1">
              <li className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Search verified, active lawyer profiles</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Send confidential introduction requests</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Monthly introduction credits included</span>
              </li>
            </ul>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={goFirm}
              disabled={choiceDisabled}
            >
              Activate Firm Access
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="rounded-2xl border border-border bg-card overflow-hidden"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Platform Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center px-6 py-3 font-medium text-foreground">Lawyer</th>
                  <th className="text-center px-6 py-3 font-medium text-foreground">Hiring Firm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: "Anonymous profile", lawyer: true, firm: false },
                  { feature: "Search talent database", lawyer: false, firm: true },
                  { feature: "Receive introduction requests", lawyer: true, firm: false },
                  { feature: "Send introduction requests", lawyer: false, firm: true },
                  { feature: "Visibility controls", lawyer: true, firm: false },
                  { feature: "Market insights", lawyer: true, firm: true },
                  { feature: "Block specific firms", lawyer: true, firm: false },
                  { feature: "Monthly introduction credits", lawyer: false, firm: true },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 text-foreground">{row.feature}</td>
                    <td className="px-6 py-3 text-center">
                      {row.lawyer ? <Check className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {row.firm ? <Check className="h-4 w-4 text-accent mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinChoice;
