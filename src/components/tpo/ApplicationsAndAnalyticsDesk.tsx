import React, { useState } from "react";
import { 
  Layers, 
  Search, 
  Filter, 
  CheckSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  BookOpen, 
  Calendar, 
  Layers as PipelineIcon,
  ChevronRight,
  TrendingDown,
  BarChart4,
  PlusCircle,
  X,
  FileText
} from "lucide-react";
import { Application, StudentProfile } from "../../types";

interface ApplicationsAndAnalyticsDeskProps {
  applications: Application[];
  students: StudentProfile[];
  onUpdateAppStatus: (appId: string, status: string, feedback?: string) => void;
  activeView: "applications_tracker" | "placement_analytics";
}

export default function ApplicationsAndAnalyticsDesk({
  applications,
  students,
  onUpdateAppStatus,
  activeView
}: ApplicationsAndAnalyticsDeskProps) {

  // Tracker Filters
  const [appQuery, setAppQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Interactive interview scheduler popup helper
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("2026-08-15");
  const [interviewTime, setInterviewTime] = useState("10:00 AM");
  const [interviewLink, setInterviewLink] = useState("https://meet.google.com/abc-defg-hij");

  // Dynamic calculations for stages
  const countAll = applications.length;
  const countApplied = applications.filter(a => a.status === "applied").length;
  const countShortlisted = applications.filter(a => a.status === "shortlisted").length;
  const countScheduled = applications.filter(a => a.status === "interview_scheduled").length;
  const countSelected = applications.filter(a => a.status === "selected").length;
  const countRejected = applications.filter(a => a.status === "rejected").length;

  // Filter application pipeline
  const filteredApps = applications.filter(app => {
    const termMatch = app.studentName?.toLowerCase().includes(appQuery.toLowerCase()) || 
                      app.companyName?.toLowerCase().includes(appQuery.toLowerCase()) ||
                      app.jobRole?.toLowerCase().includes(appQuery.toLowerCase());
    
    const filterMatch = statusFilter === "all" || app.status === statusFilter;

    return termMatch && filterMatch;
  });

  const handleUpdateStatus = (appId: string, targetStatus: string) => {
    onUpdateAppStatus(appId, targetStatus, "TPO state tracking update");
  };

  const handleRecordSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingAppId) return;
    onUpdateAppStatus(schedulingAppId, "interview_scheduled", `Scheduled on ${interviewDate} at ${interviewTime}. Join: ${interviewLink}`);
    setSchedulingAppId(null);
  };

  // ANALYTICS COMPUTATIONS (Tab 7)
  // 1. Department-wise Placement Rate
  const branches = ["Computer Science", "Information Technology", "Mechanical Engineering", "Electronics", "Electrical Engineering", "Civil Engineering"];
  const branchRate = branches.map(brName => {
    const totalInBranch = students.filter(s => s.branch === brName).length;
    const placedInBranch = students.filter(s => s.branch === brName && applications.some(a => a.studentId === s.id && a.status === "selected")).length;
    const rate = totalInBranch > 0 ? Math.round((placedInBranch / totalInBranch) * 100) : 0;
    return { branch: brName, total: totalInBranch, placed: placedInBranch, rate };
  });

  // 2. Package Distribution indexer
  const packageDistribution = [
    { range: "< 5 LPA", count: applications.filter(a => a.status === "selected" && (a.packageLPA || 0) < 5).length },
    { range: "5 - 10 LPA", count: applications.filter(a => a.status === "selected" && (a.packageLPA || 0) >= 5 && (a.packageLPA || 0) < 10).length },
    { range: "10 - 15 LPA", count: applications.filter(a => a.status === "selected" && (a.packageLPA || 0) >= 10 && (a.packageLPA || 0) < 15).length },
    { range: "15+ LPA", count: applications.filter(a => a.status === "selected" && (a.packageLPA || 0) >= 15).length }
  ];

  // 3. Top Hiring Recruiters
  const recruitersComp: { [key: string]: number } = {};
  applications.forEach(app => {
    if (app.status === "selected" && app.companyName) {
      recruitersComp[app.companyName] = (recruitersComp[app.companyName] || 0) + 1;
    }
  });
  const recruiterRanking = Object.entries(recruitersComp)
    .map(([companyName, count]) => ({ companyName, count }))
    .sort((a,b) => b.count - a.count);

  return (
    <div className="space-y-6 animate-fade-in" id="applications-and-analytics-desk">
      
      {/* RENDER TAB 6: APPLICATIONS TRACKER */}
      {activeView === "applications_tracker" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-201 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Hiring Drives & Submissions Pipeline</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500">Track candidates shortlists, schedule virtual loops, and record actual hire choices</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Query search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Filter student or company..."
                  value={appQuery}
                  onChange={(e) => setAppQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Quick status dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-55 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
              >
                <option value="all">Every Single Stage</option>
                <option value="applied">Applied (Pending Review)</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview_scheduled">Interview Set</option>
                <option value="selected">Offers Signed</option>
                <option value="rejected">Rejected Candidates</option>
              </select>
            </div>
          </div>

          {/* Core Counters row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button onClick={() => setStatusFilter("all")} className={`p-3 rounded-xl border text-center transition ${statusFilter === "all" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <span className="text-[9px] uppercase font-bold block">Every Application</span>
              <span className="text-xl font-black block mt-0.5">{countAll}</span>
            </button>
            <button onClick={() => setStatusFilter("applied")} className={`p-3 rounded-xl border text-center transition ${statusFilter === "applied" ? "bg-amber-600/10 border-amber-500/30 text-amber-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <span className="text-[9px] uppercase font-bold block">Review Staged</span>
              <span className="text-xl font-black block mt-0.5">{countApplied}</span>
            </button>
            <button onClick={() => setStatusFilter("shortlisted")} className={`p-3 rounded-xl border text-center transition ${statusFilter === "shortlisted" ? "bg-cyan-650/10 border-cyan-500/30 text-cyan-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <span className="text-[9px] uppercase font-bold block">Shortlisted</span>
              <span className="text-xl font-black block mt-0.5">{countShortlisted}</span>
            </button>
            <button onClick={() => setStatusFilter("interview_scheduled")} className={`p-3 rounded-xl border text-center transition ${statusFilter === "interview_scheduled" ? "bg-violet-600/10 border-violet-500/30 text-violet-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <span className="text-[9px] uppercase font-bold block">Interviews Set</span>
              <span className="text-xl font-black block mt-0.5">{countScheduled}</span>
            </button>
            <button onClick={() => setStatusFilter("selected")} className={`p-3 rounded-xl border text-center transition ${statusFilter === "selected" ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <span className="text-[9px] uppercase font-bold block font-bold text-emerald-600">Selected (Hired)</span>
              <span className="text-xl font-black block mt-0.5">{countSelected}</span>
            </button>
          </div>

          {/* List layout of candidates */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Company Designation</th>
                    <th className="p-4">CTC LPA</th>
                    <th className="p-4">Eligible Stream</th>
                    <th className="p-4">Current Progress</th>
                    <th className="p-4 text-right">Clearance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 italic">No application submissions suited to specifications</td>
                    </tr>
                  ) : (
                    filteredApps.map(app => {
                      const isSelected = app.status === "selected";
                      const isRejected = app.status === "rejected";
                      const isScheduled = app.status === "interview_scheduled";
                      const isShortlisted = app.status === "shortlisted";
                      const isApplied = app.status === "applied";

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/30 transition-colors" id={`table-row-app-${app.id}`}>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            <div>
                              <span>{app.studentName}</span>
                              <span className="text-[9px] font-normal text-slate-450 block">{app.studentEmail}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="block font-bold">{app.jobRole}</span>
                              <span className="text-[10px] text-indigo-500">{app.companyName}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {app.packageLPA} LPA
                          </td>
                          <td className="p-4 text-slate-500">
                            CSE/IT Dept
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                              isSelected 
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" 
                                : isRejected 
                                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40" 
                                  : isScheduled 
                                    ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-955/35"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              {isApplied && (
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, "shortlisted")}
                                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[9px] px-2 py-1 rounded"
                                >
                                  Shortlist
                                </button>
                              )}
                              
                              {isShortlisted && (
                                <button 
                                  onClick={() => setSchedulingAppId(app.id)}
                                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[9px] px-2 py-1 rounded"
                                >
                                  Set Interview
                                </button>
                              )}

                              {isScheduled && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(app.id, "selected")}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-1 rounded"
                                  >
                                    Accept Hire
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(app.id, "rejected")}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] px-2 py-1 rounded"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              <span className="text-[10px] text-slate-400 dark:text-slate-500">No pending action</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 7: PLACEMENT ANALYTICS */}
      {activeView === "placement_analytics" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Campus Placements Analytics Matrix</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">Examine branch placement rates, distribution spreads, and recruiter hiearchies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Branch placement rates custom visual */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4" id="analytics-branch-performance-chart">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Branch Performance Report</h4>
              
              <div className="space-y-4 pt-2">
                {branchRate.map(br => (
                  <div key={br.branch} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-900 dark:text-slate-300">
                      <span>{br.branch}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{br.rate}% Placed ({br.placed}/{br.total} students)</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${br.rate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Package Distribution Spreasheet */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4" id="analytics-package-distribution-chart">
              <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">CTC Compensation Groups Distribution</h3>
              
              <div className="flex flex-col space-y-3 pt-4 select-none">
                {packageDistribution.map((group, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs">
                    {/* Range tag */}
                    <span className="w-24 font-bold text-slate-550 dark:text-slate-350">{group.range}</span>
                    {/* Block Representation */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-6 rounded-lg overflow-hidden flex">
                      <div 
                        className="bg-emerald-505 bg-emerald-500 h-full rounded-lg text-[9px] font-black text-white flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${group.count > 0 ? (group.count / Math.max(...packageDistribution.map(g=>g.count), 1)) * 100 : 3}%` }}
                      >
                        {group.count > 0 && `${group.count}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-450 block italic">Distribution computed automatically from approved corporate placements registers.</span>
              </div>
            </div>

            {/* Recruiter contributions and statistics table */}
            <div className="col-span-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4" id="analytics-top-hirer-contributions">
              <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Recruiter Contributions Summary</h3>

              {recruiterRanking.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No job selections mapped inside registered drives yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  {recruiterRanking.map((itm, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center space-x-3">
                      <div className="bg-indigo-600/10 text-indigo-600 p-3 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 block uppercase font-bold">Top Partner {idx+1}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{itm.companyName}</h4>
                        <span className="text-[11px] font-bold text-emerald-500 font-mono">{itm.count} Hires signed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW DIALOG OVERLAY */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Schedule Candidate Interview</h3>
            <span className="text-xs text-slate-450 block mb-4">Set dynamic meeting details for recruiter panel interaction</span>

            <form onSubmit={handleRecordSchedule} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Interview Loop Date</label>
                <input 
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-801 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Loop Start Time</label>
                <input 
                  type="text"
                  required
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-801 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Virtual Platform Link</label>
                <input 
                  type="text"
                  required
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-801 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button 
                  type="button" 
                  onClick={() => setSchedulingAppId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-xs px-3.5 py-2 rounded-xl text-slate-650"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                >
                  Confirm Loop Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
