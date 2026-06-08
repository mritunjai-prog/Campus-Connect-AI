import React from "react";
import { XCircle, LogOut, ShieldAlert, Building, Mail } from "lucide-react";
import { Theme } from "../types";

interface AccountRejectedPageProps {
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function AccountRejectedPage({ onLogout, theme, toggleTheme }: AccountRejectedPageProps) {
  const isDark = theme === "dark";
  const cachedUser = JSON.parse(localStorage.getItem("campus_connect_user") || "{}");

  const borderClass = isDark ? "border-slate-800" : "border-slate-200";
  const bgCardClass = isDark ? "bg-slate-900/60 backdrop-blur-xl animate-fade-in" : "bg-white/80 backdrop-blur-xl shadow-xl animate-fade-in";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0b0f19] text-white" : "bg-[#f8fafc] text-slate-800"} flex flex-col items-center justify-center p-4`} id="account-rejected-page">
      <div className={`w-full max-w-xl rounded-3xl p-8 border ${borderClass} ${bgCardClass} text-center space-y-6 relative overflow-hidden`}>
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-600" />
        
        {/* Animated rejected icon container */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-550 shadow-lg shadow-rose-500/5">
          <XCircle className="w-8 h-8 text-rose-500" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 font-mono">Registration Status: Denied</span>
          <h2 className="text-2xl font-black tracking-tight font-display text-rose-500">Recruiter Approval Declined</h2>
          <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
            Your recruiter registration request has been audited and <strong>declined</strong> by the Training & Placement Officer (TPO).
          </p>
        </div>

        {/* Verification Status List */}
        <div className="bg-slate-500/5 rounded-2xl p-5 border border-slate-500/10 text-left space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider font-mono text-rose-400">Audit Status Report</h3>
          
          <div className="space-y-2.5 text-xs text-slate-450">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> Corporate Entity</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">{cachedUser.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> Login Email Address</span>
              <span className="font-mono text-[11px] font-extrabold text-slate-700 dark:text-slate-250 select-all">{cachedUser.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Decisive Outcome</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20">Registration Rejected</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed font-mono">
          ⚠️ If you believe this is a clerical error or need validation assistance, please contact the institution placement coordinator directly.
        </div>

        <div className="flex items-center justify-center pt-3 gap-3">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white duration-300 rounded-xl text-xs font-bold font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
