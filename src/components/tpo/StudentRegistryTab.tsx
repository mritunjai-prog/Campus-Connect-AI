import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  TrendingUp,
  Download,
  Award,
  BookOpen,
  Calendar,
  X,
  Plus
} from "lucide-react";
import { StudentProfile } from "../../types";

interface StudentRegistryTabProps {
  students: StudentProfile[];
  onVerifyStudent: (studentId: string, status: 'verified' | 'draft', feedback?: string) => void;
  sendNotificationReminder: (studentId: string) => void;
  initialFilter?: "all" | "pending" | "verified" | "draft" | "under_review";
}

export default function StudentRegistryTab({
  students,
  onVerifyStudent,
  sendNotificationReminder,
  initialFilter = "all"
}: StudentRegistryTabProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter);
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [verifyActionStatus, setVerifyActionStatus] = useState<"verified" | "draft" | null>(null);

  // Available branches & years derived dynamically
  const uniqueBranches = Array.from(new Set(students.map(s => s.branch).filter(Boolean)));
  const uniqueYears = Array.from(new Set(students.map(s => s.graduationYear?.toString()).filter(Boolean)));

  // Master filter logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBranch = selectedBranch === "all" || student.branch === selectedBranch;
    
    // Status can map 'draft' to rejected / draft as per our system rules
    const matchesStatus = selectedStatus === "all" || 
                          (selectedStatus === "pending" && (student.verificationStatus === "pending" || student.verificationStatus === "completed")) ||
                          (selectedStatus === "verified" && student.verificationStatus === "verified") ||
                          (selectedStatus === "draft" && student.verificationStatus === "draft");

    const matchesCgpa = (student.cgpa || 0) >= minCgpa;
    const matchesYear = selectedYear === "all" || student.graduationYear?.toString() === selectedYear;

    return matchesSearch && matchesBranch && matchesStatus && matchesCgpa && matchesYear;
  });

  const handleOpenVerifyDialog = (action: "verified" | "draft") => {
    setVerifyActionStatus(action);
  };

  const handleConfirmVerifyAction = () => {
    if (!selectedStudent) return;
    onVerifyStudent(selectedStudent.id, verifyActionStatus || "verified", feedbackText);
    
    // update local state
    if (verifyActionStatus) {
      selectedStudent.verificationStatus = verifyActionStatus;
    }
    
    // Reset modal variables
    setVerifyActionStatus(null);
    setFeedbackText("");
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="student_registry_and_verification_tab">
      
      {/* Search & Filter bar Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Student Database & Clearance Controls</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">Query student registers, examine profiles, scores, and dispatch clearance status ticks</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => { setSelectedStatus("all"); setSelectedBranch("all"); setSearchQuery(""); setMinCgpa(0); setSelectedYear("all"); }}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-750 dark:text-slate-300 font-bold text-xs px-3 py-2 rounded-xl border border-transparent transition-all"
            >
              Reset Filters
            </button>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl block">
              Records Count: {filteredStudents.length} of {students.length}
            </div>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search by name, email, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-550 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Branch select */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
            >
              <option value="all">Every Branch</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {/* Verification Status option select */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none font-bold"
            >
              <option value="all">All Clearance Status</option>
              <option value="pending">Awaiting Review (Pending)</option>
              <option value="verified">Verified clearance ticks</option>
              <option value="draft">Rejected profiles</option>
            </select>
          </div>

          {/* CGPA Slider limit */}
          <div className="relative flex flex-col justify-center px-1">
            <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-500 font-bold mb-1">
              <span>Min CGPA Requirement:</span>
              <span className="text-indigo-600 font-bold">{minCgpa > 0 ? minCgpa : 'None'}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Graduation Year */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Grad Batches</option>
              {uniqueYears.map(yr => (
                <option key={yr} value={yr}>Graduating {yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="filtered-students-grids">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">No student registers found</h4>
            <p className="text-xs text-slate-450 max-w-md mx-auto">None of the students matching current filters configuration are present in database records.</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const isVerifiedStatus = student.verificationStatus === "verified";
            const isPendingStatus = student.verificationStatus === "pending" || student.verificationStatus === "completed";
            const isRejected = student.verificationStatus === "draft";
            const completeness = student.profileCompleteness || 0;

            return (
              <div 
                key={student.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 flex flex-col justify-between"
                id={`student-card-${student.id}`}
              >
                <div>
                  {/* Card Header row */}
                  <div className="flex justify-between items-start space-x-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate mb-0.5">{student.name}</h4>
                      <span className="text-[10px] text-slate-450 block truncate">{student.email}</span>
                    </div>

                    {/* Badge */}
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                      isVerifiedStatus 
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40" 
                        : isPendingStatus 
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
                          : "bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    }`}>
                      {student.verificationStatus || "pending"}
                    </span>
                  </div>

                  {/* Academic Stats Pill block */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-150/40 dark:border-slate-850">
                    <div className="text-center">
                      <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">CGPA</span>
                      <span className="font-mono text-xs text-slate-900 dark:text-white font-extrabold">{student.cgpa || "N/A"}</span>
                    </div>
                    <div className="text-center border-x border-slate-200 dark:border-slate-800">
                      <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Backlogs</span>
                      <span className="font-mono text-xs text-rose-500 font-extrabold">{student.backlogs ?? 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Grad Year</span>
                      <span className="font-mono text-xs text-slate-900 dark:text-white font-extrabold">{student.graduationYear || "2026"}</span>
                    </div>
                  </div>

                  {/* Skills lists tags */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Primary Skills</span>
                    {student.skills && student.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                        {student.skills.slice(0, 4).map((sk, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-350 text-[9px] px-2 py-0.5 rounded-md">
                            {sk}
                          </span>
                        ))}
                        {student.skills.length > 4 && (
                          <span className="text-[9px] text-slate-400 font-bold px-1 py-0.5 border border-dashed border-slate-200 dark:border-slate-800 rounded">
                            +{student.skills.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic block">No skills tags specified</span>
                    )}
                  </div>

                  {/* Profile completeness meter */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-slate-400">Profile Completeness:</span>
                      <span className={`font-mono font-bold ${completeness < 100 ? "text-amber-500" : "text-emerald-500"}`}>{completeness}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${completeness < 100 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${completeness}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom drawer */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between space-x-2">
                  <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-tight bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-120/50">
                    {student.branch || "CSE Dept"}
                  </span>

                  <div className="flex space-x-1">
                    {completeness < 100 && (
                      <button 
                        onClick={() => sendNotificationReminder(student.id)}
                        className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition border border-amber-500/20"
                        title="Send complete-profile reminder"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shrink-0"
                    >
                      Audit Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* STUDENT DETAILS & VERIFICATION CONTROL AUDIT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4" id="student-audit-detail-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded block w-fit mb-1">
                  OFFICIAL TPO AUDIT REGISTRY
                </span>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-lg">{selectedStudent.name}</h3>
                <span className="text-xs text-slate-450 dark:text-slate-500">{selectedStudent.email} • ID: {selectedStudent.id}</span>
              </div>
              <button 
                onClick={() => { setSelectedStudent(null); setVerifyActionStatus(null); setFeedbackText(""); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="space-y-5 flex-1 select-none">
              
              {/* Row 1: Academic Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150/80 dark:border-slate-850">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Department</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedStudent.branch || "CSE"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Aggregate CGPA</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{selectedStudent.cgpa || "7.2"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Backlogs</span>
                  <span className="text-xs font-bold text-rose-500 font-mono">{selectedStudent.backlogs ?? 0}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Completeness</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedStudent.profileCompleteness || 0}%</span>
                </div>
              </div>

              {/* Skills Area */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block uppercase">Skills Profile</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    selectedStudent.skills.map((s, idx) => (
                      <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-lg font-semibold border border-indigo-120/40">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450 italic">No skill sets defined</span>
                  )}
                </div>
              </div>

              {/* Resume Score Analytics Panel */}
              <div className="p-4 bg-slate-955/20 dark:bg-slate-950/40 border border-slate-205 dark:border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-400 block uppercase">Resume Scoring & Verification Queue</span>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-905 dark:text-slate-200">System Resume Analytics Rating</h5>
                    <p className="text-[10px] text-slate-450">Automated algorithmic analysis of resume readability indexes</p>
                  </div>
                  <span className={`text-sm font-black font-mono px-3 py-1 rounded-xl ${
                    (selectedStudent.resumeScore || 0) >= 80 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}>
                    {selectedStudent.resumeScore || 65}/100 Rating
                  </span>
                </div>
                
                {/* Download resume mock trigger */}
                {selectedStudent.resumeUrl ? (
                  <a 
                    href={selectedStudent.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl space-x-2 text-xs transition duration-150 border border-indigo-120/30 flex items-center justify-center cursor-pointer block mt-3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Student Resume File</span>
                  </a>
                ) : (
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-center text-[11px] text-rose-500 mt-2">
                    No resume document uploaded yet. Can NOT verify.
                  </div>
                )}
              </div>

              {/* Contact and address notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">LinkedIn Profile</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs block truncate italic">{selectedStudent.linkedInUrl || "No LinkedIn Profile Linked"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Personal Portfolio</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs block truncate italic">{selectedStudent.gitHubUrl || "No GitHub Portfolio Linked"}</span>
                </div>
              </div>

              {/* Clearance Controls Interface */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <span className="text-xs font-bold text-slate-905 dark:text-white block uppercase">Verify Clearance Validation Actions</span>
                
                {verifyActionStatus === null ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenVerifyDialog("draft")}
                      className="flex-1 bg-slate-105 hover:bg-slate-205 dark:bg-slate-800 hover:dark:bg-slate-750 text-rose-500 dark:text-rose-400 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Profile Form Details</span>
                    </button>
                    <button 
                      onClick={() => handleOpenVerifyDialog("verified")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Profile & Clear Placement Route</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {verifyActionStatus === "verified" ? "Confirm Profile Clearance Approve" : "Provide rejection remarks for correction"}
                      </span>
                      <button 
                        onClick={() => setVerifyActionStatus(null)}
                        className="text-[10px] text-slate-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <textarea
                      placeholder={verifyActionStatus === "verified" ? "Provide any optional notes (e.g. Cleared CSE Board Clearance Check)" : "Specify missing details (e.g. Please correct CGPA from 6.8 to 6.2 as per board records)"}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-650"
                    />

                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => { setVerifyActionStatus(null); setFeedbackText(""); }}
                        className="bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 text-slate-750 dark:text-slate-300 font-bold text-[10px] px-3.5 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleConfirmVerifyAction}
                        className={`font-bold text-[10px] px-3.5 py-2 rounded-lg text-white ${
                          verifyActionStatus === "verified" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                        }`}
                      >
                        {verifyActionStatus === "verified" ? "Verify Student Clearance" : "Reject Profile Form"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
