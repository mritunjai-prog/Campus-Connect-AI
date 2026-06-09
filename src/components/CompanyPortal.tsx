import React, { useState, useEffect, lazy, Suspense } from "react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Lock,
  Plus,
  Sun,
  Moon
} from "lucide-react";
import { CompanyProfile, PlacementDrive, Application, Interview, Notification, Theme } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";

// Sub-components Imports
const CompanyDashboard = lazy(() => import("./company/CompanyDashboard"));
const JobManagement = lazy(() => import("./company/JobManagement"));
const ApplicantTracking = lazy(() => import("./company/ApplicantTracking"));
const InterviewScheduler = lazy(() => import("./company/InterviewScheduler"));
const CompanyAnalytics = lazy(() => import("./company/CompanyAnalytics"));
const AccountSecuritySettings = lazy(() => import("./shared/AccountSecuritySettings"));

interface CompanyPortalProps {
  token: string;
  user: any;
  initialProfile: CompanyProfile;
  apiBaseUrl: string;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function CompanyPortal({ token, user, initialProfile, apiBaseUrl, onLogout, theme, toggleTheme }: CompanyPortalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegment = location.pathname.split('/')[2] || 'dashboard';
  const activeSubTab = pathSegment as "dashboard" | "drives" | "applicants" | "interviews" | "analytics" | "settings";
  const setActiveSubTab = (tab: string) => navigate(`/company/${tab}`, { replace: true });
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App state UI
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Quick state mapping for Interview Scheduler modal popup
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  
  // Specific Scheduler variables
  const [interviewDate, setInterviewDate] = useState("2026-06-15");
  const [interviewTime, setInterviewTime] = useState("10:00");
  const [interviewType, setInterviewType] = useState<'virtual' | 'in_person'>('virtual');
  const [linkOrVenue, setLinkOrVenue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, [location.pathname]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setGlobalError("");

      // 1. Refresh recruiter profile
      const pRes = await fetch(`${apiBaseUrl}/api/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (pRes.ok && pData.profile) {
        setProfile(pData.profile);
      }

      // 2. Fetch drives posted by recruiter
      const dRes = await fetch(`${apiBaseUrl}/api/drives`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dData = await dRes.json();
      if (dRes.ok) {
        const recruiterDrives = (dData.drives || []).filter((d: PlacementDrive) => d.companyId === user.id);
        setDrives(recruiterDrives);
      }

      // 3. Fetch applications for recruiter drives
      const aRes = await fetch(`${apiBaseUrl}/api/applications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const aData = await aRes.json();
      if (aRes.ok) {
        const recruiterApps = (aData.applications || []).filter((a: Application) => a.companyId === user.id);
        setApplications(recruiterApps);
      }

      // 4. Fetch interviews scheduled by recruiter
      const iRes = await fetch(`${apiBaseUrl}/api/interviews`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const iData = await iRes.json();
      if (iRes.ok) {
        const recruiterInts = (iData.interviews || []).filter((i: Interview) => i.companyId === user.id);
        setInterviews(recruiterInts);
      }

      // 5. Fetch in-app notifications
      const nRes = await fetch(`${apiBaseUrl}/api/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const nData = await nRes.json();
      if (nRes.ok) {
        setNotifications((nData.notifications || []).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)));
      }

    } catch (err: any) {
      setGlobalError("Failed to synchronize recruiter database indexes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark recruiter in-app notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/notifications/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.warn("Clear active alerts warning:", err);
    }
  };

  // Triggered when scheduler callbacks are received from candidates lists
  const handleOpenScheduleModal = (appId: string, studentName: string) => {
    setSelectedAppId(appId);
    setSelectedStudentName(studentName);
    
    // Default schedules
    const today = new Date();
    const future = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days out
    setInterviewDate(future.toISOString().split("T")[0]);
    setInterviewTime("11:00");
    setInterviewType("virtual");
    setLinkOrVenue("https://meet.google.com/xyz-abc-123");
    
    setShowScheduleModal(true);
  };

  const handlePostInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    setModalLoading(true);
    setGlobalError("");
    setGlobalSuccess("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: selectedAppId,
          interviewDate,
          interviewTime,
          type: interviewType,
          linkOrVenue: linkOrVenue || (interviewType === "virtual" ? "https://meet.google.com/xyz-abc-123" : "Corp HQ Block C Room 102")
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize schedule");

      setGlobalSuccess(`Technical interview scheduled and student auto-notified successfully for ${selectedStudentName}!`);
      setShowScheduleModal(false);
      fetchCompanyData();
      setTimeout(() => setGlobalSuccess(""), 4000);
    } catch (err: any) {
      setGlobalError(err.message || "An exception occurred during interview scheduling.");
    } finally {
      setModalLoading(false);
    }
  };

  const unreadAlertsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} id="recruiter-portal-frame">
      
      {/* 1. SIDEBAR Navigation Layout */}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-950 text-slate-600 dark:text-white shrink-0 border-r border-slate-200 dark:border-slate-900 shadow-2xl relative z-20">
        <div className="p-8 border-b border-slate-200 dark:border-slate-900">
          <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-xl mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="tracking-tighter">RecruiterDesk</span>
          </div>

          <div className="px-6 py-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 overflow-hidden shrink-0">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate text-slate-900 dark:text-white mb-0.5">{user?.name || "Recruiter"}</p>
                  <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-md inline-block">ADMIN</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4" id="desktop-sidebar-menu">
          {[
            { id: "dashboard", label: "Executive HUD", icon: Briefcase },
            { id: "drives", label: "Placement Drives", icon: Plus },
            { id: "applicants", label: "Candidate Pipeline", icon: Users },
            { id: "interviews", label: "Interviews Booked", icon: Calendar },
            { id: "analytics", label: "Hiring Analytics", icon: TrendingUp },
            { id: "settings", label: "Account & Security", icon: Lock }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`group w-full text-left p-3.5 rounded-xl text-xs font-bold leading-relaxed flex items-center justify-between transition cursor-pointer border ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 border-emerald-500" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border-transparent hover:border-slate-200 dark:hover:border-slate-800"}`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.id === "applicants" && applications.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${isActive ? "bg-emerald-700/50 text-white" : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>
                    {applications.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom block */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-900 space-y-2 mt-auto">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 font-bold text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-emerald-500" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-full bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 rounded-xl py-3 px-3 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer leading-none group"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer header navigation block */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="w-64 max-w-[80vw] h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1">
                <div className="p-6 border-b border-slate-200 dark:border-slate-900 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Recruiter Desk</span>
                  </div>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="p-4 space-y-1" id="mobile-sidebar-menu">
                  {[
                    { id: "dashboard", label: "Executive HUD", icon: Briefcase },
                    { id: "drives", label: "Placement Drives", icon: Plus },
                    { id: "applicants", label: "Candidate Pipeline", icon: Users },
                    { id: "interviews", label: "Interviews Booked", icon: Calendar },
                    { id: "analytics", label: "Hiring Analytics", icon: TrendingUp },
                    { id: "settings", label: "Account & Security", icon: Lock }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveSubTab(tab.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold flex items-center space-x-3 cursor-pointer ${activeSubTab === tab.id ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-900">
                <button 
                  onClick={onLogout}
                  className="w-full bg-slate-900 text-slate-350 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main content view block */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header bar */}
        <header className="h-16 border-b bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-10 transition-colors" id="main-topbar">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block font-mono">Workspace Gateway</span>
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight block">Recruiter Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors shadow-sm"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {unreadAlertsCount > 0 && (
              <div 
                onClick={() => setActiveSubTab("dashboard")}
                className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-800 dark:text-emerald-400 transition cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                <span>{unreadAlertsCount} Alert Update{unreadAlertsCount > 1 ? "s" : ""}</span>
              </div>
            )}
            
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">{profile.name}</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5 leading-none">{user.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center border dark:border-emerald-400/30 uppercase shadow-inner">
                {profile.name ? profile.name.substring(0, 2) : "C"}
              </div>
            </div>
          </div>
        </header>

        {/* Global Success / Danger alerts bar wrapper */}
        <AnimatePresence>
          {globalError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold p-4 flex items-center space-x-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{globalError}</span>
            </motion.div>
          )}

          {globalSuccess && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold p-4 flex items-center space-x-2.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <span>{globalSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Lattice Frame */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" id="dashboard-tabsets-area">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 py-16">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">Syncing database changes...</span>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div></div>}>
                {activeSubTab === "dashboard" && (
                  <CompanyDashboard 
                    profile={profile}
                    drives={drives}
                    applications={applications}
                    interviews={interviews}
                    notifications={notifications}
                    token={token}
                    apiBaseUrl={apiBaseUrl}
                    onRefresh={fetchCompanyData}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                  />
                )}

                {activeSubTab === "drives" && (
                  <JobManagement 
                    drives={drives}
                    token={token}
                    apiBaseUrl={apiBaseUrl}
                    onRefresh={fetchCompanyData}
                  />
                )}

                {activeSubTab === "applicants" && (
                  <ApplicantTracking 
                    drives={drives}
                    applications={applications}
                    token={token}
                    apiBaseUrl={apiBaseUrl}
                    onRefresh={fetchCompanyData}
                    onScheduleInterview={handleOpenScheduleModal}
                  />
                )}

                {activeSubTab === "interviews" && (
                  <InterviewScheduler 
                    interviews={interviews}
                    token={token}
                    apiBaseUrl={apiBaseUrl}
                    onRefresh={fetchCompanyData}
                  />
                )}

                {activeSubTab === "analytics" && (
                  <CompanyAnalytics 
                    drives={drives}
                    applications={applications}
                  />
                )}

                {activeSubTab === "settings" && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 md:p-10 shadow-sm transition-colors text-left max-w-4xl mx-auto">
                    <AccountSecuritySettings theme={theme} userRole="company" userEmail={user?.email} />
                  </div>
                )}
              </Suspense>
            </motion.div>
          )}
        </div>
      </div>

      {/* CO-COORDINATOR SCHEDULING FORM OVERLAY MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="interview-launcher-modal">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="text-base font-black text-slate-900">Schedule Interview Round</h4>
                <p className="text-[10px] text-slate-400">Student: <b>{selectedStudentName}</b></p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-full bg-slate-50 text-slate-400 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostInterviewSchedule} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Slotted Calendar Date</label>
                <input 
                  type="date" 
                  required 
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full border p-2 text-xs rounded-xl outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interview Time (HH:MM)</label>
                <input 
                  type="time" 
                  required 
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full border p-2 text-xs rounded-xl outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interview Round Conduct</label>
                <select 
                  value={interviewType} 
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full border p-2.5 text-xs rounded-xl bg-white"
                >
                  <option value="virtual">Virtual Video Conference</option>
                  <option value="in_person">In-Person physical meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Meet Link or Corporate Venue Location</label>
                <input 
                  type="text" 
                  value={linkOrVenue}
                  onChange={(e) => setLinkOrVenue(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc or Corp HQ block C Room 102"
                  className="w-full border p-2.5 text-xs rounded-xl outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="bg-emerald-605 hover:bg-emerald-700 bg-emerald-600 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
                >
                  {modalLoading ? "Saving..." : "Lock Schedule slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
