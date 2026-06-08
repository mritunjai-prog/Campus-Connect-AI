import React, { useState } from "react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  UserCheck, 
  Phone, 
  Globe, 
  FileText, 
  Edit, 
  Save, 
  Info,
  Bell,
  Check
} from "lucide-react";
import { motion } from "motion/react";
import { CompanyProfile, PlacementDrive, Application, Interview, Notification } from "../../types";

interface CompanyDashboardProps {
  profile: CompanyProfile;
  drives: PlacementDrive[];
  applications: Application[];
  interviews: Interview[];
  notifications: Notification[];
  token: string;
  apiBaseUrl: string;
  onRefresh: () => void;
  onMarkNotificationsRead: () => void;
}

export default function CompanyDashboard({
  profile,
  drives,
  applications,
  interviews,
  notifications,
  token,
  apiBaseUrl,
  onRefresh,
  onMarkNotificationsRead
}: CompanyDashboardProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name || "");
  const [editDesc, setEditDesc] = useState(profile.description || "");
  const [editWebsite, setEditWebsite] = useState(profile.website || "");
  const [editContact, setEditContact] = useState(profile.contactPerson || "");
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await fetch(`${apiBaseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          website: editWebsite,
          contactPerson: editContact,
          phone: editPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update company profile");

      setSaveSuccess(true);
      setIsEditingProfile(false);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving profile changes.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Compute metrics
  const activeJobsCount = drives.filter(d => d.status === "active").length;
  const totalApplications = applications.length;
  const shortlistedCount = applications.filter(a => a.status === "shortlisted" || a.status === "interview_scheduled").length;
  const selectedCount = applications.filter(a => a.status === "selected").length;

  const selectionRate = totalApplications > 0 ? Math.round((selectedCount / totalApplications) * 100) : 0;
  const shortlistRate = totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0;

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-6" id="comp-dashboard-subtab">
      
      {/* Top Banner Grid */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-xl" id="dashboard-hero-banner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back, {profile.contactPerson || "Partner Recruiter"} 👋
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Manage your company's career campaigns, schedule interviews, and evaluate students of CampusConnect with AI recruiter tools.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
              <span className="text-2xl font-bold text-white block">{activeJobsCount}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Active Jobs</span>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
              <span className="text-2xl font-bold text-emerald-400 block">{totalApplications}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Applicants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-row">
        {[
          { title: "Total Job Openings", value: drives.length, desc: `${activeJobsCount} active campaigns`, icon: Briefcase, color: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
          { title: "Total Applicants", value: totalApplications, desc: `${shortlistRate}% shortlisted rate`, icon: Users, color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
          { title: "Review Scheduled", value: interviews.filter(i => i.status === "scheduled").length, desc: "Awaiting candidate replies", icon: Calendar, color: "text-orange-500 bg-orange-500/5 border-orange-500/10" },
          { title: "Offers Accepted", value: selectedCount, desc: `${selectionRate}% convert success rate`, icon: UserCheck, color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10" }
        ].map((met, i) => (
          <div key={i} className="premium-card-light p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-display">{met.title}</span>
              <span className="text-3xl font-black text-slate-900 block tracking-tight">{met.value}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight block">{met.desc}</span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${met.color} shrink-0 shadow-sm`}>
              <met.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-center-grid">
        
        {/* Left column: Profile & Alerts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md" id="recruiter-profile-card">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Your Corporate Profile</h3>
                  <p className="text-xs text-slate-500">Update company details visible on campus</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200/70 transition cursor-pointer"
              >
                {isEditingProfile ? "Cancel" : (
                  <>
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modify Profile</span>
                  </>
                )}
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl mb-4 flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Company branding updated successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl mb-4 flex items-center space-x-2.5">
                <Info className="w-4 h-4 text-rose-600" />
                <span>{saveError}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Company Trade Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Google India"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Careers Website</label>
                    <input 
                      type="url" 
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://careers.google.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">HR Lead / Contact Person</label>
                    <input 
                      type="text" 
                      required
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Support Phone No</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 9999999999"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Branding Description</label>
                  <textarea 
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="We build highly tailored cloud infrastructures globally..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveLoading ? "Saving Details..." : "Save Branding Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Corporate Identity</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">{profile.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {profile.website && (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-600 transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Visit Website</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-600">
                  {profile.description || "No corporate writeup has been supplied. Enhance your profile by adding custom descriptions so students know your company mission better."}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Contact Officer</span>
                      <span className="font-bold text-slate-900">{profile.contactPerson || "Not Defined"}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Support Phone</span>
                      <span className="font-bold text-slate-900">{profile.phone || "Not Supplied"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hiring Pipeline funnel tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md" id="hiring-pipeline-funnel">
            <h3 className="font-bold text-slate-900 text-sm mb-4"> Hires Process Pipeline Funnel</h3>
            <div className="flex items-end justify-between gap-1 h-32 pt-6">
              {[
                { label: "Applied", count: totalApplications, pct: 100, color: "bg-blue-600" },
                { label: "Shortlisted", count: applications.filter(a => a.status === "shortlisted").length, pct: totalApplications > 0 ? (applications.filter(a => a.status === "shortlisted").length / totalApplications) * 100 : 0, color: "bg-indigo-600" },
                { label: "Interviewing", count: applications.filter(a => a.status === "interview_scheduled").length, pct: totalApplications > 0 ? (applications.filter(a => a.status === "interview_scheduled").length / totalApplications) * 100 : 0, color: "bg-orange-500" },
                { label: "Selected", count: selectedCount, pct: totalApplications > 0 ? (selectedCount / totalApplications) * 100 : 0, color: "bg-emerald-600" },
                { label: "Rejected", count: applications.filter(a => a.status === "rejected").length, pct: totalApplications > 0 ? (applications.filter(a => a.status === "rejected").length / totalApplications) * 100 : 0, color: "bg-rose-500" }
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute top-0 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none font-mono font-bold">
                    {bar.count} ({Math.round(bar.pct)}%)
                  </div>
                  <div 
                    style={{ height: `${Math.max(8, bar.pct)}%` }} 
                    className={`w-full max-w-[45px] ${bar.color} rounded-t-lg shadow-sm transition-all duration-500`}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 text-center truncate w-full">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Alert Notification Feed (1/3 width) */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col max-h-[500px]" id="recruiter-notifications-box">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm">Corporate Alerts</h3>
              </div>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={onMarkNotificationsRead}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline bg-emerald-50 px-2 py-1 rounded"
                >
                  Clear Unread
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: "360px" }}>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No notifications recorded. Standard application workflows will post alerts.
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-2xl border text-xs leading-relaxed transition ${n.isRead ? "bg-slate-50/50 border-slate-100 text-slate-500" : "bg-emerald-50/20 border-emerald-100 text-slate-800 font-medium"}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold block text-slate-900 text-[11px]">{n.title}</span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
                    <span className="text-[9px] text-slate-400 block mt-1.5 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
