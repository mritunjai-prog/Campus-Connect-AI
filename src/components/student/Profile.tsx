import React, { useState } from "react";
import { 
  User, 
  GraduationCap, 
  Award,
  Plus,
  X,
  Save,
  ShieldCheck,
  CheckCircle2,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Star,
  FileText,
  Upload,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentProfile } from "../../types";
import { triggerFileDownload } from "../../utils/download";

interface ProfileProps {
  profile: StudentProfile;
  onUpdate: (data: any) => Promise<void>;
  loading: boolean;
  onUploadResume?: (file: File) => Promise<void>;
  onUploadPhoto?: (file: File) => Promise<void>;
  onSubmitVerification?: () => Promise<void>;
  apiBaseUrl?: string;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, loading, onUploadResume, onUploadPhoto, onSubmitVerification, apiBaseUrl }) => {
  const getPhotoUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `${apiBaseUrl || ""}${url}`;
  };

  const [formData, setFormData] = useState({
    name: profile.name || "",
    enrollmentNumber: profile.enrollmentNumber || "",
    gender: profile.gender || "male",
    dob: profile.dob || "",
    address: profile.address || "",
    collegeEmail: profile.collegeEmail || profile.email || "",
    personalEmail: profile.personalEmail || "",
    phone: profile.phone || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
    portfolioUrl: profile.portfolioUrl || "",
    photoUrl: profile.photoUrl || "",
    
    // Academic
    branch: profile.branch || "Computer Science",
    degree: profile.degree || "B.Tech",
    collegeName: profile.collegeName || "IIT Bombay",
    graduationYear: profile.graduationYear || "2026",
    cgpa: profile.cgpa || 0,
    backlogs: profile.backlogs || 0,
    
    // Schooling
    tenthPercentage: profile.tenthPercentage || 0,
    tenthBoard: profile.tenthBoard || "",
    tenthYear: profile.tenthYear || "",
    twelfthPercentage: profile.twelfthPercentage || 0,
    twelfthBoard: profile.twelfthBoard || "",
    twelfthYear: profile.twelfthYear || "",
    
    // Matrix
    skills: profile.skills || []
  });

  // Sync state when profile prop updates
  React.useEffect(() => {
    setFormData({
      name: profile.name || "",
      enrollmentNumber: profile.enrollmentNumber || "",
      gender: profile.gender || "male",
      dob: profile.dob || "",
      address: profile.address || "",
      collegeEmail: profile.collegeEmail || profile.email || "",
      personalEmail: profile.personalEmail || "",
      phone: profile.phone || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
      photoUrl: profile.photoUrl || "",
      branch: profile.branch || "Computer Science",
      degree: profile.degree || "B.Tech",
      collegeName: profile.collegeName || "IIT Bombay",
      graduationYear: profile.graduationYear || "2026",
      cgpa: profile.cgpa || 0,
      backlogs: profile.backlogs || 0,
      tenthPercentage: profile.tenthPercentage || 0,
      tenthBoard: profile.tenthBoard || "",
      tenthYear: profile.tenthYear || "",
      twelfthPercentage: profile.twelfthPercentage || 0,
      twelfthBoard: profile.twelfthBoard || "",
      twelfthYear: profile.twelfthYear || "",
      skills: profile.skills || []
    });
  }, [profile]);

  const [newSkill, setNewSkill] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");
  const [skillAddedFeedback, setSkillAddedFeedback] = useState(false);

  const branches = ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical", "Mechanical", "Civil", "Chemical"];
  const degrees = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA"];

  const handleAddSkill = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...formData.skills, newSkill.trim()];
      setFormData({ ...formData, skills: updatedSkills });
      setNewSkill("");
      setSkillAddedFeedback(true);
      setTimeout(() => setSkillAddedFeedback(false), 2000);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadResume) {
      onUploadResume(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      onUploadPhoto(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      await onUpdate(formData);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("idle");
    }
  };

  const isVerified = profile.verificationStatus === "verified";
  const isPending = profile.verificationStatus === "pending";
  const isCompleted = profile.profileCompleteness >= 100;

  const lastSavedDate = profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Professional Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your identity to unlock premium recruitment opportunities.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Profile Progress</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{profile.profileCompleteness}% Complete</span>
          </div>
          {isCompleted && !isVerified && !isPending && (
            <button
              type="button"
              onClick={onSubmitVerification}
              className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 dark:shadow-none transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
            >
              Verify Now
            </button>
          )}
            <div className={`flex items-center px-5 py-2.5 rounded-2xl border ${
            isVerified 
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : isPending
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                : "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400"
          }`}>
            <ShieldCheck className={`w-5 h-5 mr-2 ${isVerified ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-rose-600'}`} />
            <span className="text-sm font-bold uppercase tracking-tight">
              {isVerified ? "Verified" : isPending ? "Pending Approval 🟡" : "Unverified"}
            </span>
          </div>
        </div>
      </header>

      {profile.verificationStatus === "rejected" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-rose-50/50 dark:bg-rose-950/15 border-2 border-rose-100 dark:border-rose-900/30 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-450 shrink-0">
            <X className="w-6 h-6 text-rose-650" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold tracking-tight text-rose-850 dark:text-rose-400 leading-tight text-base">Verification Request Rejected by TPO</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-rose-350 leading-relaxed">
              Comments: {profile.feedback || "Please correct your profile entries, ensure your tenth/twelfth data are fully complete, double check enrollment ID format, and click 'Verify Now' again."}
            </p>
          </div>
        </motion.div>
      )}

      {profile.verificationStatus === "verified" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-emerald-50/50 dark:bg-emerald-950/15 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-emerald-850 dark:text-emerald-400 tracking-tight leading-tight text-base">Institutional Portfolio Verified</h3>
            <p className="text-sm font-medium text-slate-605 dark:text-emerald-350 leading-relaxed">
              Your profile is verified by the TPO. You can now apply directly to active placement drives and internships.
            </p>
          </div>
        </motion.div>
      )}

      {profile.verificationStatus === "pending" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-amber-50/50 dark:bg-amber-950/15 border-2 border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start space-x-4 shadow-sm"
        >
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-amber-850 dark:text-amber-400 tracking-tight leading-tight text-base">Pending Institutional Verification</h3>
            <p className="text-sm font-medium text-slate-605 dark:text-amber-350 leading-relaxed">
              Your profile verification request was successfully dispatched to the TPO and is currently in progress. Restrictive hub features will unlock upon approval.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Section 1: Personal Details */}
          <div className="premium-card-light p-8 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Profile Photo Upload */}
              <div className="relative group/photo shrink-0">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-900 overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover/photo:border-indigo-500 transition-all flex items-center justify-center relative">
                  {profile.photoUrl ? (
                    <img src={getPhotoUrl(profile.photoUrl)} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-center space-y-1">
                      <User className="w-8 h-8 text-slate-400 mx-auto" />
                      <span className="text-[8px] font-black uppercase text-slate-400 block px-2 leading-tight">Professional Photo</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    title="Upload Professional Profile Photo"
                  />
                </div>
                {profile.photoUrl && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white dark:border-slate-800">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Personal Identity</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Basic contact and identification details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <div className="md:col-span-2 lg:col-span-4">
                <Input label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} icon={<User className="w-4 h-4" />} />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <Input label="Enrollment ID" value={formData.enrollmentNumber} onChange={v => setFormData({...formData, enrollmentNumber: v})} icon={<Award className="w-4 h-4" />} />
              </div>

              {/* Spacious, Dedicated Row for Email Options and Mobile Number */}
              <div className="md:col-span-2 lg:col-span-3">
                <Input label="College Email" value={formData.collegeEmail} onChange={v => setFormData({...formData, collegeEmail: v})} icon={<Mail className="w-4 h-4" />} />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Input label="Personal Email" value={formData.personalEmail} onChange={v => setFormData({...formData, personalEmail: v})} icon={<Mail className="w-4 h-4" />} />
              </div>

              <div className="md:col-span-1 lg:col-span-2">
                <Input label="Mobile Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} icon={<Phone className="w-4 h-4" />} />
              </div>
              
              <div className="space-y-2 md:col-span-1 lg:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {["male", "female", "other"].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all ${
                        formData.gender === g 
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <Input label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({...formData, dob: v})} icon={<Calendar className="w-4 h-4" />} />
              </div>
              <div className="md:col-span-2 lg:col-span-6">
                <Input label="Home Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} icon={<MapPin className="w-4 h-4" />} />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1 flex items-center">
                 Professional Links
                 <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-700 ml-4" />
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <Input label="LinkedIn Profile" value={formData.linkedinUrl} onChange={v => setFormData({...formData, linkedinUrl: v})} icon={<Linkedin className="w-4 h-4" />} />
                 <Input label="GitHub Profile" value={formData.githubUrl} onChange={v => setFormData({...formData, githubUrl: v})} icon={<Github className="w-4 h-4" />} />
                 <Input label="Portfolio / Website" value={formData.portfolioUrl} onChange={v => setFormData({...formData, portfolioUrl: v})} icon={<Globe className="w-4 h-4" />} />
               </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div className="premium-card-light p-8 md:p-10 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Academic Records</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Educational background and performance metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Degree Type</label>
                <select 
                  value={formData.degree} 
                  onChange={e => setFormData({...formData, degree: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
                >
                  {degrees.map(d => <option key={d} value={d} className="dark:bg-slate-800">{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch / Major</label>
                <select 
                  value={formData.branch} 
                  onChange={e => setFormData({...formData, branch: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
                >
                  {branches.map(b => <option key={b} value={b} className="dark:bg-slate-800">{b}</option>)}
                </select>
              </div>
              <Input label="College / University" value={formData.collegeName} onChange={v => setFormData({...formData, collegeName: v})} />
              <Input label="Graduation Year" value={formData.graduationYear} onChange={v => setFormData({...formData, graduationYear: v})} />
              <Input label="Current CGPA" type="number" step="0.01" value={formData.cgpa} onChange={v => setFormData({...formData, cgpa: Number(v)})} />
              <Input label="Active Backlogs" type="number" value={formData.backlogs} onChange={v => setFormData({...formData, backlogs: Number(v)})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-700">
               <div className="space-y-6">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                   Secondary Education (10th)
                   <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-700 ml-4" />
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                   <Input label="Percentage (%)" type="number" value={formData.tenthPercentage} onChange={v => setFormData({...formData, tenthPercentage: Number(v)})} />
                   <Input label="Board Name" placeholder="CBSE/ICSE/SEB" value={formData.tenthBoard} onChange={v => setFormData({...formData, tenthBoard: v})} />
                   <div className="col-span-2">
                    <Input label="Year of Completion" value={formData.tenthYear} onChange={v => setFormData({...formData, tenthYear: v})} />
                   </div>
                 </div>
               </div>
               <div className="space-y-6">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                   Senior Secondary (12th)
                   <div className="h-[1px] flex-1 bg-slate-100 dark:border-slate-700 ml-4" />
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                   <Input label="Percentage (%)" type="number" value={formData.twelfthPercentage} onChange={v => setFormData({...formData, twelfthPercentage: Number(v)})} />
                   <Input label="Board Name" placeholder="CBSE/ICSE/SEB" value={formData.twelfthBoard} onChange={v => setFormData({...formData, twelfthBoard: v})} />
                   <div className="col-span-2">
                    <Input label="Year of Completion" value={formData.twelfthYear} onChange={v => setFormData({...formData, twelfthYear: v})} />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills Matrix & Resume */}
        <div className="space-y-8">
          {/* Matrix Section */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-sm flex flex-col space-y-8 h-full">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase">Skills Matrix</h3>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg font-black text-slate-500 uppercase tracking-tight">
                  {formData.skills.length}
                </span>
              </div>
              
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Type a skill and press enter..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[11px] font-bold focus:border-indigo-500 outline-none transition-all dark:text-white shadow-inner"
                />
                <button 
                  type="button" 
                  onClick={() => handleAddSkill()}
                  className="absolute right-1 top-1 p-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {skillAddedFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -5 }}
                      className="absolute -top-8 left-0 bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg flex items-center space-x-1.5 z-10"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Skill Added!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2 min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                {formData.skills.map(s => (
                  <div key={s} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl group transition-all hover:border-indigo-300 dark:hover:border-indigo-500">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{s}</span>
                    <button 
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <div className="py-12 text-center space-y-3">
                    <Star className="w-8 h-8 text-slate-200 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase italic block">Add skills in the main panel</span>
                  </div>
                )}
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase">Resume Document</h3>
              </div>
              
              <div className="flex justify-between items-center px-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Document Integrity</span>
                 <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              
              <div className="relative group/upload">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-center space-y-3 group-hover/upload:bg-indigo-50/30 dark:group-hover/upload:bg-indigo-900/10">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto group-hover/upload:text-indigo-500 transition-colors" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Resume</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">PDF, DOCX allowed</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group/file">
                 <div className="flex items-center space-x-3 truncate">
                   <FileText className="w-5 h-5 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">{profile.resumeFileName || "No active resume"}</span>
                 </div>
                 {profile.resumeUrl && (
                    <button 
                      type="button"
                      onClick={() => triggerFileDownload(profile.resumeUrl, profile.resumeFileName || "resume.pdf")}
                      className="p-2 bg-white dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-slate-400 hover:text-white rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer flex items-center justify-center"
                      title="Download Resume"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button" 
                  onClick={handleSubmit}
                  disabled={saveStatus === "saving" || loading}
                  className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3 shadow-xl active:scale-95 ${
                    saveStatus === "success" 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white shadow-indigo-600/20 dark:shadow-none"
                  }`}
               >
                 {saveStatus === "saving" ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : saveStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                 ) : (
                    <Save className="w-4 h-4" />
                 )}
                 <span>{saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Sync Profile"}</span>
               </button>
               {lastSavedDate && (
                  <p className="text-[10px] text-center text-slate-500 font-bold mt-3 uppercase tracking-widest">Last Saved: {lastSavedDate}</p>
               )}
               <p className="text-[9px] text-center text-slate-400 font-bold mt-4 uppercase tracking-tighter">Your data is secured with AES-256 Cloud Encryption.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", icon, placeholder, step, min, max }: any) => {
  const handleChange = (val: string) => {
    if (type === "number") {
      const numValue = parseFloat(val);
      if (isNaN(numValue)) {
        onChange(0);
        return;
      }
      if (min !== undefined && numValue < min) {
        onChange(min);
        return;
      }
      if (max !== undefined && numValue > max) {
        onChange(max);
        return;
      }
      onChange(numValue);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 group-focus-within:text-indigo-500 transition-colors">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>}
        <input 
          type={type === "number" ? "text" : type} 
          value={value} 
          placeholder={placeholder}
          onChange={e => handleChange(e.target.value)}
          className={`w-full ${icon ? "pl-12" : "px-5"} py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all`}
        />
      </div>
    </div>
  );
};

const Chip = ({ label, onRemove, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`group flex items-center py-1.5 pl-3 pr-1.5 rounded-xl transition-all border ${
      color === 'indigo' 
        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
        : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-500/10 text-amber-700 dark:text-amber-400"
    }`}
  >
    <span className="text-[10px] font-black uppercase tracking-tight mr-1.5">{label}</span>
    <button 
      type="button"
      onClick={onRemove}
      className={`p-1 rounded-lg transition-colors ${
        color === 'indigo' ? "hover:bg-indigo-500 hover:text-white text-indigo-300" : "hover:bg-amber-500 hover:text-white text-amber-300"
      }`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);
