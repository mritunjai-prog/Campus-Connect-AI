import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ChevronRight,
  SlidersHorizontal,
  Building2,
  GraduationCap,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlacementDrive } from "../../types";

interface OpportunitiesProps {
  drives: PlacementDrive[];
  onApply: (driveId: string) => void;
  studentProfile: any;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({ drives, onApply, studentProfile }) => {
  const [activeType, setActiveType] = useState<'all' | 'placement' | 'internship' | 'job'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [minLpa, setMinLpa] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState("all");

  const branches = ["all", "Computer Science", "Information Technology", "Electronics & Communication", "Electrical", "Mechanical"];

  const seenIds = new Set<string>();
  const filteredDrives = drives.filter(drive => {
    if (!drive.id) return true;
    if (seenIds.has(drive.id)) return false;
    seenIds.add(drive.id);
    const typeMatch = activeType === 'all' || drive.type === activeType;
    const queryMatch = drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const packageMatch = drive.packageLPA >= minLpa;
    const branchMatch = selectedBranch === "all" || (drive.branchEligibility && drive.branchEligibility.includes(selectedBranch));
    
    return typeMatch && queryMatch && packageMatch && branchMatch;
  });

  const getMatchHighlight = (drive: PlacementDrive) => {
    // Simple logic: if skills match or branch matches
    const branchMatch = drive.branchEligibility?.includes(studentProfile.branch);
    const skillMatchCount = drive.skillsRequired?.filter(s => studentProfile.skills?.includes(s)).length || 0;
    
    if (skillMatchCount >= 3 && branchMatch) return { label: "Perfect Match", color: "emerald", value: 95 };
    if (skillMatchCount >= 1 || branchMatch) return { label: "Good Match", color: "blue", value: 75 };
    return { label: "Fair Match", color: "slate", value: 45 };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Career Opportunities</h1>
          <p className="text-slate-500 mt-1">Discover campus placements, internships, and full-time employment roles.</p>
        </div>
        
        <div className="flex flex-wrap items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
          {['all', 'placement', 'internship', 'job'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                activeType === type 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-900 font-bold mb-6">
               <Filter className="w-4 h-4" />
               <span className="text-sm uppercase tracking-widest">Search & Sync</span>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Role, Company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min Package (LPA)</label>
                  <span className="text-sm font-bold text-indigo-600">{minLpa} LPA</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  step="1"
                  value={minLpa}
                  onChange={(e) => setMinLpa(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Branch Focus</label>
                <div className="space-y-2">
                  {branches.slice(0, 4).map(branch => (
                    <button
                      key={branch}
                      onClick={() => setSelectedBranch(branch)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedBranch === branch 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                          : "bg-white border-slate-150 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {branch.charAt(0).toUpperCase() + branch.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <Sparkles className="w-8 h-8 text-indigo-200 mb-4" />
            <h4 className="font-bold text-lg leading-tight mb-2">Automate Applications?</h4>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4">Let our AI agent track your eligibility and auto-apply to relevant drives.</p>
            <button className="w-full bg-white text-indigo-700 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">Enable Copilot</button>
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDrives.length > 0 ? (
                filteredDrives.map((drive, idx) => {
                  const match = getMatchHighlight(drive);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      key={drive.id}
                      className="group premium-card-light p-8 flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 pt-8 pr-8">
                         <div className={`px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                           match.color === 'emerald' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                           match.color === 'blue' ? 'bg-blue-50 border border-blue-100 text-blue-700' :
                           'bg-slate-50 border border-slate-100 text-slate-700'
                         }`}>
                           <Sparkles className={`w-3 h-3 ${
                             match.color === 'emerald' ? 'text-emerald-500' :
                             match.color === 'blue' ? 'text-blue-500' :
                             'text-slate-500'
                           }`} />
                           <span className="text-[10px] font-black uppercase tracking-wider">{match.label}</span>
                         </div>
                      </div>

                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-800 text-xl shadow-inner group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                          {drive.companyName.charAt(0)}
                        </div>
                        <div className="pt-1">
                          <h3 className="font-black text-slate-900 text-lg leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">{drive.jobRole}</h3>
                          <div className="flex items-center text-slate-500 font-bold text-xs space-x-2">
                             <span className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> {drive.companyName}</span>
                             <span>•</span>
                             <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {drive.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-50">
                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stipend / LPA</p>
                           <p className="text-lg font-black text-slate-900">{drive.packageLPA} LPA</p>
                        </div>
                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application Deadline</p>
                           <p className="text-sm font-black text-slate-900">{new Date(drive.applicationDeadline).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Branch Eligibility</p>
                          <div className="flex flex-wrap gap-2">
                            {drive.branchEligibility?.slice(0, 3).map(branch => (
                              <span key={branch} className="px-3 py-1 bg-white border border-slate-150 rounded-xl text-[10px] font-bold text-slate-600">{branch}</span>
                            ))}
                            {drive.branchEligibility && drive.branchEligibility.length > 3 && (
                                <span className="px-3 py-1 bg-white border border-slate-150 rounded-xl text-[10px] font-bold text-slate-400">+{drive.branchEligibility.length - 3}</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Primary Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {drive.skillsRequired?.slice(0, 4).map(skill => (
                              <span key={skill} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-bold text-indigo-600">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button 
                          onClick={() => onApply(drive.id)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <span>Apply for Opportunity</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-32 text-center flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                   <Briefcase className="w-16 h-16 text-slate-200 mb-6" />
                   <h3 className="text-xl font-bold text-slate-800">No matching roles found</h3>
                   <p className="text-slate-500 mt-2 max-w-sm">Adjust your filters or branch focus to see more specialized campus drives.</p>
                   <button 
                    onClick={() => {setSearchQuery(""); setSelectedBranch("all"); setActiveType("all"); setMinLpa(0);}}
                    className="mt-6 text-sm font-bold text-indigo-600 hover:underline"
                   >
                     Reset All Filters
                   </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
