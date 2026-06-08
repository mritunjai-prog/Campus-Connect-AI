import React, { useState } from "react";
import { 
  Bell, 
  Send, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Download, 
  Settings as SettingsIcon, 
  User, 
  Check, 
  X, 
  Plus, 
  AlertCircle,
  HelpCircle,
  Users,
  ShieldCheck,
  Award
} from "lucide-react";
import { StudentProfile, PlacementDrive } from "../../types";
import AccountSecuritySettings from "../shared/AccountSecuritySettings";

interface UtilitiesAndSettingsDeskProps {
  students: StudentProfile[];
  drives: PlacementDrive[];
  companies: any[];
  onBroadcastNotification: (data: {
    targetType: string;
    targetId?: string;
    department?: string;
    batch?: string;
    title: string;
    message: string;
    type: string;
  }) => Promise<any>;
  onUpdateTpoSettings?: (settings: any) => void;
  activeView: "notifications_center" | "drive_management" | "reports_exports" | "settings";
  theme?: "light" | "dark";
  userEmail?: string;
}

export default function UtilitiesAndSettingsDesk({
  students,
  drives,
  companies,
  onBroadcastNotification,
  onUpdateTpoSettings,
  activeView,
  theme = "light",
  userEmail = "tpo01admin@gmail.com"
}: UtilitiesAndSettingsDeskProps) {

  // Notifications state variables
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifTargetId, setNotifTargetId] = useState("");
  const [notifDept, setNotifDept] = useState("");
  const [notifBatch, setNotifBatch] = useState("2026");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifCategory, setNotifCategory] = useState("Placement Update");

  const [logs, setLogs] = useState<any[]>([
    { id: 1, title: "Google SDE-I Round-1 Scheduling", target: "individual", count: 12, time: "2026-06-05T14:22:00Z" },
    { id: 2, title: "Cognizant Genc On-Campus Roster compiled", target: "department", count: 154, time: "2026-06-05T10:15:00Z" },
    { id: 3, title: "AWS Cloud Support Engineer Placement Drive Open", target: "all", count: 489, time: "2026-06-04T09:00:00Z" }
  ]);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");

  // Drive Categories State
  const [driveCategory, setDriveCategory] = useState<"upcoming" | "active" | "completed">("active");

  // Settings State variables
  const [officerName, setOfficerName] = useState("Dr. Vijay Kumar Sharma");
  const [officerDept, setOfficerDept] = useState("Department of Training & Placement");
  const [defaultMinCgpa, setDefaultMinCgpa] = useState("7.0");
  const [preferredBatch, setPreferredBatch] = useState("2026");
  const [autoApproveCompanies, setAutoApproveCompanies] = useState(true);

  // Submitting Announcement
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess("");
    setErr("");
    try {
      const res = await onBroadcastNotification({
        targetType: notifTarget,
        targetId: notifTargetId || undefined,
        department: notifDept || undefined,
        batch: notifBatch || undefined,
        title: notifTitle,
        message: notifMessage,
        type: notifCategory
      });
      setSuccess(res?.message || "Notification broadcast dispatched successfully!");
      setLogs([
        { 
          id: Date.now(), 
          title: notifTitle, 
          target: notifTarget, 
          count: res?.count || 1, 
          time: new Date().toISOString() 
        },
        ...logs
      ]);
      setNotifTitle("");
      setNotifMessage("");
    } catch (e: any) {
      setErr(e?.message || "Dispach failing validation check.");
    } finally {
      setSending(false);
    }
  };

  // Export spreadsheet as simple CSV downloader
  const handleExportCSV = (reportType: string) => {
    let rows: string[][] = [];
    if (reportType === "placements") {
      rows = [
        ["Student Name", "Email", "Branch", "Company Name", "Job Designation", "CTC LPA", "Status"],
        ["Abhishek Sen", "abhishek.cse@university.edu", "Computer Science", "Amazon", "SDE Intern", "15.0", "selected"],
        ["Sanjana Rao", "sanjana.it@university.edu", "Information Technology", "Cognizant", "Genc Dev", "4.5", "selected"],
        ["Arun Verma", "arun.ece@university.edu", "Electronics", "Google", "Solutions Architect", "32.0", "selected"]
      ];
    } else if (reportType === "students") {
      rows = [
        ["ID", "Student Name", "Email Address", "Branch", "Grad Year", "CGPA Rating", "Verification Status"],
        ...students.map(s => [s.id, s.name, s.email, s.branch, String(s.graduationYear || 2026), String(s.cgpa), s.verificationStatus || "pending"])
      ];
    } else {
      rows = [
        ["Company Name", "Registered Contact", "Verification Status", "Eligible Offer Postings"],
        ...companies.map(c => [c.name, c.email, c.isVerified ? "Verified" : "Pending", "Active"])
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(r => r.map(cell => `"${cell || ''}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_placement_cell_report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser instant print trigger
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="utilities-and-settings-desk">
      
      {/* 1. NOTIFICATIONS CENTER VIEW */}
      {activeView === "notifications_center" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch cockpit */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs" id="custom-notifications-broadcast-card">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Broadcast System Bulletins</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Send immediate message bulletins to target pools of students or recruiters</p>
            </div>

            {success && <div className="p-3 bg-emerald-600/10 text-emerald-600 font-bold text-xs rounded-xl border border-emerald-500/20">{success}</div>}
            {err && <div className="p-3 bg-rose-600/10 text-rose-500 font-bold text-xs rounded-xl border border-rose-550/20">{err}</div>}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target select */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Segment</label>
                  <select 
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none font-bold"
                  >
                    <option value="all">Broadcast All Students & Recruiters</option>
                    <option value="students">Every Single Student</option>
                    <option value="recruiters">Every Signed Recruiter Partner</option>
                    <option value="department">By Academic Department</option>
                    <option value="batch">By Graduation Year Batch</option>
                    <option value="individual">Direct Individual Student (By ID)</option>
                  </select>
                </div>

                {/* Notification Category */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notification Event Type</label>
                  <select 
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Placement Update">Placement Update Announcement</option>
                    <option value="Interview Reminder">Interview Schedule Alert</option>
                    <option value="Profile Verification">Profile Audit Feedback</option>
                    <option value="Drive Reminder">Hiring Drive Closing Checklist</option>
                  </select>
                </div>
              </div>

              {/* Conditional parameters based on target selection */}
              {notifTarget === "individual" && (
                <div className="animate-slide-up">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Student ID</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter student exact database ID..."
                    value={notifTargetId}
                    onChange={(e) => setNotifTargetId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              )}

              {notifTarget === "department" && (
                <div className="animate-slide-up">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Branch Stream Name</label>
                  <select 
                    value={notifDept}
                    onChange={(e) => setNotifDept(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Choose department name...</option>
                    <option value="Computer Science">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electronics">Electronics Board</option>
                  </select>
                </div>
              )}

              {notifTarget === "batch" && (
                <div className="animate-slide-up">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Graduation Batch Year</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 2026"
                    value={notifBatch}
                    onChange={(e) => setNotifBatch(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              )}

              {/* Title info */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Announcement Bulletin Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. AWS On-Campus Drive Registration Closing in 24 hours"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Message Body Details</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Write clear bulletin information to target users dashboards..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Confirm submit buttons */}
              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button 
                  type="submit"
                  disabled={sending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>{sending ? "Delivering..." : "Dispatch Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Broadcast logs */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">Broadcast Dispatch Log</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map(lg => (
                <div key={lg.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800/60 text-xs">
                  <div className="flex justify-between items-start mb-1 text-[10px] text-slate-400 font-bold uppercase">
                    <span>Target: {lg.target}</span>
                    <span>{new Date(lg.time).toLocaleTimeString()}</span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">{lg.title}</h5>
                  <span className="text-[10px] text-indigo-500 font-bold block mt-1">Dispatched to {lg.count} targets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. DRIVE MANAGEMENT VIEW */}
      {activeView === "drive_management" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Hiring Drives Dispatcher Portal</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-bold">Monitor live recruitment timelines, schedule board calendars, and oversee drives completion rates</p>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800">
              <button 
                onClick={() => setDriveCategory("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${driveCategory === "active" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Active Hiring Drives
              </button>
              <button 
                onClick={() => setDriveCategory("upcoming")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${driveCategory === "upcoming" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Upcoming Lists
              </button>
              <button 
                onClick={() => setDriveCategory("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${driveCategory === "completed" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Completed Records
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.filter(d => (driveCategory === "completed" ? d.status === "completed" : d.status === "active")).map(drive => (
              <div key={drive.id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between" id={`drive-mng-${drive.id}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-905 dark:text-white text-xs truncate">{drive.jobRole}</h4>
                      <span className="text-[11px] text-slate-450 block truncate font-bold">{drive.companyName}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-150/40">
                      {drive.type || "placement"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic line-clamp-3 mt-3">{drive.jobDescription || "No detailed vacancy listings mapped."}</p>
                
                  {/* Stats list */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-450 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between p-1">
                      <span>Package CTC:</span>
                      <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{drive.packageLPA} LPA</span>
                    </div>
                    <div className="flex justify-between p-1">
                      <span>Audit Status:</span>
                      <span className="text-emerald-500 font-bold">{drive.approvalStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Closing: {drive.applicationDeadline}</span>
                  <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-transparent">
                    Roster Audit Previews
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REPORTS & EXPORTS VIEW */}
      {activeView === "reports_exports" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Hiring Records & Downloadable Exports</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Generate spreadsheet registries, print corporate rosters and compile institutional summaries</p>
            </div>

            <button 
              onClick={handleTriggerPrint}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-transparent transition flex items-center space-x-1"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Print Dashboard Roster</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Placements report details */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between" id="report-card-placements">
              <div>
                <div className="bg-indigo-600/10 text-indigo-600 p-2.5 rounded-xl w-fit mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Hired Placements Registry</h4>
                <p className="text-[11px] text-slate-500 mt-1">Spreadsheet list of all successfully placed students, signed corporate recruiters and package LPA allocations.</p>
              </div>

              <button 
                onClick={() => handleExportCSV("placements")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl block text-center mt-5 flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Placements Excel</span>
              </button>
            </div>

            {/* Box 2: Students report details */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between" id="report-card-students">
              <div>
                <div className="bg-emerald-605 bg-emerald-600/10 text-emerald-500 p-2.5 rounded-xl w-fit mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Onboarded Students Register</h4>
                <p className="text-[11px] text-slate-500 mt-1">Full dataset registry containing CGPA logs, eligibility streams, verification clearance ticks and scores.</p>
              </div>

              <button 
                onClick={() => handleExportCSV("students")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl block text-center mt-5 flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Students CSV</span>
              </button>
            </div>

            {/* Box 3: Recruiter report details */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between" id="report-card-recruiters">
              <div>
                <div className="bg-cyan-600/10 text-cyan-500 p-2.5 rounded-xl w-fit mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Verified Recruiter Directory</h4>
                <p className="text-[11px] text-slate-500 mt-1">Official listing report profiles of verified partner organisations, registered job roles and contact personas.</p>
              </div>

              <button 
                onClick={() => handleExportCSV("companies")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl block text-center mt-5 flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Recruiter Directory</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. SETTINGS VIEW */}
      {activeView === "settings" && (
        <div className="space-y-6 max-w-4xl" id="tpo-settings-desk-view">
          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-xs select-none">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">TPO Director desk setup</h3>
              <span className="text-xs text-slate-450 dark:text-slate-500 block mt-0.5">Configure institutional preferences, default clearance standards and desk identification details</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Officer Designate Name</label>
                <input 
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-905 dark:text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Institutional Department Seat</label>
                <input 
                  type="text"
                  value={officerDept}
                  onChange={(e) => setOfficerDept(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-905 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Default Min CGPA Clearance Cutoff</label>
                  <input 
                    type="text"
                    value={defaultMinCgpa}
                    onChange={(e) => setDefaultMinCgpa(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-905 dark:text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Active Graduation Batch Year</label>
                  <input 
                    type="text"
                    value={preferredBatch}
                    onChange={(e) => setPreferredBatch(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-905 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Dynamic settings check controls sliders */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Policy Configurations</span>
                
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Auto Approve Signed Recruiters</span>
                    <p className="text-[10px] text-slate-450">Bypasses manual verification check logic for validated corporate URLs</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoApproveCompanies}
                    onChange={(e) => setAutoApproveCompanies(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button 
                  onClick={() => alert("Director settings configuration successfully persisted locally.")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Save Desk Preferences
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs text-left">
            <AccountSecuritySettings theme={theme} userRole="tpo" userEmail={userEmail} />
          </div>
        </div>
      )}

    </div>
  );
}
