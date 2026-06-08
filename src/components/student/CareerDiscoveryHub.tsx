import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Bookmark,
  Calendar,
  X,
  Target,
  ArrowUpRight,
  Cpu,
  Layers,
  GraduationCap,
  Globe,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Info,
  Sliders,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlacementDrive, StudentProfile } from "../../types";

interface CareerDiscoveryHubProps {
  onApply: (driveId: string) => void;
  studentProfile: StudentProfile;
}

type OpportunityTab = 'placement' | 'internship' | 'job';

export const CareerDiscoveryHub: React.FC<CareerDiscoveryHubProps> = ({ onApply, studentProfile }) => {
  const [activeTab, setActiveTab] = useState<OpportunityTab>('placement');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [opportunities, setOpportunities] = useState<PlacementDrive[]>([]);
  const [careerSuggestions, setCareerSuggestions] = useState<string[]>([]);
  
  // Custom Advanced Filters
  const [minLpa, setMinLpa] = useState(0);
  const [locationFilter, setLocationFilter] = useState("All");
  const [isOnlyVerifiedRecruiter, setIsOnlyVerifiedRecruiter] = useState(false);
  const [onlyMyEligibleBranch, setOnlyMyEligibleBranch] = useState(false);
  const [onlyMyCgpaEligible, setOnlyMyCgpaEligible] = useState(false);
  const [onlyMyBacklogEligible, setOnlyMyBacklogEligible] = useState(false);

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const performDiscovery = useCallback(async (query: string, tab: OpportunityTab) => {
    setIsSearching(true);
    try {
      const response = await fetch("/api/opportunities/discover", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("campus_connect_jwt")}`
        },
        body: JSON.stringify({ 
          query,
          filters: { type: tab }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
        setCareerSuggestions(data.careerSuggestions || []);
      }
    } catch (err) {
      console.error("Discovery failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performDiscovery(searchQuery, activeTab);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, performDiscovery]);

  const checkEligibility = (drive: PlacementDrive) => {
    if (drive.source === 'external') return { isEligible: true, reasons: {}, code: 'eligible' };
    
    // 1. TPO Job Drive Verification check is paramount
    const isDriveVerified = drive.approvalStatus === 'approved';
    if (!isDriveVerified) {
       return {
         isEligible: false,
         needsDriveVerification: true,
         code: 'pending_tpo_approval',
         reasons: {
           tpoApproval: { status: false, label: "TPO Drive approval is pending verification" }
         }
       };
    }

    // 2. Student candidate verification check
    const isStudentVerified = studentProfile.verificationStatus === 'verified';
    if (!isStudentVerified) {
       return {
         isEligible: false,
         needsVerification: true,
         code: 'pending_student_verification',
         reasons: {
           verification: { status: false, label: "Your student profile must be verified by university TPO" }
         }
       };
    }

    // 3. GPA, Branch and Backlog criteria checks
    const cgpaOk = studentProfile.cgpa >= drive.minimumCgpa;
    const branchOk = drive.branchEligibility?.length === 0 || drive.branchEligibility?.includes(studentProfile.branch);
    const backlogsOk = studentProfile.backlogs <= drive.allowedBacklogs;
    
    return {
      isEligible: cgpaOk && branchOk && backlogsOk,
      code: (cgpaOk && branchOk && backlogsOk) ? 'eligible' : 'ineligible_match',
      reasons: {
        cgpa: { status: cgpaOk, label: `Required CGPA: ${drive.minimumCgpa} (You: ${studentProfile.cgpa})` },
        branch: { status: branchOk, label: `Target Branch: Eligible for "${studentProfile.branch}"` },
        backlogs: { status: backlogsOk, label: `Allowed Backlogs max: ${drive.allowedBacklogs} (You: ${studentProfile.backlogs})` }
      }
    };
  };

  const locations = ["All", ...Array.from(new Set(opportunities.map(d => d.location)))];

  const seenIds = new Set<string>();
  const filteredOpportunities = opportunities.filter(o => {
    if (!o.id) return true;
    if (seenIds.has(o.id)) return false;
    seenIds.add(o.id);
    // 1. Minimum Salary/Package range limit
    if (minLpa > 0 && o.packageLPA < minLpa) return false;
    // 2. Dedicated location match
    if (locationFilter !== "All" && o.location !== locationFilter) return false;
    // 3. TPO Authorization filter
    if (isOnlyVerifiedRecruiter) {
      const isVerified = o.source === "external" || o.approvalStatus === "approved";
      if (!isVerified) return false;
    }
    // 4. Student Branch eligibilty filter
    if (onlyMyEligibleBranch && o.source !== 'external' && o.branchEligibility && o.branchEligibility.length > 0) {
      if (!o.branchEligibility.includes(studentProfile.branch)) return false;
    }
    // 5. Student Minimum CGPA capability match
    if (onlyMyCgpaEligible && o.source !== 'external' && studentProfile.cgpa < o.minimumCgpa) {
      return false;
    }
    // 6. Backlog limit clearance match
    if (onlyMyBacklogEligible && o.source !== 'external' && studentProfile.backlogs > o.allowedBacklogs) {
      return false;
    }
    return true;
  });

  const activeFiltersCount = 
    (minLpa > 0 ? 1 : 0) + 
    (locationFilter !== "All" ? 1 : 0) + 
    (isOnlyVerifiedRecruiter ? 1 : 0) + 
    (onlyMyEligibleBranch ? 1 : 0) + 
    (onlyMyCgpaEligible ? 1 : 0) + 
    (onlyMyBacklogEligible ? 1 : 0);

  const handleResetFilters = () => {
    setMinLpa(0);
    setLocationFilter("All");
    setIsOnlyVerifiedRecruiter(false);
    setOnlyMyEligibleBranch(false);
    setOnlyMyCgpaEligible(false);
    setOnlyMyBacklogEligible(false);
  };

  const EmptyState = () => (
    <div className="col-span-full py-20 px-10 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
        <Target className="w-10 h-10 text-indigo-500 animate-pulse" />
      </div>
      <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Expand Your Search Scope</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">
        We couldn't find exact match {activeTab}s matching your current toggled filters. Try easing up branch or package constraints.
      </p>
      
      <button 
        onClick={handleResetFilters}
        className="mt-10 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
      >
        Reset Filter Engine
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Smart Search */}
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Next-Gen Discovery</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Opportunities Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Hyper-personalized AI engine matching you with global roles.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-3xl shadow-sm">
            {(['placement', 'internship', 'job'] as OpportunityTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {tab}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Ask AI: "SDE roles in Bangalore for ${studentProfile.branch} students..."`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
            {isSearching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-8 py-5 rounded-[2.5rem] border-2 flex items-center space-x-2 font-black uppercase tracking-widest text-[10px] transition-all relative ${
              showFilters 
                ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Slide-out Advanced Filters Control Panel with Ultimate Custom Toggles */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] gap-8 grid grid-cols-1 md:grid-cols-3 shadow-inner mt-4 overflow-hidden"
            >
              {/* Range Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Minimum Package (LPA)</label>
                <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm">
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={minLpa} 
                    onChange={(e) => setMinLpa(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-black text-indigo-605 dark:text-indigo-400 font-mono w-16 text-right shrink-0">{minLpa} LPA</span>
                </div>
              </div>

              {/* Dropdown Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Location Venue</label>
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold font-mono outline-none dark:text-white transition-all appearance-none shadow-sm cursor-pointer"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc} className="dark:bg-slate-800 font-mono">{loc}</option>
                  ))}
                </select>
              </div>

              {/* TPO Authorization Status Switch */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Verification Status Filter</label>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsOnlyVerifiedRecruiter(false)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      !isOnlyVerifiedRecruiter 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    All Drives
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOnlyVerifiedRecruiter(true)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      isOnlyVerifiedRecruiter 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    TPO Approved
                  </button>
                </div>
              </div>

              {/* Premium Ultimate Student-Specific Filters */}
              <div className="col-span-full border-t border-slate-200/50 dark:border-slate-850 pt-6 mt-2">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide mb-4 px-1 flex items-center">
                   <Sliders className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                   Ultimate Eligibility Filters (Profile Matching & Sync)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Branch Compatibility Match Toggle */}
                    <button
                      onClick={() => setOnlyMyEligibleBranch(!onlyMyEligibleBranch)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all ${
                        onlyMyEligibleBranch 
                          ? "bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200"
                          : "bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {onlyMyEligibleBranch ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                         <p className="text-xs font-black uppercase tracking-tight">Open to My Branch</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">{studentProfile.branch}</p>
                      </div>
                    </button>

                    {/* CGPA Eligibility Match Toggle */}
                    <button
                      onClick={() => setOnlyMyCgpaEligible(!onlyMyCgpaEligible)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all ${
                        onlyMyCgpaEligible 
                          ? "bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200"
                          : "bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {onlyMyCgpaEligible ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                         <p className="text-xs font-black uppercase tracking-tight">Matches My CGPA</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">My CGPA: {studentProfile.cgpa}</p>
                      </div>
                    </button>

                    {/* Backlog Safety Toggle */}
                    <button
                      onClick={() => setOnlyMyBacklogEligible(!onlyMyBacklogEligible)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all ${
                        onlyMyBacklogEligible 
                          ? "bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200"
                          : "bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {onlyMyBacklogEligible ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                         <p className="text-xs font-black uppercase tracking-tight">Backlog Compliant</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">My Backlogs: {studentProfile.backlogs}</p>
                      </div>
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {careerSuggestions.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-wrap items-center gap-2"
           >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 px-1">AI Suggestions:</span>
              {careerSuggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setSearchQuery(s)}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-500/10"
                >
                  {s}
                </button>
              ))}
           </motion.div>
        )}
      </header>

      {/* Discovery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
        <AnimatePresence mode="popLayout">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((drive, idx) => {
              const matchScore = drive.matchPercentage || 0;
              const eligibility = checkEligibility(drive);
              const isSaved = savedIds.includes(drive.id);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  key={drive.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border-b-4 hover:border-indigo-500 relative flex flex-col h-full"
                >
                  {/* Top Badges */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                       <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center relative">
                          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Semantic Match</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{matchScore}%</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       {drive.source === 'external' && (
                         <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center shadow-inner">
                            <Globe className="w-3 h-3 mr-1" />
                            External
                         </div>
                       )}
                       <button 
                        onClick={(e) => { e.stopPropagation(); toggleSave(drive.id); }}
                        className={`p-3 rounded-2xl border transition-all ${
                          isSaved 
                            ? "bg-amber-50 border-amber-200 text-amber-500" 
                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-500 animate-in zoom-in duration-300"
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* TPO DRIVE VERIFICATION HEURISTICS DISPLAY */}
                  {drive.source !== "external" && (
                    <div className="mb-4">
                      {drive.approvalStatus === "approved" ? (
                        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/10 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>✓ TPO Verified & Approved</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-150 dark:border-amber-500/15 rounded-xl text-[10px] font-bold text-amber-750 dark:text-amber-450 shadow-sm animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>⏰ Pending TPO Drive Approval</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Company Info */}
                  <div className="flex items-start space-x-5 mb-8">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center font-black text-slate-400 dark:text-slate-500 text-2xl border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all duration-500 overflow-hidden shrink-0">
                       <span className="group-hover:text-indigo-600 transition-colors uppercase">{drive.companyName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="font-black text-slate-900 dark:text-white text-xl leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">{drive.jobRole}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                         <span className="flex items-center text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                           <Building2 className="w-3 h-3 mr-1.5 text-indigo-500" />
                           {drive.companyName}
                         </span>
                         <span className="flex items-center text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                           <MapPin className="w-3 h-3 mr-1.5 text-rose-500" />
                           {drive.location}
                         </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary / Package Row */}
                  <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Estimate</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                              {drive.packageLPA} {drive.type === 'internship' ? 'K / mo' : 'LPA'}
                           </p>
                        </div>
                        <div className="text-right space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Open Until</p>
                           <p className="text-xs font-black text-rose-500 leading-none font-mono">
                             {new Date(drive.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* AI Reasoning & Skill Gaps */}
                  <div className="space-y-6 mb-10 flex-1">
                    {drive.matchReason && (
                       <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/10">
                          <div className="flex items-center space-x-2 mb-2">
                             <Sparkles className="w-4 h-4 text-indigo-500" />
                             <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Insights</span>
                          </div>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                             "{drive.matchReason}"
                          </p>
                       </div>
                    )}

                    {drive.skillGaps && drive.skillGaps.length > 0 && (
                       <div className="px-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                             <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                             Competency Gaps
                          </p>
                          <div className="flex flex-wrap gap-2">
                             {drive.skillGaps.map(gap => (
                               <span key={gap} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-500/10 rounded-xl text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                  {gap}
                               </span>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    {/* Eligibility & Verification Block */}
                    <div className={`p-5 rounded-[2rem] border-2 transition-all ${
                      eligibility.isEligible 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-500/10' 
                        : eligibility.needsDriveVerification || eligibility.needsVerification 
                          ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-500/10' 
                          : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100/50 dark:border-rose-500/10'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Institutional Guardbook</p>
                        {eligibility.isEligible ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : eligibility.needsDriveVerification || eligibility.needsVerification ? (
                          <Info className="w-4 h-4 text-indigo-500 hover:scale-110 transition-transform" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                      
                      {eligibility.needsDriveVerification ? (
                        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-tight">TPO must verify & approve drive before apply</span>
                        </div>
                      ) : eligibility.needsVerification ? (
                        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
                           <div className="w-2 h-2 rounded-full bg-indigo-550 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-tight">Your student profile pending TPO certification</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(eligibility.reasons).map(([key, item]: [string, any]) => (
                            <div key={key} className="flex items-center space-x-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className={`text-[9px] font-bold ${item.status ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-450'}`}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions with exact conditions matching TPO approvals before Apply Now */}
                  <div className="pt-8 border-t border-slate-50 dark:border-slate-800 mt-auto">
                    {drive.source === 'external' ? (
                       <a 
                          href={drive.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center space-x-3 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95"
                       >
                          <span>Explore on {drive.companyName}</span>
                          <ExternalLink className="w-4 h-4" />
                       </a>
                    ) : (
                      <button 
                        disabled={!eligibility.isEligible}
                        onClick={() => onApply(drive.id)}
                        className={`w-full group/btn py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all font-black uppercase tracking-widest text-xs relative overflow-hidden ${
                          eligibility.isEligible 
                            ? "bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95 cursor-pointer" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        <span>
                          {eligibility.isEligible 
                            ? 'Accelerated Apply' 
                            : eligibility.needsDriveVerification 
                              ? 'Awaiting TPO Drive Approval' 
                              : eligibility.needsVerification 
                                ? 'Verify Profile First' 
                                : 'Academic Criteria Unmatched'}
                        </span>
                        {eligibility.isEligible && <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : !isSearching ? (
            <EmptyState />
          ) : (
            [1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] animate-pulse space-y-6 h-[500px]">
                 <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-1/3" />
                 <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                    <div className="flex-1 space-y-2 py-1">
                       <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                       <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                 </div>
                 <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />
                 <div className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]" />
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
