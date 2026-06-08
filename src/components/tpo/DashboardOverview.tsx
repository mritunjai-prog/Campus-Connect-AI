import React from "react";
import { 
  Users, 
  Building2, 
  Briefcase, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Bell, 
  ArrowRight,
  ShieldAlert,
  Award,
  Zap,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  HelpCircle
} from "lucide-react";
import { PlacementDrive, StudentProfile, Application, AuditLog, DashboardStatsTPO } from "../../types";

interface DashboardOverviewProps {
  stats: DashboardStatsTPO | null;
  students: StudentProfile[];
  companies: any[];
  drives: PlacementDrive[];
  applications: Application[];
  recentActivities: AuditLog[];
  onReviewStudent: (student: StudentProfile) => void;
  onVerifyRecruiter: (recruiterId: string, action: "approve" | "reject" | "request_more_info") => void;
  onApproveOpportunity: (driveId: string, status: 'approved' | 'rejected') => void;
  onNavigateToTab: (tab: any) => void;
  sendNotificationReminder: (studentId: string) => void;
}

export default function DashboardOverview({
  stats,
  students,
  companies,
  drives,
  applications,
  recentActivities,
  onReviewStudent,
  onVerifyRecruiter,
  onApproveOpportunity,
  onNavigateToTab,
  sendNotificationReminder
}: DashboardOverviewProps) {

  // Awaiting students and recruiters
  const pendingStudents = students.filter(s => s.verificationStatus === "pending" || s.verificationStatus === "completed" || s.verificationStatus === "draft").slice(0, 4);
  const pendingRecruiters = companies.filter(c => !c.isVerified && !c.isApproved).slice(0, 4);

  // Recent job/internship approved/pending opportunities
  const pendingOpportunities = drives.filter(d => d.approvalStatus === "pending").slice(0, 4);

  // Calculating exact dynamic counts for the top 5 cards
  const totalStudentsCount = students.length || stats?.totalStudents || 0;
  const verifiedStudentsCount = students.filter(s => s.verificationStatus === "verified").length;
  const activeRecruitersCount = companies.filter(c => c.isVerified || c.isApproved || c.isVerified === undefined).length || stats?.totalCompanies || 0;
  const openOpportunitiesCount = drives.filter(d => d.approvalStatus === "approved" && d.status === "active").length || stats?.totalDrives || 0;
  const pendingVerificationsCount = students.filter(s => s.verificationStatus === "pending" || s.verificationStatus === "completed").length + companies.filter(c => !c.isVerified && !c.isApproved).length;

  // Second row cards calculations
  const totalApplicationsCount = applications.length || 0;
  const selectedStudentsCount = applications.filter(a => a.status === "selected").length;
  const placementRateVal = totalStudentsCount > 0 
    ? Math.round((students.filter(s => applications.some(a => a.studentId === s.id && a.status === "selected")).length / totalStudentsCount) * 100)
    : stats?.placementPercentage || 0;
  const avgPackageVal = stats?.averagePackage || 6.2;
  const highestPackageVal = stats?.highestPackage || 45.0;

  // Placement Funnel (Applied -> Shortlisted -> Interview -> Selected)
  const funnelApplied = applications.length;
  const funnelShortlisted = applications.filter(a => ["shortlisted", "interview_scheduled", "interview_completed", "selected"].includes(a.status)).length;
  const funnelInterview = applications.filter(a => ["interview_scheduled", "interview_completed", "selected"].includes(a.status)).length;
  const funnelSelected = applications.filter(a => a.status === "selected").length;

  // Students needing profile completion (Completeness < 100)
  const incompleteStudents = students
    .filter(s => (s.profileCompleteness || 0) < 100)
    .sort((a, b) => (a.profileCompleteness || 0) - (b.profileCompleteness || 0))
    .slice(0, 5);

  // Top hiring companies
  const companyPlacements: { [key: string]: number } = {};
  applications.forEach(a => {
    if (a.status === "selected" && a.companyName) {
      companyPlacements[a.companyName] = (companyPlacements[a.companyName] || 0) + 1;
    }
  });
  const topHiringCompanies = Object.entries(companyPlacements)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-overview-page">
      
      {/* 1. TOP ROW CARDS (5 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-total-students">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalStudentsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Registrations onboarded</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-verified-students">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verified Profiles</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{verifiedStudentsCount}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
              {totalStudentsCount > 0 ? Math.round((verifiedStudentsCount / totalStudentsCount) * 100) : 0}% Clearance rate
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-active-recruiters">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Recruiters</span>
            <div className="p-2 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600 dark:text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeRecruitersCount}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Partner verified firms</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-open-opps">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Open Opportunities</span>
            <div className="p-2 bg-violet-50 dark:bg-violet-950/40 rounded-xl text-violet-600 dark:text-violet-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{openOpportunitiesCount}</span>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 block mt-1">Active drives online</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-pending-v">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-100 bg-amber-600 dark:bg-amber-900/60 text-white px-2 py-0.5 rounded-lg inline-block">{pendingVerificationsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Awaiting review action</span>
          </div>
        </div>
      </div>

      {/* 2. SECOND ROW CARDS (5 Performance Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-applications">
          <div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Applications Submitted</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{totalApplicationsCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Drives candidature records</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-placed">
          <div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Students Placed</span>
            <span className="text-2xl font-black text-green-650 dark:text-green-400 block mt-1">{selectedStudentsCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Successful hires recorded</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-placement-rate">
          <div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Placement Rate</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">{placementRateVal}%</span>
          </div>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-450 block mt-2">Active target quota reached</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-avg-pkg">
          <div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Average Package</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{avgPackageVal} LPA</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Institutional benchmark index</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-card-highest-pkg">
          <div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Highest Package</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{highestPackageVal} LPA</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Top tier offering signed</span>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW WORKSPACES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Column Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Pending Verification Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="dashboard-verifications-section">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Actionable Verification Queue</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Approve pending corporate recruiter and student accounts</p>
              </div>
              <button 
                onClick={() => onNavigateToTab("student_verification")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 hover:underline"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Profiles Queue */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Students Awaiting Clearance</span>
                {pendingStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-3 rounded-lg text-center">No student approvals pending</p>
                ) : (
                  pendingStudents.map(student => (
                    <div key={student.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800/80 flex justify-between items-center">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{student.name}</span>
                        <span className="text-[10px] text-slate-450 block">{student.branch} • CGPA: {student.cgpa}</span>
                      </div>
                      <button 
                        onClick={() => onReviewStudent(student)}
                        className="bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Review
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Recruiter Profiles Queue */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Recruiters Awaiting Approval</span>
                {pendingRecruiters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-3 rounded-lg text-center">No recruiter approvals pending</p>
                ) : (
                  pendingRecruiters.map(recruiter => (
                    <div key={recruiter.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800/80 flex justify-between items-center">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recruiter.name}</span>
                        <span className="text-[10px] text-slate-450 block truncate">{recruiter.website || "No URL provided"}</span>
                      </div>
                      <div className="flex space-x-1 shrink-0">
                        <button 
                          onClick={() => onVerifyRecruiter(recruiter.id, "approve")}
                          className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 transition"
                          title="Verify company"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onVerifyRecruiter(recruiter.id, "reject")}
                          className="bg-rose-600 text-white p-1 rounded hover:bg-rose-700 transition"
                          title="Reject request"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Recent Job & Internship Requests */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="dashboard-opportunities-section">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Opportunity Posting Requests</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Corporate vacancies awaiting TPO publication approval</p>
              </div>
              <button 
                onClick={() => onNavigateToTab("jobs_approvals")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 hover:underline"
              >
                <span>Manage Posts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingOpportunities.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-4 rounded-xl text-center">No new placement or internship postings awaiting approval.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOpportunities.map(opp => (
                  <div key={opp.id} className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl border border-slate-150 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{opp.jobRole}</span>
                        <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                          {opp.type || "placement"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-550 block font-medium mt-1">{opp.companyName} • {opp.packageLPA} LPA</span>
                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 italic">Requires CGPA {opp.minimumCgpa} • {opp.branchEligibility.join(", ")}</p>
                    </div>
                    <div className="flex space-x-2 border-t border-slate-205 dark:border-slate-800 pt-2 text-right justify-end">
                      <button 
                        onClick={() => onApproveOpportunity(opp.id, "rejected")}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => onApproveOpportunity(opp.id, "approved")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                      >
                        Approve & Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Placement Funnel Dashboard representation */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="dashboard-funnel-section">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Candidates Conversion Funnel</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500">Track student progress from initial application to final offer selection</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="text-center p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-xl border border-indigo-120/50">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Applied</span>
                <span className="text-2xl font-black text-indigo-600 block mt-1">{funnelApplied}</span>
                <span className="text-[9px] text-slate-450">Initial submissions</span>
              </div>
              <div className="text-center p-3 bg-cyan-50/20 dark:bg-cyan-950/20 rounded-xl border border-cyan-120/50">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Shortlisted</span>
                <span className="text-2xl font-black text-cyan-500 block mt-1">{funnelShortlisted}</span>
                <span className="text-[9px] text-slate-450">
                  {funnelApplied > 0 ? Math.round((funnelShortlisted / funnelApplied) * 100) : 0}% of applied
                </span>
              </div>
              <div className="text-center p-3 bg-violet-50/20 dark:bg-violet-950/20 rounded-xl border border-violet-120/50">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Interview Scheduled</span>
                <span className="text-2xl font-black text-violet-500 block mt-1">{funnelInterview}</span>
                <span className="text-[9px] text-slate-450">
                  {funnelShortlisted > 0 ? Math.round((funnelInterview / funnelShortlisted) * 100) : 0}% conversion
                </span>
              </div>
              <div className="text-center p-3 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-xl border border-emerald-120/50">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Selected (Offers)</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">{funnelSelected}</span>
                <span className="text-[9px] text-slate-450 font-bold text-emerald-500">
                  {funnelApplied > 0 ? Math.round((funnelSelected / funnelApplied) * 100) : 0}% Selection rate
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1-Column Section */}
        <div className="space-y-6">
          
          {/* Section 4: Admin Insights Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4" id="dashboard-admin-insights-section">
            <div className="border-b border-slate-850 pb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Administrative Insights</h3>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Executive Controller Metrics</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Insight Stat 1 */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Pending Student Verifications:</span>
                <span className="font-bold font-mono text-amber-400">{students.filter(s => s.verificationStatus === "pending").length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Unverifed Recruiter Signups:</span>
                <span className="font-bold font-mono text-amber-400">{companies.filter(c => !c.isVerified && !c.isApproved).length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Placement Percentage:</span>
                <span className="font-bold font-mono text-indigo-400">{placementRateVal}%</span>
              </div>

              {/* Top hiring list */}
              <div className="border-t border-slate-850 pt-3">
                <span className="text-[9px] font-bold uppercase text-slate-450 tracking-wider block mb-2">Top Hiring Companies</span>
                {topHiringCompanies.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No job selections recorded yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {topHiringCompanies.map((comp, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-slate-350">{comp.name}</span>
                        <span className="font-bold text-white">{comp.count} selects</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Students Needing Profile Completion */}
              <div className="border-t border-slate-850 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold uppercase text-slate-450 tracking-wider block">Profile Completion Gaps</span>
                  <span className="text-[8px] text-amber-400 uppercase tracking-tight">Need 100% Core Verification</span>
                </div>

                {incompleteStudents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">All student profiles are 100% complete.</p>
                ) : (
                  <div className="space-y-2">
                    {incompleteStudents.map(student => (
                      <div key={student.id} className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center justify-between text-[10px]">
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium text-slate-200 truncate block">{student.name}</span>
                            <span className="font-mono text-slate-400 font-bold">{student.profileCompleteness || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${student.profileCompleteness || 10}%` }}></div>
                          </div>
                        </div>
                        <button 
                          onClick={() => sendNotificationReminder(student.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1 rounded-md shrink-0 border border-slate-750"
                          title="Send completion reminder email"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Recent Activities timeline */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="dashboard-activities-section">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Activities History</h3>
            
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4 max-h-56 overflow-y-auto" id="recent-activities-timeline">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recent placement cell activities recorded.</p>
              ) : (
                recentActivities.slice(0,6).map((log) => (
                  <div key={log.id} className="relative text-xs">
                    {/* Circle marker */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-950"></div>
                    
                    <div className="flex justify-between font-bold text-slate-850 dark:text-slate-350">
                      <span>{log.userName} <span className="font-normal text-slate-450">({log.userRole})</span></span>
                      <span className="text-[9px] font-normal text-slate-400 dark:text-slate-550">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">{log.action}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 6: Recent Notifications Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3" id="dashboard-notifications-panel">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">TPO Announcements</h3>
              <button 
                onClick={() => onNavigateToTab("notifications_center")}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Send Broadcast
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800/80">
                <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded tracking-wide">Interview Reminder</span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Google SDE-I Round-1 Virtual Meetings</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Shortlisted students please log in to copy meeting details panels.</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800/80">
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded tracking-wide">Placement Update</span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Cognizant Genc On-Campus Roster compiled</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">52 CSE and IT division students cleared preliminary audits.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
