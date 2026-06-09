import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  BookOpen, 
  Wrench, 
  AlertCircle,
  FileText,
  Clock,
  Edit,
  Trash2,
  XCircle,
  X,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
} from "lucide-react";
import { PlacementDrive } from "../../types";

interface JobManagementProps {
  drives: PlacementDrive[];
  token: string;
  apiBaseUrl: string;
  onRefresh: () => void;
}

const BRANCH_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering"
];

export default function JobManagement({ drives, token, apiBaseUrl, onRefresh }: JobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  // Form States
  const [jobRole, setJobRole] = useState("");
  const [packageLPA, setPackageLPA] = useState<string>("0");
  const [jobDescription, setJobDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [minimumCgpa, setMinimumCgpa] = useState<string>("6.0");
  const [allowedBacklogs, setAllowedBacklogs] = useState<string>("0");
  const [driveDate, setDriveDate] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [type, setType] = useState<"placement" | "internship" | "job">("placement");
  const [location, setLocation] = useState("Remote / On-site");
  const [formStatus, setFormStatus] = useState<"active" | "completed" | "cancelled">("active");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Open creation modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedDriveId(null);
    setJobRole("");
    setPackageLPA("6.0");
    setJobDescription("");
    setSkillsInput("");
    setSelectedBranches(["Computer Science", "Information Technology"]);
    setMinimumCgpa("6.0");
    setAllowedBacklogs("0");
    
    // Set default dates
    const today = new Date();
    const driveD = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks out
    const deadlineD = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);  // 1 week out
    setDriveDate(driveD.toISOString().split("T")[0]);
    setApplicationDeadline(deadlineD.toISOString().split("T")[0]);
    setType("placement");
    setLocation("Campus / Hybrid");
    
    setFormStatus("active");
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (drive: PlacementDrive) => {
    setModalMode("edit");
    setSelectedDriveId(drive.id);
    setJobRole(drive.jobRole);
    setPackageLPA(drive.packageLPA.toString());
    setJobDescription(drive.jobDescription);
    setSkillsInput(drive.skillsRequired.join(", "));
    setSelectedBranches(drive.branchEligibility);
    setMinimumCgpa(drive.minimumCgpa.toString());
    setAllowedBacklogs(drive.allowedBacklogs.toString());
    setDriveDate(drive.driveDate ? drive.driveDate.split("T")[0] : "");
    setApplicationDeadline(drive.applicationDeadline ? drive.applicationDeadline.split("T")[0] : "");
    setType(drive.type || "placement");
    setLocation(drive.location || "Campus / Hybrid");
    setFormStatus(drive.status);
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const handleBranchToggle = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter(b => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  // Create or Update Placement Drive
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    if (selectedBranches.length === 0) {
      setFormError("Kindly choose at least one eligible academic major stream.");
      setFormLoading(false);
      return;
    }

    const payload = {
      jobRole,
      packageLPA: Number(packageLPA),
      branchEligibility: selectedBranches,
      minimumCgpa: Number(minimumCgpa),
      allowedBacklogs: Number(allowedBacklogs),
      jobDescription,
      skillsRequired: skillsInput.split(",").map(s => s.trim()).filter(s => s.length > 0),
      driveDate,
      applicationDeadline,
      type,
      location,
      status: formStatus
    };

    try {
      let url = `${apiBaseUrl}/api/drives`;
      let method = "POST";

      if (modalMode === "edit" && selectedDriveId) {
        url = `${apiBaseUrl}/api/drives/${selectedDriveId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process drive campaign request.");

      setFormSuccess(modalMode === "create" ? "Placement drive campaign published successfully!" : "Drive campaign details updated!");
      onRefresh();
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "An exception occurred during submission.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Placement Drive
  const handleDeleteDrive = async (driveId: string, roleName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the placement drive for "${roleName}"?\nThis will remove all associated student applications.`)) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/drives/${driveId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete drive");

      onRefresh();
    } catch (err: any) {
      alert("Error deleting drive: " + err.message);
    }
  };

  // Quick toggle status between Active and Closed (completed)
  const handleToggleStatus = async (drive: PlacementDrive) => {
    const targetStatus = drive.status === "active" ? "completed" : "active";
    try {
      const res = await fetch(`${apiBaseUrl}/api/drives/${drive.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change drive status");

      onRefresh();
    } catch (err: any) {
      alert("Error changing status: " + err.message);
    }
  };

  const filteredDrives = drives.filter(d => {
    const matchesSearch = d.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="comp-job-subtab">
      
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Career Campaign Postings</h2>
          <p className="text-xs text-slate-500">Edit, close, and publish career drives for qualified candidates</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* FilterDeck row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search job title, skills, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs outline-none"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs outline-none"
          >
            <option value="all">All Postings ({drives.length})</option>
            <option value="active">Active Drives ({drives.filter(d=>d.status==="active").length})</option>
            <option value="completed">Closed Drives ({drives.filter(d=>d.status==="completed").length})</option>
          </select>
        </div>
      </div>

      {/* Roster of drives */}
      {filteredDrives.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-xs">
          No job drives published matching criteria. Launch your first posting above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="recruiter-jobs-racks">
          {filteredDrives.map(drive => (
            <div key={drive.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${drive.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-500 border border-slate-200 dark:border-slate-800"}`}>
                        {drive.status === "active" ? "Active App Window" : "Campaign Closed"}
                      </span>
                      {drive.approvalStatus === 'pending' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-150 flex items-center">
                          <ShieldQuestion className="w-3 h-3 mr-1" />
                          Pending TPO Approval
                        </span>
                      )}
                      {drive.approvalStatus === 'approved' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-150 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          TPO Verified
                        </span>
                      )}
                      {drive.approvalStatus === 'rejected' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-150 flex items-center">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          Rejected
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">{drive.jobRole}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">{drive.companyName}</p>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded capitalize">{drive.type || "placement"}</span>
                    </div>
                  </div>
                  
                  {/* LPA Badge */}
                  <div className="bg-emerald-50/50 border border-emerald-150 px-3 py-1.5 rounded-xl text-center shrink-0">
                    <span className="text-sm font-black text-emerald-600 block">{drive.packageLPA} LPA</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">CTC Range</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-2 pt-1 border-t border-slate-100">
                  {drive.jobDescription}
                </p>

                {/* Requirements metrics checklist */}
                <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-slate-650">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cutoff: <b>{drive.minimumCgpa || "6.0"}+ CGPA</b></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Backlogs Max: <b>{drive.allowedBacklogs ?? 0} allowed</b></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Location: <b>{drive.location || "Hybrid"}</b></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Deadline: <b>{new Date(drive.applicationDeadline).toLocaleDateString()}</b></span>
                  </div>
                </div>

                {/* Eligible disciplines lists */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-450 block font-mono font-bold mb-1 uppercase tracking-wider">Eligible Streams</span>
                  <div className="flex flex-wrap gap-1.5">
                    {drive.branchEligibility.map((br, idx) => (
                      <span key={idx} className="bg-slate-100 border text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {br}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills requirements row */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-450 block font-mono font-bold mb-1 uppercase tracking-wider">Target Tech Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {drive.skillsRequired.map((sk, idx) => (
                      <span key={idx} className="bg-emerald-50/50 border border-emerald-150/40 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action layout */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleToggleStatus(drive)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/60 cursor-pointer transition shrink-0"
                >
                  {drive.status === "active" ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Active (Click Close)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Closed (Re-open)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(drive)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-200 rounded-xl transition cursor-pointer"
                    title="Edit Drive Position Info"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDrive(drive.id, drive.jobRole)}
                    className="p-2 text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 rounded-xl transition cursor-pointer"
                    title="Delete Drive Position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* JOB CREATION / EDITING FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="drive-builder-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-5 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {modalMode === "create" ? "Publish Placement Campaign" : "Revamp Campaign Profile"}
                </h3>
                <p className="text-xs text-slate-500">Provide criteria standards for students of CampusConnect</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 text-xs font-semibold p-3.5 rounded-xl flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Job Designation Role / Title</label>
                  <input 
                    type="text" 
                    required
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. SDE - Backend Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Salary Compensation (LPA)</label>
                  <input 
                    type="number" 
                    required
                    step="0.5"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 12.0"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Minimum CGPA Cutoff</label>
                  <input 
                    type="number" 
                    required
                    step="0.1"
                    min="0"
                    max="10"
                    value={minimumCgpa}
                    onChange={(e) => setMinimumCgpa(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 7.5"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Allowed Active Backlogs Limit</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={allowedBacklogs}
                    onChange={(e) => setAllowedBacklogs(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 0"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Hiring Drive Event Date</label>
                  <input 
                    type="date" 
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Application Registration Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Drive Category / Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  >
                    <option value="placement">Placement (Full-time)</option>
                    <option value="internship">Internship (Summer/Winter)</option>
                    <option value="job">Job / 6-Month Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Work Location</label>
                  <input 
                    type="text" 
                    list="locations-list"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore / Hybrid / Remote"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                  />
                  <datalist id="locations-list">
                    <option value="Hybrid" />
                    <option value="On-site" />
                    <option value="Virtual / Remote" />
                  </datalist>
                </div>
              </div>

              {/* Multi-discipline checkbox selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">Eligible Discipline Branches</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {BRANCH_OPTIONS.map((branch, idx) => (
                    <label key={idx} className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedBranches.includes(branch)}
                        onChange={() => handleBranchToggle(branch)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Skills Profile Required (comma-separated list)</label>
                <input 
                  type="text" 
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. React, Node.js, Express, TypeScript, SQL"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Detailed Description (Role & Outcomes)</label>
                <textarea 
                  required
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Summarize key tasks, job expectations, and candidate support structures..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div>
                  {modalMode === "edit" && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Status:</span>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="p-1 border text-xs rounded bg-white dark:bg-slate-900"
                      >
                        <option value="active">Active Open</option>
                        <option value="completed">Closed Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-slate-100 text-slate-600 dark:text-slate-300 font-bold py-2 px-4 rounded-xl text-xs"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl text-xs shadow-md shadow-emerald-500/10 transition cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? "Publishing drive..." : (modalMode === "create" ? "Publish Opening" : "Update Opening")}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
