import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Brain, Target, ShieldCheck, BarChart3, Users, Calendar, Bell,
  ArrowRight, Check, Building2, GraduationCap, Briefcase, Rocket, Zap,
  TrendingUp, FileText, Star, ChevronRight, Globe, Cpu,
} from "lucide-react";
import heroAi from "@/assets/hero-ai.jpg";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusConnect AI — Intelligent Placement Management Platform" },
      { name: "description", content: "AI-powered placement platform connecting students, recruiters, and TPOs. Smart matching, automated eligibility, real-time analytics." },
      { property: "og:title", content: "CampusConnect AI — The Future of Campus Placements" },
      { property: "og:description", content: "Intelligent automation for campus hiring. Resume analysis, smart matching, and unified dashboards." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: Landing,
});

function useCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const v = useCounter(value, 2000, visible);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient font-display">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1200px,calc(100%-2rem))]">
      <nav className="glass-strong px-6 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-vibrant)" }}>
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <span className="font-display font-bold text-lg">CampusConnect <span className="text-gradient">AI</span></span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#dashboards" className="hover:text-foreground transition">Dashboards</a>
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#testimonials" className="hover:text-foreground transition">Stories</a>
        </div>
        <button className="btn-primary text-sm hover:[&]:btn-primary-hover">
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-32 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl animate-glow-pulse" style={{ background: "var(--violet)" }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-glow-pulse" style={{ background: "var(--cyan)", animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-6 text-sm">
            <span className="w-2 h-2 rounded-full animate-glow-pulse" style={{ background: "var(--accent)" }} />
            <span className="text-muted-foreground">Now live for 200+ institutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
            The future of <span className="text-gradient">campus placements</span> is intelligent.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            CampusConnect AI unifies students, recruiters, and placement officers through smart automation —
            from resume analysis to offer letters, all in one beautifully orchestrated platform.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <button className="btn-primary group hover:-translate-y-0.5 transition-transform">
              Launch Platform <Rocket className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button className="btn-ghost hover:bg-white/10">
              Watch Demo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            <Stat value={94} suffix="%" label="Placement Rate" />
            <Stat value={1200} suffix="+" label="Recruiters" />
            <Stat value={45000} suffix="+" label="Students" />
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative animate-float">
            <div className="absolute inset-0 blur-3xl opacity-60" style={{ background: "var(--gradient-vibrant)" }} />
            <img src={heroAi} alt="AI neural network" width={1536} height={1024}
              className="relative rounded-3xl border border-white/10 shadow-2xl" />
          </div>
          {/* Floating cards */}
          <div className="absolute -left-6 top-10 glass-strong p-4 w-56 animate-float" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <Brain className="w-5 h-5 text-background" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Resume Score</div>
                <div className="font-semibold">92 / 100</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 bottom-16 glass-strong p-4 w-60 animate-float" style={{ animationDelay: "2s" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--cyan), var(--fuchsia))" }}>
                <Target className="w-5 h-5 text-background" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Match Found</div>
                <div className="font-semibold text-sm">Google · SDE Intern</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const logos = ["Google", "Microsoft", "Amazon", "Meta", "Adobe", "Stripe", "Atlassian", "Oracle"];
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
          Trusted by recruiters from world-class companies
        </p>
        <div className="glass px-8 py-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((l) => (
            <span key={l} className="font-display font-semibold text-lg text-muted-foreground hover:text-foreground transition">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const problems = [
    { icon: FileText, title: "Manual resume screening", desc: "TPOs drown in spreadsheets and email chains." },
    { icon: Calendar, title: "Scheduling chaos", desc: "Drives clash, slots overlap, students get notified too late." },
    { icon: ShieldCheck, title: "Eligibility errors", desc: "CGPA and backlog rules enforced by hand — costly mistakes." },
    { icon: BarChart3, title: "Zero visibility", desc: "No real-time analytics to guide placement strategy." },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-4">The Problem</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Traditional placements are <span className="text-gradient">broken</span>.</h2>
          <p className="text-muted-foreground text-lg">Email threads, Excel sheets, and last-minute WhatsApp groups can't scale to thousands of students and hundreds of recruiters.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p) => (
            <div key={p.title} className="glass p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-destructive/20 text-destructive">
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "AI Resume Analysis", desc: "Deep parsing extracts skills, projects, and gaps — with actionable improvement scores.", grad: "linear-gradient(135deg, var(--violet), var(--fuchsia))" },
    { icon: Target, title: "Smart Job Matching", desc: "Vector embeddings match students to roles by skill, intent, and culture fit.", grad: "linear-gradient(135deg, var(--cyan), var(--violet))" },
    { icon: ShieldCheck, title: "Automated Eligibility", desc: "CGPA, backlog, and branch rules verified instantly across thousands of applications.", grad: "linear-gradient(135deg, var(--fuchsia), var(--accent))" },
    { icon: BarChart3, title: "Placement Analytics", desc: "Live dashboards on offers, packages, conversion funnels, and recruiter health.", grad: "linear-gradient(135deg, var(--accent), var(--cyan))" },
    { icon: Calendar, title: "Interview Management", desc: "Auto-schedule rounds, sync calendars, and capture panelist feedback in one flow.", grad: "linear-gradient(135deg, var(--violet), var(--cyan))" },
    { icon: Bell, title: "Real-Time Notifications", desc: "Multi-channel alerts via email, SMS, and push — nobody misses a deadline again.", grad: "linear-gradient(135deg, var(--fuchsia), var(--violet))" },
  ];
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-4">Platform</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need, <span className="text-gradient">intelligently connected</span>.</h2>
          <p className="text-muted-foreground text-lg">Six pillars of automation, designed for the modern campus.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="glass p-7 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition" style={{ background: f.grad }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: f.grad }}>
                <f.icon className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboards() {
  const roles = [
    { icon: GraduationCap, title: "Student", desc: "Personalized roles, application tracker, AI resume coach, interview prep, offer manager.", color: "var(--cyan)" },
    { icon: Briefcase, title: "TPO / Placement Cell", desc: "Drive scheduler, eligibility engine, recruiter CRM, batch analytics, compliance reports.", color: "var(--violet)" },
    { icon: Building2, title: "Company / Recruiter", desc: "Talent search, shortlist automation, interview pipelines, branded campus presence.", color: "var(--fuchsia)" },
  ];
  return (
    <section id="dashboards" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-4">Role-Based Dashboards</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">One platform, <span className="text-gradient">three perspectives</span>.</h2>
        </div>

        <div className="relative mb-12">
          <div className="absolute inset-0 blur-3xl opacity-40" style={{ background: "var(--gradient-vibrant)" }} />
          <div className="relative glass-strong p-3 rounded-3xl overflow-hidden">
            <img src={dashboardPreview} alt="Dashboard preview" loading="lazy" width={1536} height={1024}
              className="w-full rounded-2xl" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.title} className="glass p-7 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: r.color }}>
                <r.icon className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { icon: FileText, title: "Onboard", desc: "Students upload resumes, TPOs import batch data." },
    { icon: Brain, title: "Analyze", desc: "AI parses, scores, and enriches every profile." },
    { icon: Target, title: "Match", desc: "Eligible candidates surface for each open role." },
    { icon: Calendar, title: "Interview", desc: "Auto-scheduled rounds with real-time feedback." },
    { icon: Rocket, title: "Place", desc: "Offers tracked, analytics updated, success celebrated." },
  ];
  return (
    <section id="workflow" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-4">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The complete <span className="text-gradient">placement journey</span>.</h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-7 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--violet), var(--cyan), var(--fuchsia), transparent)" }} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="glass p-6 text-center h-full hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 relative" style={{ background: "var(--gradient-primary)" }}>
                    <s.icon className="w-6 h-6 text-background" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-background border border-white/20">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto glass-strong p-10 md:p-16 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-vibrant)" }} />
        <div className="relative grid md:grid-cols-4 gap-10 text-center">
          <Stat value={94} suffix="%" label="Avg Placement Rate" />
          <Stat value={3} suffix="x" label="Faster Drives" />
          <Stat value={200} suffix="+" label="Partner Institutions" />
          <Stat value={18} suffix=" LPA" label="Avg Package" />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "CampusConnect AI cut our drive coordination time by 70%. Our students see opportunities they'd have missed entirely.", a: "Dr. Priya Sharma", r: "TPO, IIT-grade Institute" },
    { q: "The matching engine is uncanny. We hired 12 interns last cycle — every single one was a culture fit.", a: "Arjun Mehta", r: "Talent Lead, FinTech Unicorn" },
    { q: "I got placed at my dream company because the AI flagged a role I never would have applied to.", a: "Riya Kapoor", r: "SDE I, Global Tech" },
  ];
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-block glass px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-4">Loved by campuses</div>
          <h2 className="text-4xl md:text-5xl font-bold">Stories from the <span className="text-gradient">community</span>.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.a} className="glass p-7 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "var(--accent)" }} />)}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 flex-1">"{t.q}"</p>
              <div>
                <div className="font-semibold">{t.a}</div>
                <div className="text-sm text-muted-foreground">{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto glass-strong p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 animate-glow-pulse" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-3xl opacity-20 animate-spin-slow" style={{ background: "conic-gradient(from 0deg, var(--violet), var(--cyan), var(--fuchsia), var(--violet))" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-6 text-sm">
            <Zap className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="text-muted-foreground">Limited onboarding slots for 2026 batch</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to transform <br /><span className="text-gradient">campus placements?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join 200+ institutions building the smartest placement ecosystem in the country.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="btn-primary hover:-translate-y-0.5 transition-transform">
              Book a Demo <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn-ghost hover:bg-white/10">
              Talk to Sales
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card", "14-day pilot", "Dedicated CSM"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: "var(--accent)" }} />{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-vibrant)" }}>
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <span className="font-display font-semibold">CampusConnect <span className="text-gradient">AI</span></span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Security</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
        <div className="text-sm text-muted-foreground">© 2026 CampusConnect AI</div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Problem />
        <Features />
        <Dashboards />
        <Workflow />
        <Metrics />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
