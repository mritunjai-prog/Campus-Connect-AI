import React from "react";
import { 
  Sparkles, 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  CheckCircle, 
  Plus, 
  BarChart4, 
  FileText, 
  Bell, 
  Calendar, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { Theme } from "../../types";

export type TpoSubTab = 
  | "overview"
  | "students"
  | "student_verification"
  | "recruiters"
  | "jobs_approvals"
  | "applications_tracker"
  | "placement_analytics"
  | "notifications_center"
  | "drive_management"
  | "reports_exports"
  | "settings";

interface TpoSidebarProps {
  activeTab: TpoSubTab;
  setActiveTab: (tab: TpoSubTab) => void;
  user: any;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  companies?: any[];
}

export default function TpoSidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  theme, 
  toggleTheme,
  companies = []
}: TpoSidebarProps) {

  const menuGroups = [
    {
      title: "Core Operations",
      items: [
        { id: "overview" as TpoSubTab, label: "Dashboard Overview", icon: BarChart4 },
        { id: "students" as TpoSubTab, label: "Student Registry", icon: Users },
      ]
    },
    {
      title: "Verification Gates",
      items: [
        { id: "student_verification" as TpoSubTab, label: "Student Verification", icon: ShieldAlert },
        { id: "recruiters" as TpoSubTab, label: "Recruiter Accounts", icon: Building2 },
        { id: "jobs_approvals" as TpoSubTab, label: "Job Approvals", icon: Briefcase },
      ]
    },
    {
      title: "Placement Tracking",
      items: [
        { id: "applications_tracker" as TpoSubTab, label: "Applications Tracker", icon: Layers },
        { id: "placement_analytics" as TpoSubTab, label: "Placement Analytics", icon: TrendingUp },
      ]
    },
    {
      title: "Communications",
      items: [
        { id: "notifications_center" as TpoSubTab, label: "Notifications Center", icon: Bell },
        { id: "drive_management" as TpoSubTab, label: "Drive Management", icon: Calendar },
      ]
    },
    {
      title: "System Records",
      items: [
        { id: "reports_exports" as TpoSubTab, label: "Reports & Exports", icon: FileSpreadsheet },
        { id: "settings" as TpoSubTab, label: "Settings", icon: SettingsIcon },
      ]
    }
  ];

  return (
    <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-2xl z-20 h-full md:sticky md:top-0 md:h-screen" id="tpo-sidebar-navigation">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 text-white font-bold text-xl mb-4">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="tracking-tighter">PlacementCell</span>
        </div>

        {/* User Badge */}
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-505 bg-indigo-900 border border-indigo-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || "PO"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate mb-0.5">{user?.name || "Placement Officer"}</p>
              <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-900/60 inline-block block w-fit">
                CAMPUS DIRECTOR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group Items */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-3 mb-1 text-slate-500">
              {group.title}
            </h4>
            {group.items.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 flex items-center justify-between border ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md border-indigo-550" 
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white border-transparent"
                  }`}
                  id={`sidebar-tab-${item.id}`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.id === "recruiters" && companies && companies.filter(c => c.status === "pending_verification" || (!c.isVerified && !c.isApproved)).length > 0 && (
                    <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                      {companies.filter(c => c.status === "pending_verification" || (!c.isVerified && !c.isApproved)).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2 mt-auto bg-slate-900/80">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors duration-200 font-semibold text-xs border border-transparent hover:border-slate-700"
          id="theme-toggle-sidebar"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-slate-400 font-semibold text-xs hover:bg-rose-950/30 hover:text-rose-450 transition-colors duration-200 border border-transparent hover:border-rose-900/40 group"
          id="logout-button-sidebar"
        >
          <LogOut className="w-4 h-4 text-rose-500 transition-transform group-hover:-translate-x-0.5" />
          <span>Exit Officer Desk</span>
        </button>
      </div>
    </aside>
  );
}
