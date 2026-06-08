import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Layers,
  X,
  PlusCircle,
  Activity
} from "lucide-react";
import { PlacementDrive } from "../../types";

interface RecruiterAndJobDeskProps {
  companies: any[];
  drives: PlacementDrive[];
  onVerifyRecruiter: (recruiterId: string, action: "approve" | "reject" | "request_more_info") => void;
  onApproveOpportunity: (driveId: string, status: 'approved' | 'rejected') => void;
  onCreateDrive: (driveData: any) => void;
  activeView: "recruiters" | "jobs_approvals";
}

export default function RecruiterAndJobDesk({
  companies,
  drives,
  onVerifyRecruiter,
  onApproveOpportunity,
  onCreateDrive,
  activeView
}: RecruiterAndJobDeskProps) {

  // Recruiter Search and filter states
  const [recruiterQuery, setRecruiterQuery] = useState("");
  const [recruiterFilter, setRecruiterFilter] = useState<"all" | "pending" | "verified">("all");
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  // Job Approvals filter states
  const [jobQuery, setJobQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<"all" | "placement" | "internship">("all");
  const [jobApprovalStatus, setJobApprovalStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedJob, setSelectedJob] = useState<PlacementDrive | null>(null);

  // Form states to create custom drive direct from TPO Office (as system admin)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formPkg, setFormPkg] = useState(6.0);
  const [formMinCgpa, setFormMinCgpa] = useState(7.0);
  const [formEligibility, setFormEligibility] = useState("Computer Science, Information Technology");
  const [formSkills, setFormSkills] = useState("SQL, Java, React");
  const [formDeadline, setFormDeadline] = useState("25 July 2026");
  const [formDesc, setFormDesc] = useState("");

  // Recruiter list dynamic filtering
  const filteredRecruiters = companies.filter(company => {
    const nameMatch = company.name?.toLowerCase().includes(recruiterQuery.toLowerCase()) || 
                      company.email?.toLowerCase().includes(recruiterQuery.toLowerCase());
    
    // Check if isApproved / isVerified state matches
    const isVerifiedStatus = company.isVerified || company.isApproved;
    const isPending = !company.isVerified && !company.isApproved;

    const statusMatch = recruiterFilter === "all" ||
                        (recruiterFilter === "pending" && isPending) ||
                        (recruiterFilter === "verified" && isVerifiedStatus);

    return nameMatch && statusMatch;
  });

  // Jobs dynamic filtering
  const filteredJobs = drives.filter(job => {
    const roleMatch = job.jobRole?.toLowerCase().includes(jobQuery.toLowerCase()) || 
                      job.companyName?.toLowerCase().includes(jobQuery.toLowerCase());
    
    const typeMatch = jobTypeFilter === "all" || job.type === jobTypeFilter;
    
    const approvalMatch = jobApprovalStatus === "all" || job.approvalStatus === jobApprovalStatus;

    return roleMatch && typeMatch && approvalMatch;
  });

  const handleLaunchCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateDrive({
      companyName: formCompany,
      jobRole: formRole,
      packageLPA: formPkg,
      minimumCgpa: formMinCgpa,
      branchEligibility: formEligibility.split(",").map(s => s.trim()),
      skillsRequired: formSkills.split(",").map(s => s.trim()),
      applicationDeadline: formDeadline,
      jobDescription: formDesc,
      status: "active",
      approvalStatus: "approved"
    });
    // Reset
    setShowCreateForm(false);
    setFormCompany("");
    setFormRole("");
    setFormDesc("");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="recruiter-and-job-approvals-desk">
      
      {/* RENDER VIEW 1: RECRUITER MANAGEMENT */}
      {activeView === "recruiters" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Corporate Recruiter Directory</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500">Enable portals access, verify recruiter profiles, and evaluate recruiter activity stats</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Recruiter controls options */}
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800">
                <button 
                  onClick={() => setRecruiterFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${recruiterFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setRecruiterFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${recruiterFilter === "pending" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <span>Verification Request</span>
                  <span className="font-bold text-[9px] bg-black/30 text-white px-1 py-0.2 rounded-full">
                    {companies.filter(c => !c.isVerified && !c.isApproved).length}
                  </span>
                </button>
                <button 
                  onClick={() => setRecruiterFilter("verified")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${recruiterFilter === "verified" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Verified List
                </button>
              </div>

              {/* Company search query */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Query corporate name..."
                  value={recruiterQuery}
                  onChange={(e) => setRecruiterQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-indigo-550"
                />
              </div>
            </div>
          </div>

          {/* List layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecruiters.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Building2 className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">No recruiters matched filters</h4>
                <p className="text-xs text-slate-450 mt-1">Refine your query variables or approve pending recruiters.</p>
              </div>
            ) : (
              filteredRecruiters.map(company => {
                const isVerified = company.isVerified || company.isApproved;
                return (
                  <div key={company.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-indigo-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                          isVerified ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {isVerified ? "verified recruiter" : "verification pending"}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{company.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-1">Domain: {company.domain || "Technology Services"}</p>
                      
                      <div className="space-y-1 mt-4 text-[11px] text-slate-450">
                        <div className="flex justify-between">
                          <span>Point of Contact:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{company.contactPerson || "HR Desk"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inquiries:</span>
                          <span className="font-bold text-slate-705 dark:text-slate-350">{company.email || "hrm@company.com"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registered Drives:</span>
                          <span className="font-bold text-indigo-650 dark:text-indigo-400">
                            {drives.filter(d => d.companyName?.toLowerCase() === company.name?.toLowerCase()).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <a 
                        href={company.website || "https://google.com"} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-slate-400 hover:text-indigo-500 font-bold flex items-center space-x-1"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(!company.isVerified && !company.isApproved && company.status !== "verified" && company.status !== "rejected") ? (
                          <>
                            <button 
                              onClick={() => { onVerifyRecruiter(company.id, "approve"); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1 rounded transition"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => onVerifyRecruiter(company.id, "reject")}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] px-2.5 py-1 rounded transition"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => onVerifyRecruiter(company.id, "request_more_info")}
                              className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-[9px] px-2 py-1 rounded transition"
                              title="Request More Information"
                            >
                              Request Info
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-3 py-1 flex items-center space-x-1">
                            {company.status === "verified" || company.isVerified || company.isApproved ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Approved</span>
                              </>
                            ) : company.status === "request_more_info" ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                                <span>Requested Info</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>Rejected</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RENDER VIEW 2: JOB & INTERNSHIP APPROVALS */}
      {activeView === "jobs_approvals" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Job Posts & Internships Panel</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500">Examine requirements criteria, set clearance status, and dispatch drives directly</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Approval category filter */}
              <select
                value={jobApprovalStatus}
                onChange={(e) => setJobApprovalStatus(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none font-bold"
              >
                <option value="pending">Awaiting Approval (Pending)</option>
                <option value="approved">Approved & Active Posts</option>
                <option value="rejected">Rejected Posts Registers</option>
                <option value="all">Every Single Post</option>
              </select>

              {/* Type Category filter */}
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
              >
                <option value="all">All Types</option>
                <option value="placement">Placements Only</option>
                <option value="internship">Internships Only</option>
              </select>

              {/* Launch TPO Direct Create */}
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Direct Vacancy</span>
              </button>
            </div>
          </div>

          {/* Job posts List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">No job posts aligned</h4>
                <p className="text-xs text-slate-450 mt-1">Select a different category filter or adjust search query metrics.</p>
              </div>
            ) : (
              filteredJobs.map(job => {
                const isPending = job.approvalStatus === "pending";
                const isApproved = job.approvalStatus === "approved";
                
                return (
                  <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition duration-150 flex flex-col justify-between" id={`job-card-${job.id}`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{job.jobRole}</h4>
                          <span className="text-[11px] text-slate-500 font-bold block">{job.companyName}</span>
                        </div>

                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border ${
                          isApproved 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40" 
                            : isPending 
                              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40" 
                              : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-850"
                        }`}>
                          {job.approvalStatus || "pending"}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 my-3 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-center border border-slate-100 dark:border-slate-850">
                        <div>
                          <span className="text-[8px] font-bold text-slate-450 uppercase block">Compensation</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">{job.packageLPA} LPA</span>
                        </div>
                        <div className="border-x border-slate-200 dark:border-slate-800">
                          <span className="text-[8px] font-bold text-slate-440 uppercase block">Min CGPA</span>
                          <span className="text-xs font-black text-rose-500 font-mono">{job.minimumCgpa || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-455 uppercase block">Type Offer</span>
                          <span className="text-xs font-black text-indigo-500 uppercase">{job.type || "placement"}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <p><span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Eligibility Streams</span> {Array.isArray(job.branchEligibility) ? job.branchEligibility.join(", ") : String(job.branchEligibility)}</p>
                        <p className="mt-2 text-slate-450 dark:text-slate-450 italic line-clamp-2">{job.jobDescription || "No detailed job profile descriptions provided"}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-110 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-mono">Deadline: {job.applicationDeadline}</span>

                      {isPending ? (
                        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button 
                            onClick={() => { onApproveOpportunity(job.id, "approved"); job.approvalStatus = "approved"; }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold text-white px-3 py-1.5 rounded"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => { onApproveOpportunity(job.id, "rejected"); job.approvalStatus = "rejected"; }}
                            className="bg-rose-600 hover:bg-rose-700 text-[10px] font-bold text-white px-3 py-1.5 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedJob(job)}
                          className="bg-indigo-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg"
                        >
                          Show Full Audit Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* JOBS DETAIL DIALOG MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded block w-fit mb-1">{selectedJob.type} offering details</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedJob.jobRole}</h3>
                <span className="text-xs text-slate-450">{selectedJob.companyName}</span>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Annual Compensation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedJob.packageLPA} LPA Package</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Branches Eligible:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{Array.isArray(selectedJob.branchEligibility) ? selectedJob.branchEligibility.join(", ") : String(selectedJob.branchEligibility)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Detailed JD:</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 bg-slate-55 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg max-h-36 overflow-y-auto italic border border-slate-100 dark:border-slate-850">
                  {selectedJob.jobDescription || "No detailed vacancy description files specified inside database records."}
                </p>
              </div>

              <div className="text-[11px] text-slate-450">
                <p>Deadline Application Onboard: <span className="font-mono font-bold text-rose-500">{selectedJob.applicationDeadline}</span></p>
                <p className="mt-1">Required Skills: <span className="font-bold text-indigo-500">{Array.isArray(selectedJob.skillsRequired) ? selectedJob.skillsRequired.join(", ") : String(selectedJob.skillsRequired)}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DIRECT DRIVE DIALOG MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Direct Officers Drive Post</h3>
                <p className="text-[10px] text-slate-450">Launch verified vacancies directly to students dashboards</p>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchCreateDrive} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Corporate Hiring Enterprise</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Microsoft Corporation"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Job Role / Designation</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Associate Software Engineer - III"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Package (LPA)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={formPkg}
                    onChange={(e) => setFormPkg(parseFloat(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Minimum CGPA</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={formMinCgpa}
                    onChange={(e) => setFormMinCgpa(parseFloat(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Allowed Streams (Comma split)</label>
                <input 
                  type="text" 
                  required
                  value={formEligibility}
                  onChange={(e) => setFormEligibility(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Required Skill Sets (Comma split)</label>
                <input 
                  type="text" 
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Application Deadline Date</label>
                <input 
                  type="text" 
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Detailed Job Description</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Insert core objectives, responsibilities summaries..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="text-xs bg-slate-100 dark:bg-slate-850 text-slate-650 hover:bg-slate-200 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Confirm Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
