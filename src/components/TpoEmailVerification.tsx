import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Send, LogOut, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { Theme } from "../types";
import { sendEmailVerification, User as FirebaseUser } from "firebase/auth";

interface TpoEmailVerificationProps {
  firebaseUser: FirebaseUser;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  onVerificationSuccess: () => void;
}

export default function TpoEmailVerification({
  firebaseUser,
  onLogout,
  theme,
  toggleTheme,
  onVerificationSuccess,
}: TpoEmailVerificationProps) {
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Read email from firebaseUser
  const email = firebaseUser.email || "";

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await sendEmailVerification(firebaseUser);
      setSuccessMsg("Verification link has been sent to your registered email address.");
      setCooldown(45); // 45 seconds cooldown
    } catch (err: any) {
      console.error("[Email Verification] Resend error:", err);
      setErrorMsg(
        err.message?.includes("too- many-requests")
          ? "Please wait a moment before requesting another link."
          : err.message || "Failed to resend verification email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Reload current Firebase User to fetch latest verification status
      await firebaseUser.reload();
      if (firebaseUser.emailVerified) {
        setSuccessMsg("Success! Your email has been verified. Accessing portal...");
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setErrorMsg("Email address is not verified yet. Please click the verification link in your inbox.");
      }
    } catch (err: any) {
      console.error("[Email Verification] Status reload failed:", err);
      setErrorMsg("Failed to check status. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const bgCardClass = isDark ? "bg-slate-900/60 backdrop-blur-xl" : "bg-white/90 backdrop-blur-xl shadow-xl";
  const borderClass = isDark ? "border-slate-800" : "border-slate-200";

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#0b0f19] text-white" : "bg-[#f8fafc] text-slate-800"
      } flex flex-col items-center justify-center p-4 relative overflow-hidden`}
      id="tpo-email-verification-gate"
    >
      {/* Background abstract gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-3xl" />

      <div
        className={`w-full max-w-xl rounded-3xl p-8 border ${borderClass} ${bgCardClass} text-center space-y-6 relative z-10`}
      >
        {/* Top ambient color-bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 rounded-t-3xl" />

        {/* Top title bar */}
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              Placement Cell Administrative Gate
            </span>
          </span>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg text-xs font-mono font-bold ${
              isDark ? "bg-slate-800/50 text-slate-300 hover:text-white" : "bg-slate-100 text-slate-600 hover:text-indigo-650"
            } transition`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Interactive icon stage */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 relative">
          <Mail className="w-8 h-8 text-indigo-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">
            !
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight font-display">Verify Your Email Address</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Mandatory email verification is enabled for all <strong>Training & Placement Officers (TPO)</strong> to ensure system security.
            We have sent a verification link to:
          </p>
          <div className="text-sm font-mono font-extrabold text-indigo-400 py-1 inline-block select-all bg-indigo-500/5 px-3 rounded-lg border border-indigo-500/10">
            {email}
          </div>
        </div>

        {/* Messaging Area */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 flex items-start gap-2.5 text-left animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 flex items-start gap-2.5 text-left animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Specifications panel */}
        <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-500/10 text-left space-y-3">
          <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Security Audit Requirements
          </h3>

          <div className="space-y-2 text-xs text-slate-400">
            <p>
              1. Open your college email inbox and select the confirmation link generated by academic systems.
            </p>
            <p>
              2. If you don't find it inside the inbox, please check the <strong>Junk / Spam folder</strong>.
            </p>
            <p>
              3. Once verified, return to this window and select the status checkpoint button below to open the admin panel.
            </p>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="space-y-3pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold font-mono text-xs transition cursor-pointer ${
                loading
                  ? "bg-slate-800 text-slate-600 border border-slate-700/50"
                  : "bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] text-white shadow-md shadow-indigo-500/20"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Verify Status Check</span>
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading || cooldown > 0}
              className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold font-mono text-xs border transition cursor-pointer ${
                loading || cooldown > 0
                  ? "bg-slate-800/10 border-slate-800 text-slate-500"
                  : "bg-transparent border-slate-500/20 hover:border-slate-500/40 hover:bg-slate-500/5 text-slate-300 hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{cooldown > 0 ? `Resend link (${cooldown}s)` : "Resend Verification Email"}</span>
            </button>
          </div>

          <div className="flex items-center justify-center pt-3 gap-3 border-t border-white/[0.04]">
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold font-mono text-slate-400 hover:text-white hover:bg-white/[0.02] duration-200"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
              <span>Sign Out Section</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
