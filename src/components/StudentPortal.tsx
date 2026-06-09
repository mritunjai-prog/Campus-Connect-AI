import React, { useState, useEffect, lazy, Suspense } from "react";
import { Sidebar } from "./student/Sidebar";
const Dashboard = lazy(() => import("./student/Dashboard").then(m => ({ default: m.Dashboard })));
const ProfileView = lazy(() => import("./student/Profile").then(m => ({ default: m.Profile })));
const DiscoveryHubView = lazy(() => import("./student/CareerDiscoveryHub").then(m => ({ default: m.CareerDiscoveryHub })));
const ResumeCenterView = lazy(() => import("./student/ResumeCenter").then(m => ({ default: m.ResumeCenter })));
const MockInterviewView = lazy(() => import("./student/MockInterview").then(m => ({ default: m.MockInterview })));
const ApplicationsView = lazy(() => import("./student/Applications").then(m => ({ default: m.Applications })));
const StudentChatbot = lazy(() => import("./student/StudentChatbot").then(m => ({ default: m.StudentChatbot })));
const AccountSecuritySettings = lazy(() => import("./shared/AccountSecuritySettings"));
import { useNavigate, useLocation } from "react-router-dom";

import { 
  Bell, 
  Settings, 
  AlertCircle,
  CheckCircle,
  X,
  Menu,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentProfile, PlacementDrive, Application, Interview, Notification, Theme } from "../types";
import { Lock, FileWarning } from "lucide-react";

interface StudentPortalProps {
  token: string;
  user: any;
  initialProfile: StudentProfile;
  apiBaseUrl: string;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

type TabType = "dashboard" | "profile" | "opportunities" | "resume" | "applications" | "interview" | "notifications" | "settings";

export default function StudentPortal({ token, user, initialProfile, apiBaseUrl, onLogout, theme, toggleTheme }: StudentPortalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // Derive activeTab from URL path: /student/dashboard -> "dashboard"
  const pathSegment = location.pathname.split('/')[2] || 'dashboard';
  const activeTab = pathSegment as TabType;
  const setActiveTab = (tab: TabType) => navigate(`/student/${tab}`, { replace: true });
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [showLockModal, setShowLockModal] = useState<{ tab: string; reason: string } | null>(null);

  const handleTabChange = (tab: TabType) => {
    // Access Rules
    const isCompleted = profile.profileCompleteness >= 100;
    const isVerified = profile.verificationStatus === 'verified';

    // Allow access to Dashboard, Profile, Notifications, Settings, and preparation tools (Resume Center, AI Mock Interview). All other placement-bound features require verification.
    if (tab !== 'dashboard' && tab !== 'profile' && tab !== 'notifications' && tab !== 'settings' && tab !== 'resume' && tab !== 'interview') {
      if (!isVerified) {
        setShowLockModal({ 
          tab, 
          reason: !isCompleted 
            ? "Your academic profile is incomplete. Please complete your profile to 100% to request verification from the Training & Placement Office." 
            : profile.verificationStatus === "pending"
              ? "Your profile is current Pending Approval 🟡. The Training & Placement Office is currently auditing your records."
              : "Institutional verification is required. Go to your Profile screen and click 'Verify Now' to submit your profile to TPO."
        });
        return;
      }
    }

    setActiveTab(tab);
    setIsSidebarOpen(false);
  };
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<{ drive: PlacementDrive; matchScore: number; explanation: string }[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Resume state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Interview state
  const [interviewPhase, setInterviewPhase] = useState<"init" | "ongoing" | "result">("init");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [isEvaluatingInterview, setIsEvaluatingInterview] = useState(false);
  const [interviewEvaluation, setInterviewEvaluation] = useState<any>(null);

  useEffect(() => {
    fetchMainData();
  }, []);

  const fetchMainData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const [dRes, pRes, aRes, iRes, nRes, rRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/drives`, { headers }),
        fetch(`${apiBaseUrl}/api/profile`, { headers }),
        fetch(`${apiBaseUrl}/api/applications`, { headers }),
        fetch(`${apiBaseUrl}/api/interviews`, { headers }),
        fetch(`${apiBaseUrl}/api/notifications`, { headers }),
        fetch(`${apiBaseUrl}/api/ai/job-recommendations`, { headers })
      ]);

      const parseJsonSafe = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            return await res.json();
          } catch (e) {
            return null;
          }
        }
        return null;
      };

      const dData = await parseJsonSafe(dRes);
      if (dData) setDrives(dData.drives);

      const pData = await parseJsonSafe(pRes);
      if (pData) setProfile(pData.profile);

      const aData = await parseJsonSafe(aRes);
      if (aData) setApplications(aData.applications);

      const iData = await parseJsonSafe(iRes);
      if (iData) setInterviews(iData.interviews);

      const nData = await parseJsonSafe(nRes);
      if (nData) setNotifications(nData.notifications);

      const rData = await parseJsonSafe(rRes);
      if (rData) setRecommendations(rData.recommendations || []);

    } catch (err) {
      showAlert("error", "Database sync failed. Check connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleApply = async (driveId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/applications/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ driveId })
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to submit application. Server returned an invalid response.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showAlert("success", `Application secured! ${data.explanation}`);
      fetchMainData();
    } catch (err: any) {
      showAlert("error", err.message);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to update profile. Server encountered an issue.");
      }
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      setProfile(resData.profile);
    } catch (err: any) {
      showAlert("error", err.message);
      throw err;
    }
  };

  const handleResumeUpload = async (file: File) => {
    // Client-side validation
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      showAlert("error", "Invalid file type. Please upload PDF, DOC, or DOCX.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert("error", "File too large. Max size is 5MB.");
      return;
    }

    console.log(`[ResumeUpload] UI: Started for ${file.name}`);
    setUploadProgress(10);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Str = (reader.result as string).split(",")[1];
        setUploadProgress(50);
        const res = await fetch(`${apiBaseUrl}/api/profile/upload-resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            fileBase64: base64Str,
            fileName: file.name,
            mimeType: file.type || "application/pdf"
          })
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           console.error("[ResumeUpload] UI: Server returned non-JSON response", await res.text());
           throw new Error("Unable to upload resume. Server encountered an issue.");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        console.log("[ResumeUpload] UI: Upload success", data.resumeUrl);
        setUploadProgress(100);
        showAlert("success", "Resume uploaded. AI Analysis initiated.");
        
        // Update profile locally immediately
        setProfile(prev => ({ 
          ...prev, 
          resumeUrl: data.resumeUrl, 
          resumeFileName: data.resumeFileName 
        }));

        await handleResumeAnalyze(data.detectedText, data.resumeFileName);
      } catch (err: any) {
        console.error("[ResumeUpload] UI Error:", err);
        showAlert("error", err.message.includes("Unexpected token") ? "Unable to upload resume. Please try again later." : err.message);
      } finally {
        setUploadProgress(null);
      }
    };
  };

  const handlePhotoUpload = async (file: File) => {
    if (file.size > 3.5 * 1024 * 1024) {
      showAlert("error", "Photo too large. Max size is 3.5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showAlert("error", "Invalid file type. Please upload an image.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Str = (reader.result as string).split(",")[1];
        const res = await fetch(`${apiBaseUrl}/api/profile/upload-photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            fileBase64: base64Str,
            fileName: file.name,
            mimeType: file.type || "image/jpeg"
          })
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Unable to upload photo. Server encountered an issue.");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        
        setProfile({ ...profile, photoUrl: data.photoUrl });
        showAlert("success", "Professional photo updated successfully!");
      } catch (err: any) {
        console.error("[PhotoUpload] UI Error:", err);
        showAlert("error", err.message.includes("Unexpected token") ? "Unable to upload photo. Please try again later." : err.message);
      } finally {
        setLoading(false);
      }
    };
  };

  const handleResumeAnalyze = async (text: string, fileName: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/ai/resume-analyzer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ resumeText: text, fileName })
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to analyze resume. Server returned a non-JSON response.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile({ ...profile, resumeScore: data.analysis.atsScore, resumeAnalysis: data.analysis });
      showAlert("success", "AI Analysis complete.");
    } catch (err: any) {
      showAlert("error", err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartInterview = async (role: string, difficulty: string) => {
    setIsGeneratingInterview(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/ai/mock-interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ jobRole: role, difficulty })
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to generate interview. Server returned an invalid response.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInterviewQuestions(data.questions);
      setInterviewPhase("ongoing");
      setCurrentQuestionIndex(0);
      setInterviewAnswers([]);
    } catch (err: any) {
      showAlert("error", err.message);
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleSubmitInterviewAnswer = async (answer: string) => {
    const qText = interviewQuestions[currentQuestionIndex];
    const updatedAnswers = [...interviewAnswers, { question: qText, answer }];
    setInterviewAnswers(updatedAnswers);

    if (currentQuestionIndex + 1 < interviewQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setInterviewPhase("result");
      setIsEvaluatingInterview(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/ai/mock-interview/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ jobRole: "Software Engineer", answers: updatedAnswers })
        });
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Unable to evaluate interview. Server returned an invalid response.");
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setInterviewEvaluation(data.evaluation);
        showAlert("success", "Interview evaluation ready!");
      } catch (err: any) {
        showAlert("error", err.message);
      } finally {
        setIsEvaluatingInterview(false);
      }
    }
  };

  const handleSubmitVerification = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/student/submit-verification`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to submit profile for verification. Server returned an invalid response.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showAlert("success", "Profile submitted for university verification!");
      fetchMainData();
    } catch (err: any) {
      showAlert("error", err.message);
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard profile={profile} applications={applications} interviews={interviews} recommendations={recommendations} onApply={handleApply} setActiveTab={handleTabChange} onSubmitVerification={handleSubmitVerification} />;
      case "profile": return <ProfileView profile={profile} onUpdate={handleProfileUpdate} loading={loading} onUploadResume={handleResumeUpload} onUploadPhoto={handlePhotoUpload} onSubmitVerification={handleSubmitVerification} apiBaseUrl={apiBaseUrl} />;
      case "opportunities": return <DiscoveryHubView onApply={handleApply} studentProfile={profile} />;
      case "resume": return <ResumeCenterView profile={profile} onUpload={handleResumeUpload} onAnalyze={handleResumeAnalyze} loading={loading} isAnalyzing={isAnalyzing} uploadProgress={uploadProgress} apiBaseUrl={apiBaseUrl} token={token} />;
      case "applications": return <ApplicationsView applications={applications} onTrack={() => {}} />;
      case "interview": return <MockInterviewView onStart={handleStartInterview} onSubmitAnswer={handleSubmitInterviewAnswer} isGenerating={isGeneratingInterview} isEvaluating={isEvaluatingInterview} phase={interviewPhase} questions={interviewQuestions} currentIndex={currentQuestionIndex} evaluation={interviewEvaluation} />;
      case "notifications": return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-10 shadow-sm transition-colors">
          <h1 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">Notifications</h1>
          <div className="space-y-4">
            {notifications.map((n, idx) => (
              <div key={n.id || idx} className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-start space-x-4">
                 <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</p>
                 </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-slate-400 text-sm italic">No recent updates.</p>}
          </div>
        </div>
      );
      case "settings": return (
         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 md:p-10 shadow-sm transition-colors text-left max-w-4xl mx-auto">
            <AccountSecuritySettings theme={theme} userRole="student" userEmail={user?.email} />
         </div>
      );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Mobile Toggle Logic */}
      <div className={`fixed inset-0 z-50 md:relative md:flex shrink-0 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)} />
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          profile={profile} 
          unreadCount={notifications.filter(n => !n.isRead).length} 
          onLogout={onLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          apiBaseUrl={apiBaseUrl}
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative custom-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 transition-colors">
          <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-tight">CampusConnect</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
          {/* Global Loading Bar */}
          {loading && (
            <div className="fixed top-0 left-0 md:left-72 right-0 h-1 z-50 overflow-hidden">
              <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="h-full w-1/3 bg-indigo-600"
              />
            </div>
          )}

          <div className="p-4 sm:p-8 lg:p-12 min-h-full">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
                 {renderView()}
               </Suspense>
             </motion.div>
           </AnimatePresence>
          </div>
        </div>

        {/* Global Alerts */}
        <AnimatePresence>
          {alert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className={`fixed bottom-8 right-8 z-50 p-6 rounded-[2rem] shadow-2xl flex items-center space-x-4 border max-w-sm ${
                alert.type === 'success' ? "bg-emerald-900 text-white border-emerald-500/20" : "bg-rose-900 text-white border-rose-500/20"
              }`}
            >
              <div className={`p-2 rounded-xl ${alert.type === 'success' ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                {alert.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <p className="text-sm font-bold flex-1">{alert.message}</p>
              <button onClick={() => setAlert(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Lock Modal */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-700 text-center"
            >
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">Profile Completion Required</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                {showLockModal.reason}
              </p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    navigate("/student/profile");
                    setShowLockModal(null);
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Go to Profile
                </button>
                <button 
                  onClick={() => setShowLockModal(null)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Global Assistant */}
      <Suspense fallback={null}>
        <StudentChatbot token={token} apiBaseUrl={apiBaseUrl} />
      </Suspense>
    </div>
  );
}
