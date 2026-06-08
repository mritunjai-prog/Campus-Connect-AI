import React from "react";
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Loader2,
  Send,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { PlacementDrive, Application, Interview, StudentProfile } from "../../types";

interface DashboardProps {
  profile: StudentProfile;
  applications: Application[];
  interviews: Interview[];
  recommendations: { drive: PlacementDrive; matchScore: number; explanation: string }[];
  onApply: (driveId: string) => void;
  setActiveTab: (tab: any) => void;
  onSubmitVerification?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  profile, 
  applications, 
  interviews, 
  recommendations,
  onApply,
  setActiveTab,
  onSubmitVerification
}) => {
  const isVerified = profile.verificationStatus === 'verified';
  const isPending = profile.verificationStatus === 'pending';
  const isDraft = profile.verificationStatus === 'draft';
  const isCompleted = profile.profileCompleteness >= 100;

  const stats = [
    { 
      label: "Profile Progress", 
      value: `${profile.profileCompleteness}%`, 
      subValue: isCompleted ? "Complete Portfolio" : "Incomplete Data",
      icon: TrendingUp, 
      color: isCompleted ? "emerald" : "amber",
      onClick: () => setActiveTab("profile")
    },
    { 
      label: "Active Apps", 
      value: applications.length.toString(), 
      subValue: "Drives Registered",
      icon: ShieldCheck, 
      color: "indigo",
      onClick: () => setActiveTab("applications")
    },
    { 
      label: "Upcoming", 
      value: interviews.filter(i => i.status === "scheduled").length.toString(), 
      subValue: "Interviews",
      icon: Clock, 
      color: "blue",
      onClick: () => setActiveTab("dashboard")
    },
    { 
      label: "Resume Status", 
      value: profile.resumeUrl ? "Active" : "Missing", 
      subValue: profile.resumeFileName || "Upload Required",
      icon: FileText, 
      color: profile.resumeUrl ? "emerald" : "rose",
      onClick: () => setActiveTab("resume")
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {profile.name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your career management hub is up to date.</p>
        </div>
      </header>

      {/* Verification & Completeness Notifications */}
      {profile.verificationStatus === 'rejected' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-rose-50/50 dark:bg-rose-950/15 border-2 border-rose-200 dark:border-rose-900/40 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-455 shrink-0">
            <Zap className="w-5 h-5 text-rose-600" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-rose-800 dark:text-rose-400 tracking-tight leading-none text-base">Verification Request Returned</h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-rose-300 leading-relaxed">
              Your profile verification has been rejected by the TPO. 
              <span className="block mt-1 p-2 bg-rose-100/30 rounded-lg font-mono text-[11px] text-rose-700 dark:text-rose-300">
                Remarks: "{profile.feedback || "Please audit all skills, CGPA levels, tenth & twelfth boards, and verify your document uploads are complete."}"
              </span>
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab("profile")} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Revise & Resubmit Profile
              </button>
            </div>
          </div>
        </motion.div>
      ) : profile.verificationStatus === 'verified' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-emerald-50/50 dark:bg-emerald-950/15 border-2 border-emerald-150 dark:border-emerald-900/40 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight leading-none text-base">Profile Successfully Verified</h3>
            <p className="text-xs font-semibold text-slate-605 dark:text-emerald-300 leading-relaxed">
              Congratulations! Your profile is verified as valid. You have been cleared by the TPO to apply to any active placement drives, jobs, or internships listed.
            </p>
          </div>
        </motion.div>
      ) : !isCompleted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-indigo-50/50 dark:bg-indigo-950/15 border-2 border-indigo-150 dark:border-indigo-900/40 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none text-base">Complete Your Profile Portfolio</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              Your profile is currently at <strong className="text-indigo-600 dark:text-indigo-400">{profile.profileCompleteness}% completeness</strong>. You must fill all required details (such as Enrollment ID, graduation details, and active skills) to request verification.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab("profile")} 
                className="px-4 py-2 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Complete Profile Now
              </button>
            </div>
          </div>
        </motion.div>
      ) : isPending ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-amber-50/50 dark:bg-amber-950/15 border-2 border-amber-150 dark:border-amber-900/40 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-amber-800 dark:text-amber-400 tracking-tight leading-none text-base">Verification Request Submitted</h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-amber-300 leading-relaxed">
              Your 100% complete profile is currently under review by the Training & Placement Office. Restrictive modules will unlock once approval is finalized by the officers.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-50 dark:bg-slate-900/10 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Send className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none text-base">Request TPO Verification Clearance</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              Your profile is 100% completed and complies with all mandatory fields! Submit it to the TPO now to gain direct path permissions to drive registrations.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab("profile")} 
                className="px-4 py-2 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Go to Profile to Verify Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.button
            whileHover={{ y: -4 }}
            key={idx}
            onClick={stat.onClick}
            className="group flex flex-col items-start p-6 premium-card-light text-left overflow-hidden relative"
          >
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30`}>
              <stat.icon className={`w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400`} />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{stat.value}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-1">{stat.subValue}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matchmaker View */}
        <div className="lg:col-span-2 premium-card-light p-8 md:p-10 relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Career Matchmaker & Insights</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Personalized placement drives and AI resume trends</p>
              </div>
            </div>
          </div>

          {/* Recharts Resume Trend */}
          <div className="h-48 mb-8 w-full" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
              <AreaChart data={[
                { month: 'Jan', score: 40 }, { month: 'Feb', score: 55 }, { month: 'Mar', score: 50 },
                { month: 'Apr', score: 75 }, { month: 'May', score: profile.profileCompleteness || 80 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {!isVerified ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Module Locked</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">Get campus verified by the Training & Placement Office to see your AI-ranked career matches.</p>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-6">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="group bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-700 p-6 border border-slate-100 dark:border-slate-700 rounded-3xl transition-all flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center font-black text-slate-900 dark:text-white shadow-sm">
                        {rec.drive.companyName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white leading-tight">{rec.drive.jobRole}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{rec.drive.companyName}</p>
                      </div>
                      <div className="flex items-center px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-500 mr-1" />
                        <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase">{rec.matchScore}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-white/20">
                      &quot;{rec.explanation}&quot;
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{rec.drive.type}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{rec.drive.packageLPA} LPA</p>
                    </div>
                    <button 
                      onClick={() => onApply(rec.drive.id)}
                      className="bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      Apply Drive
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl">
              Analyzing current drive eligibility...
            </div>
          )}
        </div>

        {/* Timeline Sidebar */}
        <div className="premium-card-light p-8 md:p-10 flex flex-col relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-amber-400" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight uppercase">Timeline</h3>
          </div>

          <div className="flex-1 space-y-4">
            {interviews.filter(i => i.status === "scheduled").length > 0 ? (
              interviews.filter(i => i.status === "scheduled").map((int, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/10 p-6 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Interview Slot</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{int.jobRole}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 h-4 truncate">{int.companyName}</p>
                  </div>
                  <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-amber-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{int.interviewDate}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-1 leading-none">{int.interviewTime}</span>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 active:scale-95">
                    Prepare with AI
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-4 opacity-50">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No active sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
