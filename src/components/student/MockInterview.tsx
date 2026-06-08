import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Mic, 
  Send, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  History,
  Play,
  RefreshCw,
  MessageSquareQuote,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MockInterviewProps {
  onStart: (role: string, difficulty: string) => Promise<void>;
  onSubmitAnswer: (answer: string) => Promise<void>;
  isGenerating: boolean;
  isEvaluating: boolean;
  phase: "init" | "ongoing" | "result";
  questions: string[];
  currentIndex: number;
  evaluation: { score: number; feedback: string; strengths: string[]; gaps: string[] } | null;
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  onStart,
  onSubmitAnswer,
  isGenerating,
  isEvaluating,
  phase,
  questions,
  currentIndex,
  evaluation
}) => {
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [currentAnswer, setCurrentAnswer] = useState("");

  const roles = [
    "Software Engineer", 
    "Frontend Developer", 
    "Backend Developer", 
    "Data Scientist", 
    "Product Manager", 
    "System Architect"
  ];

  const handleNext = () => {
    if (currentAnswer.trim()) {
      onSubmitAnswer(currentAnswer);
      setCurrentAnswer("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Mock Interview Cockpit</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Realistic recruitment simulation with real-time feedback loop.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Cognitive Session Active</span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "init" ? (
          <motion.div 
            key="init"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                  <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">Configure Simulation</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Target Designation</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roles.map(r => (
                      <button 
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border text-center ${role === r ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Evaluation Complexity</label>
                  <div className="flex space-x-3">
                    {["Easy", "Medium", "Hard"].map(lv => (
                       <button 
                        key={lv}
                        onClick={() => setDifficulty(lv)}
                        className={`flex-1 px-4 py-3 rounded-2xl text-xs font-bold transition-all border text-center ${difficulty === lv ? "bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white shadow-lg" : "bg-slate-50 dark:bg-slate-900/50 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"}`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => onStart(role, difficulty)}
                  disabled={isGenerating}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center space-x-3"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>{isGenerating ? "Synthesizing Session..." : "Initialize Simulation"}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <div className="bg-slate-900 text-white border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="w-16 h-16 text-indigo-500/10 rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <History className="w-8 h-8 text-indigo-400 mb-6" />
                    <h3 className="text-xl font-bold mb-4 tracking-tight">Preparation Guide</h3>
                    <div className="space-y-4 flex-1">
                       {[
                         "Ensure your audio input is stable",
                         "Keep technical definitions concise",
                         "AI evaluates communication style",
                         "Cite real project experiences"
                       ].map((tip, i) => (
                         <div key={i} className="flex items-start space-x-3 text-slate-400">
                           <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                             <span className="text-[10px] font-bold">{i+1}</span>
                           </div>
                           <span className="text-sm font-medium">{tip}</span>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : phase === "ongoing" ? (
          <motion.div 
            key="ongoing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
                     </div>
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recruiter Query {currentIndex + 1} of {questions.length}</span>
                  </div>
                  <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight italic">
                    "{questions[currentIndex]}"
                  </h3>
                  <div className="flex items-center space-x-4 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 w-fit">
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Agent Listening...</span>
                  </div>
               </div>

               <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                        <Mic className="w-3.5 h-3.5 mr-1.5" /> Transcribe Response
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Type or Use Speech Recognition</span>
                  </div>
                  <textarea 
                    autoFocus
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    rows={6}
                    placeholder="Provide your professional response here..."
                    className="w-full px-8 py-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm md:text-base font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner leading-relaxed"
                  />
               </div>

               <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleNext}
                    disabled={!currentAnswer.trim()}
                    className="group bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-3xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] flex items-center space-x-3"
                  >
                    <span>{currentIndex + 1 === questions.length ? "Compile Results" : "Proceed to Next"}</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {isEvaluating ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-6 bg-white border border-slate-200 rounded-[3rem] shadow-sm">
                 <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">Quantifying Performance</h3>
                    <p className="text-slate-500 font-medium mt-1">Our AI Recruiter is assessing your architectural depth and communication score...</p>
                 </div>
              </div>
            ) : evaluation ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 border-b border-slate-100 pb-10">
                       <div className="relative">
                          <svg className="w-48 h-48 transform -rotate-90">
                              <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="16" className="text-slate-100" />
                              <motion.circle 
                                  initial={{ strokeDashoffset: 553 }}
                                  animate={{ strokeDashoffset: 553 - (553 * evaluation.score) / 100 }}
                                  cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="16" 
                                  strokeDasharray="553"
                                  className="text-indigo-600 transition-all duration-1500 ease-out" 
                              />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                              <span className="text-5xl font-black text-slate-900 leading-none">{evaluation.score}</span>
                              <span className="text-[11px] block font-black text-slate-400 uppercase tracking-widest mt-1">Agg Score</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="p-2 bg-indigo-50 rounded-xl w-fit">
                             <Trophy className="w-8 h-8 text-indigo-600" />
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Simulation Final Analysis</h3>
                          <p className="text-slate-500 font-medium italic leading-relaxed text-lg">"{evaluation.feedback}"</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
                       <div className="space-y-6">
                          <div className="flex items-center space-x-3 text-emerald-600">
                             <CheckCircle2 className="w-5 h-5" />
                             <span className="text-xs font-black uppercase tracking-widest">Cognitive Strengths</span>
                          </div>
                          <ul className="space-y-3">
                             {evaluation.strengths.map((s, i) => (
                               <li key={i} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-sm font-bold text-emerald-800 leading-tight">{s}</li>
                             ))}
                          </ul>
                       </div>
                       <div className="space-y-6">
                          <div className="flex items-center space-x-3 text-rose-600">
                             <AlertCircle className="w-5 h-5" />
                             <span className="text-xs font-black uppercase tracking-widest">Skill Optimizations</span>
                          </div>
                          <ul className="space-y-3">
                             {evaluation.gaps.map((s, i) => (
                               <li key={i} className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-sm font-bold text-rose-800 leading-tight">{s}</li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    <div className="pt-10 flex justify-center">
                        <button 
                            onClick={() => window.location.reload()} // Simplified reset for now
                            className="px-10 py-5 bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-3xl transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            Return to Selection
                        </button>
                    </div>
                 </div>

                 <div className="bg-indigo-600 text-white border border-indigo-700 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden h-full">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <h4 className="text-2xl font-black mb-6 tracking-tight">AI Interviewer Insight</h4>
                    <div className="space-y-8 relative z-10">
                       <p className="text-indigo-100 text-sm leading-relaxed font-medium">Your tone analysis suggests a confident profile, however architectural trade-offs could be detailed more with numeric metrics.</p>
                       <div className="bg-indigo-700/50 p-6 rounded-[2.5rem] border border-indigo-500/50">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Technical Depth</span>
                             <span className="text-sm font-bold">88%</span>
                          </div>
                          <div className="w-full bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-white h-full rounded-full" style={{ width: "88%" }}></div>
                          </div>
                       </div>
                       <div className="bg-indigo-700/50 p-6 rounded-[2.5rem] border border-indigo-500/50">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Comm Score</span>
                             <span className="text-sm font-bold">92%</span>
                          </div>
                          <div className="w-full bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-white h-full rounded-full" style={{ width: "92%" }}></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
