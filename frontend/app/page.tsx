"use client"
import Link from "next/link"
import { motion } from "framer-motion";
import { Shield, Eye, Users, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">Counsel</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">For Firms</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/profile-builder">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-32 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.h1
            className="font-display text-5xl md:text-7xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance"
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            Discover opportunities
            <br />
            <span className="text-muted-foreground">without looking.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Anonymous talent matching for lawyers and law firms.
            No recruiters. No exposure. Just the right conversations.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/profile-builder">
                Join as Lawyer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/search">Hire Lawyers</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <motion.section
        className="py-20 px-6 border-t border-border"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Completely Anonymous", desc: "Your identity stays hidden until you decide to reveal it. No firm sees your name without your consent." },
              { icon: Eye, title: "Profiles Verified Monthly", desc: "Every profile is reviewed to maintain quality. Firms trust that data is current and accurate." },
              { icon: Users, title: "Used by Top-Tier Firms", desc: "Leading firms use Counsel to find passive candidates who aren't on the market — yet." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow duration-300"
                variants={fadeUp} custom={i + 1}
              >
                <div className="h-10 w-10 rounded-lg bg-accent-muted flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-display text-sm text-muted-foreground">© 2026 Counsel</span>
          <span className="text-xs text-muted-foreground">Discreet. Direct. Recruiter-free.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
