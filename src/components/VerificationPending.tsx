import React from "react";
import { Clock, LogOut, CheckCircle, ShieldAlert, Building, Globe, Mail, Phone, User } from "lucide-react";
import { Theme } from "../types";

interface VerificationPendingPageProps {
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  user?: any;
}

export default function VerificationPendingPage({ onLogout, theme, toggleTheme, user }: VerificationPendingPageProps) {
  const isDark = theme === "dark";
  const cachedUser = user || JSON.parse(localStorage.getItem("campus_connect_user") || "{}");
  const status = cachedUser?.status || "";

  const borderClass = isDark ? "border-slate-800" : "border-slate-200";
  const bgCardClass = isDark ? "bg-slate-900/60 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl shadow-xl";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0b0f19] text-white" : "bg-[#f8fafc] text-slate-800"} flex flex-col items-center justify-center p-4`} id="verification-pending-page">
      <div className={`w-full max-w-xl rounded-3xl p-8 border ${borderClass} ${bgCardClass} text-center space-y-6 relative overflow-hidden animate-fade-in`}>
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
        
        {/* Animated clock/pending icon container */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-550 shadow-lg shadow-amber-500/5 animate-pulse">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
            {status === "request_more_info" ? "Registration Stage: Action Needed" : "Registration Stage: Audit"}
          </span>
          <h2 className="text-2xl font-black tracking-tight font-display">
            {status === "request_more_info" ? "Additional Information Requested" : "Recruiter Review Pending"}
          </h2>
          {status === "request_more_info" ? (
            <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
              The Training & Placement Office (TPO) requires additional details to verify your recruiter profile. Please touch base directly with the campus placement office or watch for updates.
            </p>
          ) : (
            <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
              Your recruiter account has been registered successfully but requires manual clearance by the 
              <strong> Training & Placement Officer (TPO)</strong> before you can access the recruitment desk features.
            </p>
          )}
        </div>

        {/* Verification Status List */}
        <div className="bg-slate-500/5 rounded-2xl p-5 border border-slate-500/10 text-left space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider font-mono">Audit Specifications</h3>
          
          <div className="space-y-2.5 text-xs text-slate-450">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> Company / Corporate Representative</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">{cachedUser.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> Login Email Address</span>
              <span className="font-mono text-[11px] font-extrabold text-slate-700 dark:text-slate-250 select-all">{cachedUser.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-400" /> Corporate Domain</span>
              <span className="font-bold text-blue-500">{cachedUser.email?.split("@")[1] || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Current Clearance Status</span>
              {status === "request_more_info" ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20">Action Required</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/20">Awaiting clearance</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed font-mono">
          💬 Once verified, you will be able to manage job drives, shortlist students, and run interviews. You will be notified in-app.
        </div>

        <div className="flex items-center justify-center pt-3 gap-3">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-500/10 hover:border-slate-500/20 hover:bg-slate-500/5 duration-300 rounded-xl text-xs font-bold font-mono text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
