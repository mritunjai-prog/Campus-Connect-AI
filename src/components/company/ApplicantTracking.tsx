import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  Sparkles, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  HelpCircle,
  FileText,
  AlertCircle,
  MessageSquare,
  Wrench,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Brain
} from "lucide-react";
import { PlacementDrive, Application } from "../../types";

interface ApplicantTrackingProps {
  drives: PlacementDrive[];
  applications: Application[];
  token: string;
  apiBaseUrl: string;
  onRefresh: () => void;
  onScheduleInterview: (appId: string, studentName: string) => void;
}

interface CoPilotRankingResult {
  applicationId: string;
  aiScore: number;
  recommendation: "Strong" | "Medium" | "Weak";
  skillMatchPercentage: number;
  summary: string;
  suggestedQuestions: string[];
}

export default function ApplicantTracking({
  drives,
  applications,
  token,
  apiBaseUrl,
  onRefresh,
  onScheduleInterview
}: ApplicantTrackingProps) {
  // Drive Selection Tracker
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");
  
  // Filtering Trackers
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [minResume, setMinResume] = useState<number>(0);

  // HR Feedback State Map (applicationId -> string)
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  
  // AI Co-pilot Rankings States
  const [copilotRankings, setCopilotRankings] = useState<CoPilotRankingResult[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState("");
  const [copilotActivated, setCopilotActivated] = useState<Record<string, boolean>>({}); // driveId -> activated true/false

  // Questions modal
  const [showQuestionsForAppId, setShowQuestionsForAppId] = useState<string | null>(null);

  // Status submission tracking
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [actionStatusMsg, setActionStatusMsg] = useState("");

  const handleFeedbackChange = (appId: string, text: string) => {
    setFeedbacks(prev => ({ ...prev, [appId]: text }));
  };

  // Trigger server-side Gemini ranking co-pilot evaluation
  const handleTriggerAICopilot = async (driveId: string) => {
    if (driveId === "all") {
      setCopilotError("Kindly select a targeted job drive position first to run AI co-pilot rankings.");
      return;
    }
    
    setCopilotLoading(true);
    setCopilotError("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/ai/copilot-rankings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ driveId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger AI rankings.");

      // Merge new rankings with existing
      const newRankings: CoPilotRankingResult[] = data.rankings || [];
      setCopilotRankings(prev => {
        const filtered = prev.filter(r => !newRankings.some(nr => nr.applicationId === r.applicationId));
        return [...filtered, ...newRankings];
      });

      setCopilotActivated(prev => ({ ...prev, [driveId]: true }));
    } catch (err: any) {
      setCopilotError("Gemini analysis failed: " + (err.message || "Please make sure your AI Key is configured. Running local fallback metrics."));
    } finally {
      setCopilotLoading(false);
    }
  };

  // Process manual candidate status adjust
  const handleModifyStatus = async (appId: string, targetStatus: string) => {
    setActionLoadingId(appId);
    setActionStatusMsg("");

    const hrNote = feedbacks[appId] || `Applicant status adjusted to: ${targetStatus}.`;

    try {
      const res = await fetch(`${apiBaseUrl}/api/applications/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatus,
          feedback: hrNote
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust status");

      setActionStatusMsg(`Marked candidate status: ${targetStatus}!`);
      onRefresh();
      setTimeout(() => {
        setActionLoadingId("");
        setActionStatusMsg("");
      }, 2000);
    } catch (err: any) {
      alert("Error: " + err.message);
      setActionLoadingId("");
    }
  };

  // Extract unique branches from loaded applications to feed selects dynamically
  const uniqueBranches = Array.from(new Set(applications.map(a => a.studentBranch).filter(Boolean)));

  // Filter applications by position selection and slide deck specs
  const filteredApplicants = applications.filter(app => {
    // Select position filter
    const matchesDrive = selectedDriveId === "all" || app.driveId === selectedDriveId;
    
    // Slide dec input standards
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === "all" || app.studentBranch === filterBranch;
    const matchesCgpa = (app.studentCgpa || 0) >= minCgpa;
    const matchesResume = (app.resumeScore || 0) >= minResume;

    return matchesDrive && matchesSearch && matchesBranch && matchesCgpa && matchesResume;
  });

  return (
    <div className="space-y-6" id="comp-applicant-subtab">
      
      {/* Position selector top control bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Qualified Candidate Pipeline</h2>
          <p className="text-xs text-slate-500">Screen, interview, and evaluate student submissions</p>
        </div>
        
        {/* Dropdown position selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">Selected Position:</span>
          <select
            value={selectedDriveId}
            onChange={(e) => {
              setSelectedDriveId(e.target.value);
              setCopilotError("");
            }}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Placement Openings ({drives.length})</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>{d.jobRole} ({d.packageLPA} LPA)</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Recruiter Assistant Copilot panel */}
      {selectedDriveId !== "all" && (
        <div className="bg-gradient-to-r from-emerald-950 to-slate-950 border border-emerald-800 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg animate-fade-in" id="copilot-panel">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium">
                <Brain className="w-4 h-4 animate-pulse shrink-0" />
                <span>Gemini recruiter copilot active</span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                Activate Cognitive Candidate Evaluation
              </h3>
              <p className="text-slate-300 text-xs max-w-xl">
                Run server-side Gemini-3.5 cognitive modeling across all candidates. Auto-rank applicants, view skill match levels, assess candidate suitability, and generate tailored tech interview questions.
              </p>
            </div>

            <button
              onClick={() => handleTriggerAICopilot(selectedDriveId)}
              disabled={copilotLoading}
              className="inline-flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/10 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{copilotLoading ? "Analyzing Profiles..." : (copilotActivated[selectedDriveId] ? "Refresh AI Assessments" : "Compute AI Fit & Rankings")}</span>
            </button>
          </div>

          {copilotError && (
            <div className="mt-4 bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl flex items-start space-x-2.5 leading-relaxed font-sans">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{copilotError}</span>
            </div>
          )}
        </div>
      )}

      {/* Recruiter standard sliding filters and filters deck */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6" id="applicants-deck-filters">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Search Candidates (Name or Major)</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Branch filter</label>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
          >
            <option value="all">All Disciplines</option>
            {uniqueBranches.map((br, idx) => (
              <option key={idx} value={br}>{br}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Cgpa Cutoff Check: {minCgpa}+</label>
          <input 
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={minCgpa}
            onChange={(e) => setMinCgpa(Number(e.target.value))}
            className="w-full accent-emerald-600 mt-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Candidates List Lattice Grid */}
      {filteredApplicants.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-xs">
          No applicants match filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6" id="applicants-screening-list">
          {filteredApplicants.map(app => {
            // Find corresponding AI copilot ranking assessment if activated
            const hasAiAssessment = copilotRankings.find(r => r.applicationId === app.id);
            const isSelectedForQuestions = showQuestionsForAppId === app.id;

            return (
              <div 
                key={app.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition flex flex-col lg:flex-row justify-between gap-6"
              >
                
                {/* Candidate basic profile dossier details (left 50% width) */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-50 border border-emerald-150 flex items-center justify-center shrink-0">
                      {app.studentPhotoUrl ? (
                        <img src={app.studentPhotoUrl} alt={app.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-emerald-600 uppercase font-black text-sm">{app.studentName.substring(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">{app.studentName}</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono font-bold mt-1.5 uppercase">Applied for: {app.jobRole}</span>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">{app.studentBranch} Major • CGPA: <b>{app.studentCgpa}</b> • Backlogs: <b>{app.studentBacklogs}</b></p>
                    </div>
                  </div>

                  {app.eligibilityExplanation && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-800/50">
                      💡 <b>Academic Cutoff Status:</b> {app.eligibilityExplanation}
                    </div>
                  )}

                  {/* Skills / PDF Download */}
                  <div className="flex flex-wrap gap-2 pt-1 items-center">
                    {app.resumeUrl ? (
                      <a 
                        href={`${apiBaseUrl}${app.resumeUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-slate-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Student Resume PDF</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic">No physical resume PDF uploaded</span>
                    )}
                    {app.resumeScore > 0 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-mono px-2.5 py-1 rounded-xl font-bold">
                        ATS Strength score: {app.resumeScore}%
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Recruiter Copilot assessments widget (middle block) */}
                {hasAiAssessment && (
                  <div className="bg-emerald-900/5 border border-emerald-650/20 p-4 rounded-2xl flex-1 flex flex-col justify-between space-y-3 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-emerald-600/10">
                        <span className="inline-flex items-center space-x-1 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Gemini Evaluator</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-450 uppercase font-bold">AI Suitability:</span>
                          <span className={`text-[10px] font-mono font-black border text-center px-2 py-0.5 rounded ${hasAiAssessment.recommendation === "Strong" ? "bg-emerald-50 border-emerald-250 text-emerald-800" : (hasAiAssessment.recommendation === "Medium" ? "bg-amber-50 border-amber-250 text-amber-800" : "bg-rose-50 border-rose-250 text-rose-800")}`}>
                            {hasAiAssessment.recommendation} Fit
                          </span>
                        </div>
                      </div>

                      {/* AI fit score */}
                      <div className="flex items-center space-x-3 mt-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-black font-mono leading-none">{hasAiAssessment.aiScore}</span>
                          <span className="text-[8px] font-bold uppercase leading-none opacity-80">Score</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{hasAiAssessment.summary}</p>
                          <span className="text-[9px] font-mono text-emerald-600 block mt-1">Skill Match Score: <b>{hasAiAssessment.skillMatchPercentage}%</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setShowQuestionsForAppId(isSelectedForQuestions ? null : app.id)}
                        className="w-full inline-flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 hover:bg-emerald-50 font-bold border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-700 rounded-xl py-2 px-3 transition cursor-pointer"
                      >
                        <span>View Custom Interview Suggestions</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${isSelectedForQuestions ? "rotate-180" : ""}`} />
                      </button>

                      {isSelectedForQuestions && (
                        <div className="mt-2.5 bg-white dark:bg-slate-900 border border-emerald-100 p-3 rounded-xl text-xs space-y-2 text-slate-650 shadow-sm animate-fade-in">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Tailored Technical Questions Suggestions:</span>
                          {hasAiAssessment.suggestedQuestions.map((q, idx) => (
                            <div key={idx} className="flex gap-1.5 leading-relaxed">
                              <span className="font-mono text-emerald-600 shrink-0 font-bold">{idx + 1}.</span>
                              <p className="font-medium text-slate-700 dark:text-slate-200">{q}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Candidate Selection Manual Decision panel (right side) */}
                <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5 flex flex-col justify-between space-y-3 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono font-bold uppercase">Candidate screening state</span>
                    <span className={`text-[11px] font-black uppercase text-center border px-2.5 py-1 rounded inline-block ${app.status === "selected" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : (app.status === "rejected" ? "bg-rose-50 border-rose-250 text-rose-800" : (app.status === "applied" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-indigo-50 border-indigo-200 text-indigo-800"))}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">Recruiter HR Feedback Note</label>
                    <input 
                      type="text" 
                      placeholder="Add HR feedback and select decision..."
                      value={feedbacks[app.id] || ""}
                      onChange={(e) => handleFeedbackChange(app.id, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 focus:border-emerald-500"
                    />
                  </div>

                  {actionLoadingId === app.id && actionStatusMsg ? (
                    <div className="bg-emerald-50 p-2.5 border border-emerald-250 text-emerald-800 text-[11px] rounded-xl font-bold flex items-center space-x-2 animate-pulse">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{actionStatusMsg}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 text-xs select-none">
                      <button 
                        onClick={() => handleModifyStatus(app.id, "shortlisted")}
                        className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 border text-slate-700 dark:text-slate-200 py-2 rounded-xl text-[11px] font-semibold transition"
                      >
                        Shortlist
                      </button>
                      <button 
                        onClick={() => onScheduleInterview(app.id, app.studentName)}
                        className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-850 py-2 rounded-xl text-[11px] font-semibold transition"
                      >
                        Interview
                      </button>
                      <button 
                        onClick={() => handleModifyStatus(app.id, "selected")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[11px] shadow-sm transition"
                      >
                        Hire Option
                      </button>
                      <button 
                        onClick={() => handleModifyStatus(app.id, "rejected")}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-800 py-2 rounded-xl text-[11px] font-semibold transition"
                      >
                        Reject Option
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
