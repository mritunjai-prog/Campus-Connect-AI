import React from "react";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { Theme } from "../types";

interface AccessDeniedPageProps {
  onLogout: () => void;
  onGoBack?: () => void;
  theme: Theme;
}

export default function AccessDeniedPage({ onLogout, onGoBack, theme }: AccessDeniedPageProps) {
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0b0f19] text-white" : "bg-[#f8fafc] text-slate-800"} flex flex-col items-center justify-center p-4`} id="access-denied-page">
      <div className={`w-full max-w-md rounded-3xl p-8 border ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white shadow-xl"} text-center space-y-6 relative overflow-hidden animate-fade-in`}>
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-600" />
        
        {/* Animated icon container */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 font-mono">Security Barrier</span>
          <h2 className="text-xl font-black tracking-tight font-display">Access Denied</h2>
          <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
            Your authenticated role is unauthorized to view this segment of CampusConnect. Every entry attempt is logged.
          </p>
        </div>

        <div className="flex items-center justify-center pt-3 gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 px-5 py-2 border border-slate-500/10 hover:border-slate-500/20 hover:bg-slate-500/5 duration-300 rounded-xl text-xs font-bold font-mono text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white duration-300 rounded-xl text-xs font-bold font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
