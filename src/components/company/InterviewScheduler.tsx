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
  Sparkles
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Your Placement Interviews Calendar</h2>
          <p className="text-xs text-slate-500">Coordinate scheduled virtual calls and physical evaluation drives</p>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold outline-none cursor-pointer"
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
        <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
          No booked interview timelines found matching selection.
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
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Slot top deck */}
                  <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-mono block">MEETING ID: {int.id}</span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{int.studentName}</h4>
                      <p className="text-[10px] text-emerald-600 font-mono uppercase font-bold tracking-wider">{int.jobRole} Interview</p>
                    </div>
                    
                    <span className={`text-[10px] font-mono leading-none tracking-wider font-bold uppercase border px-2 py-0.5 rounded ${isScheduled ? "bg-amber-50 border-amber-250 text-amber-800" : (isCompleted ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-slate-100 text-slate-500")}`}>
                      {int.status}
                    </span>
                  </div>

                  {/* Datetime detail card */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-650">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><b>Date:</b> {int.interviewDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><b>Time:</b> {int.interviewTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/50">
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
                          <span className="font-semibold text-slate-700">{int.linkOrVenue}</span>
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
                        className="bg-slate-50 border border-slate-200 rounded p-2 text-xs w-full outline-none focus:bg-white"
                      />
                    </div>
                    <div className="flex space-x-1 justify-end pt-1">
                      <button
                        onClick={() => handleUpdateInterview(int.id, "cancelled")}
                        disabled={loadingId === int.id}
                        className="bg-slate-50 border text-slate-650 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
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

    </div>
  );
}
