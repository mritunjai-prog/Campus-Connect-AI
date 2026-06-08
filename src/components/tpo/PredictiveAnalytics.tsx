import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface PredictiveAnalyticsProps {
  token: string;
  apiBaseUrl: string;
}

export default function PredictiveAnalytics({ token, apiBaseUrl }: PredictiveAnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/ai/predictive-analytics`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load predictive analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [token, apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Gemini AI is analyzing thousands of data points...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-10 bg-slate-100 dark:bg-slate-900 rounded-3xl">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Analysis Failed</h2>
        <p className="text-slate-500">We couldn't generate the predictive models at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Predictive Placement Analytics</h1>
          <p className="text-slate-500 font-medium">Powered by Gemini 1.5 Flash</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Forecasted Placement</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{data.forecastPlacementRate}%</p>
        </motion.div>

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">At-Risk Students</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{data.atRiskStudentsPercentage}%</p>
        </motion.div>

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <Lightbulb className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Top Branch Forecast</h3>
          <p className="text-2xl font-black text-slate-900 dark:text-white truncate" title={data.topPerformingBranch}>{data.topPerformingBranch}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Predicted Growth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
              <AreaChart data={data.growthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="predictedOffers" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOffers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white flex flex-col">
          <h3 className="font-bold flex items-center mb-4 text-indigo-100">
            <Brain className="w-5 h-5 mr-2" /> AI Recommendation
          </h3>
          <div className="flex-1 flex items-center">
            <p className="text-xl font-bold leading-relaxed">"{data.recommendation}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
