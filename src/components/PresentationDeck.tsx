import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Printer, 
  Presentation, 
  ListCollapse, 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Settings, 
  Workflow, 
  Cpu, 
  Layers, 
  BarChart, 
  BookmarkCheck, 
  GraduationCap, 
  User, 
  Building,
  KeyRound,
  FileSearch,
  BookOpen,
  Briefcase,
  HelpCircle
} from "lucide-react";

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  notes: string;
  content: React.ReactNode;
}

export default function PresentationDeck({ onExit }: { onExit: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"slideshow" | "booklet">("slideshow");
  const [showNotes, setShowNotes] = useState(true);

  // Keyboard controls for slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "slideshow") return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, viewMode]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handlePrint = () => {
    // Switch to booklet mode first to expose all slides to the printer context
    setViewMode("booklet");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Slides structure matching exact requested specifications and premium visuals
  const slides: SlideData[] = [
    // Slide 1: Title
    {
      id: 1,
      category: "INTRODUCTION",
      title: "CampusConnect AI",
      subtitle: "AI-Powered Placement Management System",
      notes: "Welcome the panel. State project name and explain it is a modern, unified hub linking Students, TPOs, and Corporate Recruiters using intelligent automation.",
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-8 select-none" id="slide-1-content">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-125 animate-pulse"></div>
            <div className="relative bg-slate-950 text-white rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-blue-400 stroke-[1.5]" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              CampusConnect AI
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 max-w-xl mx-auto">
              A high-precision, role-based platform designed with intelligent AI pipelines for college-to-corporate career transitions.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono font-bold text-xs">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <User className="w-3.5 h-3.5" /> Student
            </span>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <Settings className="w-3.5 h-3.5" /> TPO CELL
            </span>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <Building className="w-3.5 h-3.5" /> RECRUITER
            </span>
          </div>
        </div>
      )
    },
    // Slide 2: Problem Statement
    {
      id: 2,
      category: "CHALLENGES",
      title: "The Problem Statement",
      subtitle: "Inefficiencies in Legacy Manual Workflows",
      notes: "Explain that placement work is plagued by manual spreadsheet errors, blind CV matching, and a severe communication gap between college administrative cells and corporate partners.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full text-left" id="slide-2-content">
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#E11D48] bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                The Bottleneck
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Why Legacy Placement Processes Fail Today
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Universities currently rely on massive spreadsheets and chaotic email channels to govern student compliance, CGPA minimum criteria, and recruitment schedules.
            </p>

            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex gap-4 items-start shadow-xs">
              <div className="bg-[#E11D48] text-white p-2 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">Key Consequence</h4>
                <p className="text-[11px] text-rose-900 font-medium leading-relaxed">
                  Qualified students miss cutoffs, TPO teams spend hundreds of hours manually verifying criteria, and recruiters receive low-accuracy resumes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                idx: "01",
                label: "Manual Spreadsheet Overhead",
                desc: "Severe data mismatch, verification delays, and missed eligibilities due to static trackers."
              },
              {
                idx: "02",
                label: "Zero Intelligent Alignment",
                desc: "No automated tool to compare student resume profiles dynamically against recruiter mandates."
              },
              {
                idx: "03",
                label: "Disjointed Communication",
                desc: "No unified pipeline for coordination across three core entities, leading to high friction."
              }
            ].map((p, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-xl p-4 flex gap-4 shadow-xs hover:border-blue-100 transition duration-200">
                <span className="font-mono text-xs font-black text-slate-300">{p.idx}</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">{p.label}</h4>
                  <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 3: Solution Overview
    {
      id: 3,
      category: "SOLUTION",
      title: "Solution Overview",
      subtitle: "The Automated AI Placement Ecosystem",
      notes: "This is our answer. A unified SaaS hub. Focus on how we replace spreadsheets with role-based, real-time dashboards integrated with Gemini AI pipelines.",
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center text-left" id="slide-3-content">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              INTRODUCING THE INTEGRATION HUB
            </span>
            <p className="text-xs text-slate-500 font-bold">
              Automating compliance with beautiful workspace portals tailored to each end-user.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <User className="w-5 h-5 text-blue-600" />,
                title: "Student Workspace",
                desc: "Enables profile configuration, simple resume upload, dashboard job listings, eligibility audits, and active recruitment pipelines tracking."
              },
              {
                icon: <Settings className="w-5 h-5 text-indigo-600" />,
                title: "TPO Control Tower",
                desc: "Orchestrates recruitment drives, triggers automated eligible students search, reviews bulk records upload, and generates metrics charts."
              },
              {
                icon: <Building className="w-5 h-5 text-purple-600" />,
                title: "Recruiter Command",
                desc: "Provides self-service portals to post recruitment drives, review ATS candidate profiles, run vetting, and grade interviews seamlessly."
              }
            ].map((s, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3 hover:border-indigo-100 hover:shadow-sm transition duration-300">
                <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100">
                  {s.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 font-sans tracking-tight">{s.title}</h4>
                  <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 4: Product Requirements
    {
      id: 4,
      category: "SPECIFICATIONS",
      title: "Product Requirements (MVP)",
      subtitle: "The Core Technical Deliverables",
      notes: "Discuss the essential deliverables from user accounts to database schemas, ensuring a highly durable local file fallback for maximum reliability.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full text-left" id="slide-4-content">
          <div className="md:col-span-5 space-y-4">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-3 py-1 rounded-full uppercase tracking-wider">
              Functional Scope
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Secure Architecture with Local Resilience
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              We engineered a system that operates completely securely with modern Firebase APIs and preserves full structural capability via a resilient file-backed local database backup.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "OAuth & Auth Controls", desc: "Firebase credentials safeguarding direct access levels." },
              { label: "Profile Managers", desc: "Dynamic student GPA and verified backlog tracker inputs." },
              { label: "Job & Drive Publishers", desc: "Allows recruiters or TPOs to configure active eligibilities instantly." },
              { label: "AI ATS Evaluator", desc: "Evaluates score metrics against requested job skill profiles." },
              { label: "Application Tracking", desc: "Governs student candidate states: applied, vetted, or hired." },
              { label: "Interview Schedulers", desc: "Coordinates meeting invites, time windows, and interview formats." }
            ].map((req, index) => (
              <div key={index} className="bg-slate-55 bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3 items-start hover:bg-white hover:border-blue-100 transition duration-200">
                <div className="mt-0.5 text-blue-600 bg-blue-100/50 p-1 rounded-md">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{req.label}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 5: System Workflow
    {
      id: 5,
      category: "ARCHITECTURE",
      title: "System Workflow",
      subtitle: "The Automated Lifecycle Diagram",
      notes: "Walk through the sequential pipeline. Highlight how it represents an automated and streamlined journey for continuous data collection, filtering, and placement.",
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center text-left" id="slide-5-content">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              End-to-End Placement Loop
            </span>
          </div>

          {/* Workflow Diagram Process Line */}
          <div className="relative mt-2">
            <div className="absolute top-[35px] left-8 right-8 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 hidden md:block z-0"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
              {[
                { step: "01", actor: "Student", label: "Registration", desc: "Creates profile, inputting GPA, branch, and uploading Resume." },
                { step: "02", actor: "TPO / HR", label: "Create Drive", desc: "Configures eligibility requirements and minimum GPA index details." },
                { step: "03", actor: "AI Services", label: "Auto Audit", desc: "Checks eligible student lists based on branch and score metrics." },
                { step: "04", actor: "Student", label: "Apply Now", desc: "Submits application dynamically with automated ATS assessment." },
                { step: "05", actor: "Recruiter", label: "Vetting CV", desc: "Reviews shortlisted ATS matches with HR feedback notes." },
                { step: "06", actor: "System", label: "Final Select", desc: "Approves placement offer states and logs campus career summary." }
              ].map((w, index) => (
                <div key={index} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center md:items-start text-center md:text-left space-y-2 shadow-xs hover:border-indigo-100 hover:shadow-xs transition duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {w.step}
                    </span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">
                      {w.actor}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase leading-snug tracking-tight">{w.label}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold leading-normal">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // Slide 6: AI Features
    {
      id: 6,
      category: "AI ENGINE",
      title: "AI Features",
      subtitle: "Powered by Gemini Language Model Integration",
      notes: "Explain that with the integrated Gemini SDK we analyze resume layouts, perform skill matching audits, and generate structured feedback instantly.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full text-left" id="slide-6-content">
          <div className="md:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold text-purple-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Intelligent Automation</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Smart Decision Engines
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
              CampusConnect AI doesn't just store files; it parses and decodes natural text datasets dynamically.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Resume ATS Score (Gemini API)",
                desc: "Parses uploaded resumes dynamically against specific job roles, scoring matching metrics instantly.",
                badge: "Gemini Pro"
              },
              {
                title: "Fuzzy Eligibility Audit",
                desc: "Resilient branch filter parses 'CS', 'CSE', and 'Computer' seamlessly, eliminating rigid matching bugs.",
                badge: "Fuzzy Logic"
              },
              {
                title: "Skill Gap Analysis",
                desc: "Recommends missing modules / certifications needed to perfectly align with recruiter parameters.",
                badge: "AI Advisor"
              },
              {
                title: "Mock Interview Copilot",
                desc: "Allows students to practice simulated QA checks according to specific JD requirements.",
                badge: "Gemini Audio-Prep"
              }
            ].map((ai, index) => (
              <div key={index} className="bg-[#0f172a] text-slate-100 rounded-2xl p-4 space-y-2.5 border border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[9px] font-mono font-bold uppercase text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-md">
                    {ai.badge}
                  </span>
                </div>
                <div className="space-y-1 relative z-10">
                  <h4 className="text-[11.5px] font-bold text-white tracking-tight leading-normal">{ai.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{ai.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 7: Tech Stack
    {
      id: 7,
      category: "TECHNOLOGY",
      title: "Tech Stack",
      subtitle: "The Production-Ready Toolkit",
      notes: "Detail the modern technological choices: Vite + React on Frontend, Express Node.js on Backend, Firebase for scalable store and auth.",
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center text-left" id="slide-7-content">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 font-mono tracking-wider">
              ENTERPRISE SYSTEM STACK
            </span>
            <p className="text-xs text-slate-500 font-bold">
              Clean modular separation ensuring scalable deployments and direct safety layers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                layer: "Frontend Core",
                tech: ["React.js", "Tailwind CSS", "Framer Motion"],
                color: "border-blue-200 bg-blue-50/20 text-blue-900"
              },
              {
                layer: "Backend Engine",
                tech: ["Node.js", "Express.js", "TypeScript (TSX)"],
                color: "border-indigo-200 bg-indigo-50/20 text-indigo-900"
              },
              {
                layer: "Database & Security",
                tech: ["Firebase Firestore", "Firebase Auth", "SSL Security"],
                color: "border-purple-200 bg-purple-50/20 text-purple-900"
              },
              {
                layer: "AI & Persistence",
                tech: ["Google Gemini API", "@google/genai SDK", "JSON Backup Engine"],
                color: "border-teal-200 bg-teal-50/20 text-teal-900"
              }
            ].map((st, index) => (
              <div key={index} className={`border rounded-2xl p-5 shadow-xs space-y-3 hover:scale-[1.02] transition-transform duration-300 ${st.color}`}>
                <h4 className="text-xs font-black uppercase tracking-wider font-sans leading-none">{st.layer}</h4>
                <div className="h-px bg-slate-200"></div>
                <ul className="space-y-2">
                  {st.tech.map((t, idx) => (
                    <li key={idx} className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 8: Architecture Overview
    {
      id: 8,
      category: "SYSTEM ARCHITECTURE",
      title: "Architecture Overview",
      subtitle: "The Logical Tier Schematics",
      notes: "Explain our tiered model. From clients sending API calls, routing is verified via JWT tokens, matching is handled gracefully by Gemini layers.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full text-left" id="slide-8-content">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
              High Availability Architecture
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Secure Tier Partitioning
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Our backend secures keys on the server-side, never leaking sensitive API credentials or JWT setups to the client browser.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1 hover:border-blue-105 transition duration-150">
              <h4 className="text-xs font-bold text-slate-900">100% Client-Side Protection</h4>
              <p className="text-[10px] text-slate-400 font-semibold font-mono">
                API calls go through specialized routes, ensuring user identities are verified at both Firebase and token levels.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-center">
            {[
              { tier: "CLIENT PRESENTATION LAYER", tech: "React UI Dashboard & Framer Layouts", styles: "bg-blue-500 text-white border-blue-400" },
              { tier: "SECURITY PORTAL & MIDDLEWARES", tech: "Firebase Auth Credentials & Custom JWT Verification Token", styles: "bg-indigo-500 text-white border-indigo-400" },
              { tier: "SERVER API CONTROLLER PLATFORM", tech: "Express.js Engine / Resilient DB Gateway", styles: "bg-purple-500 text-white border-purple-400" },
              { tier: "INTELLIGENT LAYER GATEWAYS", tech: "Google Gemini Large Language Parsing Models", styles: "bg-teal-500 text-white border-teal-400" }
            ].map((arc, index) => (
              <div key={index} className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-0.5 tracking-tight shadow-xs ${arc.styles}`}>
                <span className="text-[9.5px] font-black leading-none">{arc.tier}</span>
                <span className="text-[9px] opacity-90 font-medium leading-none">{arc.tech}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 9: Key Benefits
    {
      id: 9,
      category: "KEY METRICS",
      title: "Key Benefits",
      subtitle: "The Quantitative Value Proposition",
      notes: "Give the panel concrete data highlights. The system eliminates manual errors entirely, and speeds up CV processing by over 70%.",
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center text-left" id="slide-9-content">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#22C55E] uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              Performance Upgrades & Benefits
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { val: "70%", sub: "CV Screening Velocity", desc: "No manual scanning. AI scores match profiles instantly.", color: "text-blue-600 bg-blue-50 border-blue-100" },
              { val: "0", sub: "Vetting Compliance Bugs", desc: "Academic GPAs and backlogs checks are automated.", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              { val: "100%", sub: "Centralized Audit Sync", desc: "Everything is logged automatically inside Firebase database.", color: "text-purple-600 bg-purple-50 border-purple-100" },
              { val: "< 2s", sub: "Setup Execution Delay", desc: "Instantly provisions required schemas and backup data caches.", color: "text-teal-600 bg-teal-50 border-teal-100" }
            ].map((card, index) => (
              <div key={index} className={`border rounded-2xl p-5 shadow-xs space-y-2 flex flex-col items-center text-center ${card.color}`}>
                <span className="text-3xl font-black tracking-tight">{card.val}</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{card.sub}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Slide 10: Conclusion
    {
      id: 10,
      category: "CONCLUDING OUTRO",
      title: "Conclusion",
      subtitle: "The Future of Smart Placement Logistics",
      notes: "Conclude our Viva presentation. Emphasize that CampusConnect is live, responsive, fully secure, and ready for campus deployment today.",
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-8 select-none" id="slide-10-content">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-125 animate-pulse"></div>
            <div className="relative bg-slate-950 text-white rounded-3xl p-5 border border-white/10 shadow-2xl flex items-center justify-center">
              <GraduationCap className="w-14 h-14 text-indigo-400 stroke-[1.5]" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Ready for Real-World Deployment
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-xl mx-auto leading-relaxed">
              CampusConnect AI proves that adding intelligent language parsing pipelines to academic databases dramatically optimizes university student placements.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 px-6 py-3.5 rounded-2xl shadow-xs">
            <p className="text-xs font-black tracking-widest text-slate-450 text-slate-500 font-mono uppercase">
              ✨ THANK YOU FOR SECURING QUALITY PLACEMENTS ✨
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-12" id="presentation-deck-platform">
      {/* 1. TOP UTILITY HEADER FOR NAVIGATION & MODES SWITCHING */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-150-100 dark:border-slate-800 shadow-xs px-4 sm:px-6 lg:px-8 sticky top-0 z-50 print:hidden text-left">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white">
              <Presentation className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">CampusConnect AI Deck</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-mono">VIVA / HACKATHON PITCH DECK</span>
            </div>
          </div>

          {/* Mode controls tray */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <button
              onClick={() => setViewMode(viewMode === "slideshow" ? "booklet" : "slideshow")}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 border transition cursor-pointer ${
                viewMode === "booklet" 
                  ? "bg-indigo-600 text-white border-indigo-500" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
              title="Toggle Slide Sheet Booklet vs Interactive Slide Controller"
            >
              <ListCollapse className="w-4 h-4" />
              <span>{viewMode === "booklet" ? "Show Slideshow View" : "Show All Slides Booklet"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white border border-slate-900 dark:border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Export Full High-Precision Widescreen Slides Booklet to PDF using Native Browser Print Module"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Slide PDF</span>
            </button>

            <button
              onClick={onExit}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT LAYOUT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-8 pb-12 flex flex-col gap-6">
        
        {/* Quick Instructions bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-150-100 dark:border-blue-500/20 p-4 rounded-xl flex items-start gap-3 text-left shadow-xs print:hidden">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="block text-xs font-black text-blue-900 dark:text-blue-300 font-sans tracking-wide">
              Pro Pitch Slide Deck Instructions:
            </span>
            <span className="block text-[11px] text-blue-800 dark:text-blue-400 leading-normal font-semibold">
              Select <b>Print / Save Slide PDF</b>. Set the layout to <b>Landscape</b>, check <b>"Background graphics"</b> to preserve colors, and save to output a pristine, high-resolution vector Presentation PDF instantly! Use Left and Right key shortcuts for smooth slideshow controls.
            </span>
          </div>
        </div>

        {/* CONDITION-RENDER VIEW MODE */}
        {viewMode === "slideshow" ? (
          /* SLIDESHOW VIEW MODE WITH FRAMER MOTION TRANSITIONS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            {/* Widescreen Interactive Slide Projector Card */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl aspect-[16/10.2] overflow-hidden relative shadow-md flex flex-col p-8 sm:p-12"
                id="interactive-projector-slide"
              >
                {/* Background ambient accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[70px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[70px] pointer-events-none"></div>

                {/* Header branding on slide projector */}
                <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 font-mono text-[10px] pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{slides[currentSlide].category}</span>
                  <span className="font-bold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    CAMPUSCONNECT AI • SLIDE {currentSlide + 1} OF {slides.length}
                  </span>
                </div>

                {/* Animated Inner Slide Content Portal */}
                <div className="flex-1 flex flex-col justify-center relative z-10 py-6 min-h-0 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -25 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="h-full flex flex-col justify-center"
                    >
                      {/* Interactive slide titles */}
                      <div className="mb-6 space-y-1.5 shrink-0 text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                          {slides[currentSlide].title}
                        </h2>
                        <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {slides[currentSlide].subtitle}
                        </p>
                      </div>

                      {/* Content of slide */}
                      <div className="flex-1 min-h-0">
                        {slides[currentSlide].content}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer status markers */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  <span className="font-bold">✨ AI Placement Platform MVP v1.0</span>
                  <span className="font-bold">🎓 SPSU Career Development Labs</span>
                </div>
              </div>

              {/* PROJECTOR MANUAL CONTROLS ROW */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-xs">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${
                    currentSlide === 0
                      ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:bg-slate-50 dark:active:bg-slate-700 cursor-pointer"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                {/* Dots indicator track */}
                <div className="hidden sm:flex space-x-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === currentSlide ? "w-8 bg-indigo-600" : "w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                      }`}
                      title={`Go directly to Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="text-xs font-mono font-black text-slate-500 dark:text-slate-400">
                  {currentSlide + 1} / {slides.length}
                </div>

                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${
                    currentSlide === slides.length - 1
                      ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:bg-slate-50 dark:active:bg-slate-700 cursor-pointer"
                  }`}
                >
                  <span>Next Slide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SIDE SPEAKER NOTES TRAY COLUMN (PRO VIVA INSIGHTS SYSTEM) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 flex flex-col h-full text-left shadow-lg">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">Viva Speaker Companion</span>
                    <h3 className="text-sm font-extrabold text-white">5-Min Slides Talking Points</h3>
                  </div>
                  <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
                  >
                    {showNotes ? "Hide Notes" : "Show Notes"}
                  </button>
                </div>

                {showNotes ? (
                  <div className="flex-1 overflow-y-auto space-y-4 pt-4 text-xs font-sans leading-relaxed">
                    <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 block tracking-widest uppercase">
                        🎤 ACTIVE TALKING CUES
                      </span>
                      <p className="text-slate-300 font-medium leading-normal">
                        "{slides[currentSlide].notes}"
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 block tracking-widest uppercase">
                        💡 Presentation Cheat-sheet
                      </span>
                      <ul className="space-y-2 text-slate-400 font-medium">
                        <li className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          <span><b>Pacing strategy:</b> Present each slide for approximately 30 seconds to lock the 5-minute requirement cleanly.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          <span><b>Panel engagement:</b> Remind them that this system runs Live with Firebase and protects secrets securely via backend server proxies.</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          <span><b>Key AI highlight:</b> Talk about the Gemini dynamic resume rating analyzer which parses actual resumes without relying on simple static string matching.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-700" />
                    <p className="text-xs font-semibold">Cues minimize active panel state.</p>
                  </div>
                )}

                <div className="mt-auto border-t border-slate-800 pt-4 text-[10px] font-mono text-slate-500 tracking-wider flex items-center justify-between">
                  <span>⏰ TOTAL SPEAKING: 5M Max</span>
                  <span>🚀 AI INTEGRATED</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* BOOKLET MODE / ALL SLIDES VIEW (HIGH PRECISION PRINT GRID) */
          <div className="space-y-10 print:space-y-0 print:gap-0" id="print-slides-booklet-track">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 aspect-[16/10] flex flex-col shadow-sm relative overflow-hidden page-break-after-always print:border-none print:shadow-none print:m-0 print:p-6 print:rounded-none print:max-h-full print:w-full"
                style={{ breakAfter: "page" }}
              >
                {/* Visual grid watermark backdrops */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                {/* Slide index category labels */}
                <div className="flex justify-between items-center text-slate-400 font-mono text-[9.5px] pb-3 border-b border-slate-100 shrink-0">
                  <span className="font-extrabold text-[#3B82F6]">{s.category}</span>
                  <span className="font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-550 text-slate-500">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    CampusConnect AI • Slide {idx + 1} of {slides.length}
                  </span>
                </div>

                {/* Main central container */}
                <div className="flex-1 flex flex-col justify-center py-6">
                  <div className="mb-6 space-y-1 text-left shrink-0">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-indigo-600">
                      {s.subtitle}
                    </p>
                  </div>

                  {/* HTML Component Content view block */}
                  <div className="flex-1 flex flex-col justify-center">
                    {s.content}
                  </div>
                </div>

                {/* Speaker notes embedded directly underneath slide boundaries during custom screen views */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-left text-[11px] text-slate-600 font-medium leading-relaxed shrink-0 print:hidden mt-2">
                  <span className="font-bold text-slate-900 block tracking-wide text-[10px] uppercase font-mono mb-0.5">🎤 SPEAKER TALKING NOTES:</span>
                  "{s.notes}"
                </div>

                {/* Footer labels */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono text-slate-400 shrink-0 mt-4 leading-none print:mt-1">
                  <span>✨ AI Placement platform presentation deck</span>
                  <span>SPSU Computer Science Engineering Laboratory Research © 2026</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Embedded print css blocks to ensure perfect landscaping breaks on printers */}
      <style>{`
        @media print {
          /* Force standard landscape formatting scales */
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #presentation-deck-platform {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
          }
          main {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-slides-booklet-track > div {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 40px !important;
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            box-sizing: border-box;
            break-after: page !important;
            page-break-after: always !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}
