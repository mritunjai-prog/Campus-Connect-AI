import React from "react";
import { 
  Sparkles, 
  User, 
  Briefcase, 
  CheckCircle, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  BrainCircuit,
  LayoutDashboard,
  Lock,
  Moon,
  Sun
} from "lucide-react";
import { motion } from "motion/react";
import { Theme } from "../../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  profile: any;
  unreadCount: number;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  apiBaseUrl?: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, lockType: 'verification' },
  { id: "resume", label: "Resume Center", icon: FileText },
  { id: "applications", label: "Applications", icon: CheckCircle, lockType: 'verification' },
  { id: "interview", label: "AI Mock Interview", icon: BrainCircuit, color: "text-indigo-400" },
  { id: "notifications", label: "Notifications", icon: Bell, badge: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile, unreadCount, onLogout, theme, toggleTheme, apiBaseUrl }) => {
  const isCompleted = profile.profileCompleteness >= 100;
  const isVerified = profile.verificationStatus === 'verified';

  const getPhotoUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `${apiBaseUrl || ""}${url}`;
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 shadow-2xl z-20 transition-colors duration-300">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-xl"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="tracking-tight line-clamp-1">CampusConnect</span>
          </motion.div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 overflow-hidden shrink-0">
              {profile.photoUrl ? (
                <img src={getPhotoUrl(profile.photoUrl)} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-slate-900 dark:text-white mb-0.5">{profile.name}</p>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-mono">STUDENT</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Profile Score</span>
              <span>{profile.profileCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${profile.profileCompleteness}%` }}
                className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar mt-4">
        {navItems.map((item) => {
          const isLocked = (item.lockType === 'completeness' && !isCompleted) || 
                           (item.lockType === 'verification' && !isVerified);
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 group relative border ${
                activeTab === item.id 
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl border-slate-900 dark:border-indigo-500" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              } ${isLocked ? "opacity-60" : ""}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : item.color || "text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                {item.badge && unreadCount > 0 && !isLocked && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 font-bold text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200 font-bold text-sm border border-transparent hover:border-rose-200 dark:hover:border-rose-800 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Logout Portal</span>
        </button>
      </div>
    </aside>
  );
};
