import React from "react";
import { DOMAIN_WEIGHTS, DOMAIN_LABELS } from "../weights.js";
import { CalendarClock } from "lucide-react";

export const StudyPlan = ({ totalMinutes=180 }) => {
  const domains = Object.keys(DOMAIN_WEIGHTS);
  const plan = domains.map(d => ({
    key: d,
    label: DOMAIN_LABELS[d],
    minutes: Math.max(10, Math.round((DOMAIN_WEIGHTS[d]/100)*totalMinutes))
  }));
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock size={18} className="text-slate-700"/>
          <h3 className="text-lg font-bold">Weighted Study Plan ({totalMinutes} min)</h3>
        </div>
        <ul className="space-y-3">
          {plan.map(p=>(
            <li key={p.key} className="flex items-center gap-3">
              <div className="w-28 text-sm text-slate-600">{p.minutes} min</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="h-2 bg-slate-200 rounded">
                  <div className="h-2 bg-slate-900 rounded" style={{width:`${(p.minutes/totalMinutes)*100}%`}}/>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-4">Tip: two cycles/day—morning (fresh recall), evening (spaced reinforcement).</p>
      </div>
    </div>
  );
};
