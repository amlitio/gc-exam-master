import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { EXAM_DEFAULTS } from "../weights.js";

export const SettingsPanel = ({ onApply }) => {
  const [total, setTotal] = useState(EXAM_DEFAULTS.totalQuestions);
  const [mins, setMins] = useState(EXAM_DEFAULTS.durationMinutes);
  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={18} className="text-slate-700"/>
          <h3 className="text-lg font-bold">Exam Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Total Questions</span>
            <input type="number" className="w-full border rounded px-3 py-2" value={total} min={10} max={120} onChange={e=>setTotal(parseInt(e.target.value||"0",10))}/>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Duration (minutes)</span>
            <input type="number" className="w-full border rounded px-3 py-2" value={mins} min={15} max={240} onChange={e=>setMins(parseInt(e.target.value||"0",10))}/>
          </label>
        </div>
        <div className="mt-4 text-right">
          <button onClick={()=>onApply({total, minutes: mins})} className="bg-slate-900 text-white px-4 py-2 rounded-md">Apply</button>
        </div>
      </div>
    </div>
  );
};
