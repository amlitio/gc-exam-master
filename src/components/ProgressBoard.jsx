import React, { useEffect, useState } from "react";
import { loadProgress } from "../storage.js";
import { DOMAIN_LABELS, DOMAIN_WEIGHTS } from "../weights.js";
import { TrendingUp } from "lucide-react";

export const ProgressBoard = () => {
  const [data, setData] = useState(loadProgress());
  useEffect(()=>{
    const i = setInterval(()=>setData(loadProgress()), 800);
    return ()=>clearInterval(i);
  }, []);

  const domains = Object.keys(DOMAIN_LABELS);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-slate-700"/>
          <h3 className="text-lg font-bold">Mastery Dashboard</h3>
        </div>
        <div className="space-y-4">
          {domains.map(d => {
            const stats = data[d] || {seen:0, correct:0, pct:0};
            return (
              <div key={d}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="font-medium">{DOMAIN_LABELS[d]}</div>
                  <div className="text-slate-500">{stats.pct}% • {stats.correct}/{stats.seen} correct • Weight {DOMAIN_WEIGHTS[d]}%</div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded">
                  <div className="h-2 bg-yellow-500 rounded" style={{width:`${stats.pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
