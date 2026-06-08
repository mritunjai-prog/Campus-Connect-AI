import React from "react";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Building2, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  MousePointer2
} from "lucide-react";
import { motion } from "motion/react";
import { Application } from "../../types";

interface ApplicationsProps {
  applications: Application[];
  onTrack: (appId: string) => void;
}

export const Applications: React.FC<ApplicationsProps> = ({ applications, onTrack }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied": return { label: "Applied", color: "blue", icon: Clock };
      case "shortlisted": return { label: "Shortlisted", color: "indigo", icon: CheckCircle };
      case "interview_scheduled": return { label: "Interviewing", color: "amber", icon: MousePointer2 };
      case "selected": return { label: "Selected", color: "emerald", icon: CheckCircle };
      case "rejected": return { label: "Rejected", color: "rose", icon: XCircle };
      default: return { label: "Pending", color: "slate", icon: Clock };
    }
  };

  const steps = ["applied", "shortlisted", "interview_scheduled", "selected"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Application Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your recruitment status across institutional and open job drives.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Filter company..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold rounded-xl outline-none text-slate-900 dark:text-white" />
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <Filter className="w-4 h-4 text-slate-400" />
            </button>
        </div>
      </header>

      <div className="space-y-6">
        {applications.length > 0 ? (
          applications.map((app, idx) => {
            const config = getStatusConfig(app.status);
            const currentStepIndex = steps.indexOf(app.status === "rejected" ? "applied" : app.status);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={app.id} 
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] flex flex-col gap-8 cursor-default hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex items-center space-x-6 min-w-[280px]">
                     <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center font-black text-slate-800 dark:text-slate-200 text-2xl shadow-inner group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/20 transition-colors shrink-0">
                        {app.companyName.charAt(0)}
                     </div>
                     <div className="space-y-1 min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight truncate">{app.jobRole}</h3>
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
                           <span className="flex items-center shrink-0"><Building2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> {app.companyName}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 w-full max-w-2xl px-0 lg:px-8">
                    <div className="relative flex justify-between items-center w-full">
                       {/* Background Track */}
                       <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                       
                       {/* Steps */}
                       {steps.map((step, sIdx) => {
                         const isActive = sIdx <= currentStepIndex;
                         const isRejected = app.status === "rejected";
                         const label = step.charAt(0).toUpperCase() + step.slice(1).replace('_', ' ');
                         
                         return (
                           <div key={step} className="relative z-10 flex flex-col items-center">
                             <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all duration-500 scale-100 ${isActive ? (isRejected ? "bg-rose-500 border-rose-100 dark:border-rose-900/30" : "bg-indigo-600 border-indigo-100 dark:border-indigo-900/30 shadow-lg shadow-indigo-600/20 dark:shadow-none") : "bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-inner"}`}>
                                {isActive && <CheckCircle className="w-3 h-3 text-white" />}
                             </div>
                             <span className={`absolute top-10 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${isActive ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600"}`}>
                                {label}
                             </span>
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 min-w-[200px] justify-end">
                     <div className="text-right">
                        <div className={`px-4 py-2 rounded-2xl border flex items-center space-x-2 bg-${config.color}-50 border-${config.color}-100 font-black text-[10px] uppercase tracking-widest text-${config.color}-700 shadow-sm`}>
                            <config.icon className="w-3 h-3" />
                            <span>{app.status === "rejected" ? "Technical Reject" : config.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest whitespace-nowrap">Updated {new Date(app.appliedAt).toLocaleDateString()}</p>
                     </div>
                     <button 
                        onClick={() => onTrack(app.id)}
                        className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-indigo-600 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-white border border-slate-100 dark:border-slate-700 rounded-3xl transition-all shadow-sm flex items-center justify-center group-hover:scale-110 active:scale-95"
                     >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                {app.status === "rejected" && (
                    <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-start space-x-3">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-800 dark:text-rose-200 font-bold leading-relaxed tracking-tight">The recruitment assessment indicates a mismatch in technical score threshold. Profile remain open for alternative campus drives.</p>
                    </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
                <CheckCircle className="w-10 h-10 text-slate-200" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900">No active applications</h3>
                <p className="text-slate-500 mt-2 max-w-sm font-medium">Head over to the placement drives section to kickstart your corporate journey.</p>
             </div>
             <button className="bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all">Explore Opportunities</button>
          </div>
        )}
      </div>
    </div>
  );
};
