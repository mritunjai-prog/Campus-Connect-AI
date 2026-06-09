import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Video,
  User,
  ExternalLink,
  Filter,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Zap
} from "lucide-react";
import { Interview } from "../../types";

interface InterviewSchedulerProps {
  interviews: Interview[];
  token: string;
  apiBaseUrl: string;
  onRefresh: () => void;
}

export default function InterviewScheduler({
  interviews,
  token,
  apiBaseUrl,
  onRefresh
}: InterviewSchedulerProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [hrNotesMap, setHrNotesMap] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState("");
  
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState<any>(null);

  const handleNotesChange = (intId: string, value: string) => {
    setHrNotesMap(prev => ({ ...prev, [intId]: value }));
  };

  const handleUpdateInterview = async (intId: string, status: "completed" | "cancelled") => {
    setLoadingId(intId);
    const feedback = hrNotesMap[intId] || `Interview status verified: ${status}.`;

    try {
      const res = await fetch(`${apiBaseUrl}/api/interviews/${intId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update interview calendar");

      onRefresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingId("");
    }
  };

  const filteredInts = interviews.filter(i => {
    return filterStatus === "all" || i.status === filterStatus;
  });

  return (
    <div className="space-y-6" id="comp-interviews-subtab">
      
      {/* Upper header action status deck */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Your Placement Interviews Calendar
            <button onClick={() => setIsOptimizerOpen(true)} className="ml-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold transition flex items-center shadow-sm border border-indigo-200">
              <Zap className="w-3.5 h-3.5 mr-1" /> AI Optimizer
            </button>
          </h2>
          <p className="text-xs text-slate-500">Coordinate scheduled virtual calls and physical evaluation drives</p>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Schedules ({interviews.length})</option>
            <option value="scheduled">Scheduled ({interviews.filter(i=>i.status==="scheduled").length})</option>
            <option value="completed">Completed ({interviews.filter(i=>i.status==="completed").length})</option>
            <option value="cancelled">Cancelled ({interviews.filter(i=>i.status==="cancelled").length})</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {filteredInts.length === 0 ? (
        <div className="py-24 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/20 relative z-10 shadow-inner">
            <Calendar className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">Your Calendar is Clear</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed relative z-10">
            No interview timelines found matching your selection. Shortlist candidates from the pipeline to populate physical or virtual evaluation slots here.
          </p>

          <button 
            onClick={() => setIsOptimizerOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 cursor-pointer relative z-10"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Launch AI Auto-Scheduler</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="recruiter-interviews-riddle">
          {filteredInts.map(int => {
            const isScheduled = int.status === "scheduled";
            const isCompleted = int.status === "completed";
            const isCancelled = int.status === "cancelled";

            return (
              <div 
                key={int.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Slot top deck */}
                  <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block">MEETING ID: {int.id}</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{int.studentName}</h4>
                      <p className="text-[10px] text-emerald-600 font-mono uppercase font-bold tracking-wider">{int.jobRole} Interview</p>
                    </div>
                    
                    <span className={`text-[10px] font-mono leading-none tracking-wider font-bold uppercase border px-2 py-0.5 rounded ${isScheduled ? "bg-amber-50 border-amber-250 text-amber-800" : (isCompleted ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-slate-100 text-slate-500")}`}>
                      {int.status}
                    </span>
                  </div>

                  {/* Datetime detail card */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-650">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                      <span><b>Date:</b> {int.interviewDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                      <span><b>Time:</b> {int.interviewTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-200 dark:border-slate-800/50">
                      <Video className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="truncate flex-1">
                        <b>Venue/Link:</b>{" "}
                        {int.linkOrVenue.startsWith("http") ? (
                          <a 
                            href={int.linkOrVenue} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-mono font-medium text-[11px]"
                          >
                            <span>Join Conference</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500 shrink-0" />
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{int.linkOrVenue}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feedback feedback block if completed */}
                  {int.feedback && (
                    <div className="p-2.5 bg-blue-50/20 border border-blue-100/50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                      💬 <b>Evaluation Feedback Notes:</b> {int.feedback}
                    </div>
                  )}

                </div>

                {/* Operations action row if scheduled position */}
                {isScheduled && (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Add candidate evaluation score/feedback..."
                        value={hrNotesMap[int.id] || ""}
                        onChange={(e) => handleNotesChange(int.id, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs w-full outline-none focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex space-x-1 justify-end pt-1">
                      <button
                        onClick={() => handleUpdateInterview(int.id, "cancelled")}
                        disabled={loadingId === int.id}
                        className="bg-slate-50 dark:bg-slate-900/50 border text-slate-650 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Cancel Slot
                      </button>
                      <button
                        onClick={() => handleUpdateInterview(int.id, "completed")}
                        disabled={loadingId === int.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-sm shadow-emerald-500/10 cursor-pointer transition"
                      >
                        Complete Slot
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
    </div>
      )}

      {/* AI Optimizer Modal */}
      {isOptimizerOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-lg w-full">
            <h3 className="text-lg font-black flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Smart Slot Optimization
            </h3>
            <p className="text-sm text-slate-500 mb-6">AI will organize your unscheduled candidates into an optimal timeframe.</p>

            {optimizing ? (
              <div className="py-8 flex flex-col items-center">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="font-bold text-indigo-600 animate-pulse">Calculating optimal schedules...</p>
              </div>
            ) : optimizedSchedule ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs font-bold border border-emerald-200">
                  {optimizedSchedule.summary}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {optimizedSchedule.itinerary?.map((slot: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                      <span className="font-bold text-slate-800">{slot.studentName}</span>
                      <span className="bg-white dark:bg-slate-900 border px-2 py-1 rounded text-slate-500">{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <button onClick={() => { setIsOptimizerOpen(false); setOptimizedSchedule(null); }} className="px-4 py-2 bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold">Discard</button>
                  <button onClick={() => { setIsOptimizerOpen(false); setOptimizedSchedule(null); alert("Feature: Batch save schedule not fully wired up yet."); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Apply Schedule</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <p>Would you like Gemini AI to auto-schedule pending interviews?</p>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button onClick={() => setIsOptimizerOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold">Cancel</button>
                  <button onClick={async () => {
                    setOptimizing(true);
                    try {
                      // We only want 'scheduled' without time or anything pending. We'll pass some mock applicants.
                      const res = await fetch(`${apiBaseUrl}/api/ai/optimize-slots`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({
                          driveId: "test-drive",
                          date: new Date().toISOString().split("T")[0],
                          durationMinutes: 30,
                          applicants: [{ id: "s1", name: "Alice M" }, { id: "s2", name: "Bob J" }, { id: "s3", name: "Charlie T" }]
                        })
                      });
                      if(res.ok) setOptimizedSchedule(await res.json());
                    } finally {
                      setOptimizing(false);
                    }
                  }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow shadow-indigo-200">
                    Run Optimizer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
