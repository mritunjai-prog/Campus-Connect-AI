import React, { useState, useEffect, lazy, Suspense } from "react";
import { Theme, PlacementDrive, StudentProfile, Application, AuditLog, DashboardStatsTPO } from "../types";
import TpoSidebar, { TpoSubTab } from "./tpo/TpoSidebar";
const DashboardOverview = lazy(() => import("./tpo/DashboardOverview"));
const StudentRegistryTab = lazy(() => import("./tpo/StudentRegistryTab"));
const RecruiterAndJobDesk = lazy(() => import("./tpo/RecruiterAndJobDesk"));
const ApplicationsAndAnalyticsDesk = lazy(() => import("./tpo/ApplicationsAndAnalyticsDesk"));
const UtilitiesAndSettingsDesk = lazy(() => import("./tpo/UtilitiesAndSettingsDesk"));
const PredictiveAnalytics = lazy(() => import("./tpo/PredictiveAnalytics"));
import { AlertCircle, CheckSquare, RefreshCw, Menu, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TpoPortalProps {
  token: string;
  user: any;
  apiBaseUrl: string;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function TpoPortal({ 
  token, 
  user, 
  apiBaseUrl, 
  onLogout, 
  theme, 
  toggleTheme 
}: TpoPortalProps) {
  
  // URL-based navigation
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegment = (location.pathname.split('/')[2] || 'overview') as TpoSubTab;
  const activeTab = pathSegment;
  const setActiveTab = (tab: TpoSubTab) => navigate(`/tpo/${tab}`, { replace: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core synchronized server-side states
  const [stats, setStats] = useState<DashboardStatsTPO | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Page States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchTpoData();
  }, []);

  const fetchTpoData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Fetch summary metrics report
      const sRes = await fetch(`${apiBaseUrl}/api/reports/campus-summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const sData = await sRes.json();
      if (sRes.ok) {
        setStats(sData.summary);
        setAuditLogs(sData.recentActivity || []);
      }

      // 2. Fetch Placement Drives
      const dRes = await fetch(`${apiBaseUrl}/api/drives`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dData = await dRes.json();
      if (dRes.ok) setDrives(dData.drives || []);

      // 3. Fetch Students registration Profiles
      const stRes = await fetch(`${apiBaseUrl}/api/tpo/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const stData = await stRes.json();
      if (stRes.ok) setStudents(stData.students || []);

      // 4. Fetch Drive applications pipeline submissions
      const aRes = await fetch(`${apiBaseUrl}/api/applications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const aData = await aRes.json();
      if (aRes.ok) setApplications(aData.applications || []);

      // 5. Fetch Recruiter Corporate Accounts
      const compRes = await fetch(`${apiBaseUrl}/api/tpo/companies`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const compData = await compRes.json();
      if (compRes.ok) {
        setCompanies(compData.companies || []);
      }

    } catch (err) {
      setErrorMsg("Failed to synchronize administrative dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Student clearance actions (Verify / Reject)
  const handleVerifyStudent = async (studentId: string, status: 'verified' | 'draft', feedback?: string) => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      const res = await fetch(`${apiBaseUrl}/api/tpo/verify-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ studentId, status, feedback })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccessMsg(`Cleared profile status for student ID: ${studentId}.`);
      fetchTpoData();
      
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Clearing student verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Recruiter credentials clearance
  const handleVerifyRecruiter = async (targetUserId: string, action: "approve" | "reject" | "request_more_info") => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/tpo/approve-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const mapping: Record<string, string> = {
        approve: "APPROVED",
        reject: "REJECTED",
        request_more_info: "INFORMATION REQUESTED"
      };
      setSuccessMsg(`Company recruiter status updated to: ${mapping[action] || action}`);
      fetchTpoData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process recruiter status update.");
    }
  };

  // Opportunity/Vacant Job approvals (Pending -> Active Approved)
  const handleApproveOpportunity = async (driveId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      setSuccessMsg("");
      setErrorMsg("");
      const res = await fetch(`${apiBaseUrl}/api/tpo/opportunities/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ driveId, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccessMsg(`Opportunity ${status === 'approved' ? 'approved & published active' : 'rejected successfully'}.`);
      fetchTpoData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Opportunity approvals failing.");
    } finally {
      setLoading(false);
    }
  };

  // Direct Officer Drive Publication (TPO direct vacancies)
  const handleCreateDirectDrive = async (drivePayload: any) => {
    try {
      setLoading(true);
      setSuccessMsg("");
      setErrorMsg("");
      const res = await fetch(`${apiBaseUrl}/api/drives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(drivePayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg("TPO Direct drive published live successfully!");
      fetchTpoData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Hiring vacancy publish failing.");
    } finally {
      setLoading(false);
    }
  };

  // Custom Segmentation Broadcast Notifier
  const handleBroadcastNotification = async (notifData: any) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tpo/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(notifData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to dispatch broadcast.");
    }
  };

  // Student incomplete profile email/app alerts reminder
  const handleSendProfileReminder = async (studentId: string) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await fetch(`${apiBaseUrl}/api/tpo/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType: "individual",
          targetId: studentId,
          title: "Urgent: Complete Your Placement Profile details",
          message: "Your profile completeness rate is below 100%. Please verify records, fill in missing attributes and upload resume immediately for active clearances.",
          type: "Profile Verification"
        })
      });
      if (res.ok) {
        setSuccessMsg("Dispatched profile completeness reminder alert to student.");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      setErrorMsg("Failed to dispatch reminder warning alert.");
    }
  };

  // Application Pipeline state updates (e.g. Shortlisted, selected)
  const handleUpdateApplicantStatus = async (appId: string, status: string, feedback?: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/applications/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Applicant pipeline progress set: ${status.toUpperCase()}!`);
      fetchTpoData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update applicant timeline status.");
    }
  };

  // Navigate to particular tab helper
  const handleNavigationTransition = (tabKey: TpoSubTab) => {
    setActiveTab(tabKey);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-all duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="tpo-redesigned-portal-core">

      {/* Sidebar - Mobile Toggle Logic */}
      <div className={`fixed inset-0 z-50 md:relative md:flex shrink-0 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)} />
        <TpoSidebar 
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          user={user}
          onLogout={onLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          companies={companies}
        />
      </div>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 md:p-8 overflow-y-auto max-h-screen space-y-6" id="tpo-main-workspace-scrollbar">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 transition-colors">
          <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-tight">PlacementCell</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 md:p-0 flex-1 space-y-6">
          {/* Dynamic header log messages banner */}
          <div className="flex border-b border-slate-200 dark:border-slate-850 pb-4 justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest block">ADMINISTRATIVE TPO PANEL</span>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                {activeTab.replace("_", " ")} Workspace
              </h2>
              {loading && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin shrink-0" />}
            </div>
          </div>

          <button 
            onClick={fetchTpoData}
            className="flex items-center space-x-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs border border-slate-200 dark:border-slate-800 transition"
            title="Reload real-time registers"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline font-semibold">Sync Registers</span>
          </button>
        </div>

        {/* Global Feedback bars */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-600/15 border border-emerald-500/25 text-emerald-600 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-slide-up" id="tpo-success-notification-bar">
            <CheckSquare className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-600/15 border border-rose-500/25 text-rose-500 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-slide-up" id="tpo-error-notification-bar">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* RENDER VIEWPORTS BASED ON ACTIVE TAB STATE */}
        <div className="flex-1">
          <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div></div>}>
            {activeTab === "overview" && (
              <DashboardOverview 
                stats={stats}
                students={students}
                companies={companies}
                drives={drives}
                applications={applications}
                recentActivities={auditLogs}
                onReviewStudent={(student) => {
                  setActiveTab("student_verification");
                }}
                onVerifyRecruiter={handleVerifyRecruiter}
                onApproveOpportunity={handleApproveOpportunity}
                onNavigateToTab={handleNavigationTransition}
                sendNotificationReminder={handleSendProfileReminder}
              />
            )}

            {activeTab === "students" && (
              <StudentRegistryTab 
                students={students}
                onVerifyStudent={handleVerifyStudent}
                sendNotificationReminder={handleSendProfileReminder}
                initialFilter="all"
              />
            )}

            {activeTab === "student_verification" && (
              <StudentRegistryTab 
                students={students}
                onVerifyStudent={handleVerifyStudent}
                sendNotificationReminder={handleSendProfileReminder}
                initialFilter="pending"
              />
            )}

            {activeTab === "recruiters" && (
              <RecruiterAndJobDesk 
                companies={companies}
                drives={drives}
                onVerifyRecruiter={handleVerifyRecruiter}
                onApproveOpportunity={handleApproveOpportunity}
                onCreateDrive={handleCreateDirectDrive}
                activeView="recruiters"
              />
            )}

            {activeTab === "jobs_approvals" && (
              <RecruiterAndJobDesk 
                companies={companies}
                drives={drives}
                onVerifyRecruiter={handleVerifyRecruiter}
                onApproveOpportunity={handleApproveOpportunity}
                onCreateDrive={handleCreateDirectDrive}
                activeView="jobs_approvals"
              />
            )}

            {activeTab === "applications_tracker" && (
              <ApplicationsAndAnalyticsDesk 
                applications={applications}
                students={students}
                onUpdateAppStatus={handleUpdateApplicantStatus}
                activeView="applications_tracker"
              />
            )}

            {activeTab === "placement_analytics" && (
              <ApplicationsAndAnalyticsDesk 
                applications={applications}
                students={students}
                onUpdateAppStatus={handleUpdateApplicantStatus}
                activeView="placement_analytics"
              />
            )}

            {activeTab === "predictive_analytics" && (
              <PredictiveAnalytics token={token} apiBaseUrl={apiBaseUrl} />
            )}

            {(activeTab === "notifications_center" || activeTab === "drive_management" || activeTab === "reports_exports" || activeTab === "settings") && (
              <UtilitiesAndSettingsDesk 
                students={students}
                drives={drives}
                companies={companies}
                onBroadcastNotification={handleBroadcastNotification}
                activeView={activeTab as any}
                theme={theme}
                userEmail={user?.email}
              />
            )}
          </Suspense>
        </div>
      </div>
    </main>
  </div>
);
}
