import React, { useEffect, useMemo, useState } from "react";
import { Brain, Clock, Flag, BookOpen, ChevronRight, RotateCcw } from "lucide-react";
import { buildWeightedExam } from "../examBuilder.js";
import { seedFromYourData } from "../questionFactory.js";
import { bumpProgress, markResult } from "../storage.js";
import { DOMAIN_LABELS } from "../weights.js";

export const ExamSimulator = ({ flashcards, lookupData, studyData, total=45, minutes=120 }) => {
  const all = useMemo(()=>seedFromYourData({ flashcards, lookupData, studyData }), [flashcards, lookupData, studyData]);
  const [exam, setExam] = useState([]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [flags, setFlags] = useState({});
  const [endsAt, setEndsAt] = useState(Date.now() + minutes*60*1000);
  const [now, setNow] = useState(Date.now());

  useEffect(()=>{
    setExam(buildWeightedExam(all, total));
    setIdx(0); setSel(null); setScore(0); setDone(false);
    setEndsAt(Date.now() + minutes*60*1000);
    setFlags({});
  }, [all, total, minutes]);

  useEffect(()=>{
    const t = setInterval(()=>setNow(Date.now()), 500);
    return ()=>clearInterval(t);
  }, []);
  const remaining = Math.max(0, endsAt - now);
  useEffect(()=>{
    if (!done && remaining===0) setDone(true);
  }, [remaining, done]);

  useEffect(()=>{
    const handler = (e) => {
      if (done) return;
      const key = e.key.toLowerCase();
      if (["a","b","c","d"].includes(key)) {
        const idxMap = {a:0,b:1,c:2,d:3};
        select(idxMap[key]);
      } else if (key === "n") {
        next();
      } else if (key === "f") {
        toggleFlag();
      }
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  }, [done, idx, sel]);

  const q = exam[idx];
  if (!q) return <div className="text-slate-500">Building exam…</div>;

  const select = (i) => {
    if (sel !== null) return;
    setSel(i);
    const correct = i === q.correctIndex;
    if (correct) setScore(s => s+1);
    markResult(q.id, correct, q.domain);
    bumpProgress(q.domain, correct);
  };

  const next = () => {
    if (idx < exam.length - 1) {
      setIdx(i => i+1);
      setSel(null);
    } else {
      setDone(true);
    }
  };

  const toggleFlag = () => setFlags(prev => ({...prev, [q.id]: !prev[q.id]}));
  const reset = () => {
    setIdx(0); setSel(null); setScore(0); setDone(false);
    setExam(buildWeightedExam(all, total));
    setEndsAt(Date.now() + minutes*60*1000);
    setFlags({});
  };

  const mm = Math.floor(remaining/60000);
  const ss = Math.floor((remaining%60000)/1000);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-sm">Q {idx+1} / {exam.length}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Brain size={16}/><span className="font-mono text-sm">{score}</span></div>
            <div className="flex items-center gap-2"><Clock size={16}/><span className="font-mono text-sm">{mm}:{ss.toString().padStart(2,"0")}</span></div>
          </div>
        </div>

        {!done ? (
          <div className="p-6 md:p-8">
            <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{DOMAIN_LABELS[q.domain]}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">{q.stem}</h3>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const correct = i === q.correctIndex;
                const chosen = sel === i;
                let cls = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                if (sel === null) cls += "border-slate-100 hover:border-blue-200 hover:bg-blue-50";
                else if (correct) cls += "border-green-500 bg-green-50 text-green-800";
                else if (chosen) cls += "border-red-500 bg-red-50 text-red-800";
                else cls += "border-slate-100 opacity-60";
                return (
                  <button key={i} className={cls} onClick={()=>select(i)} disabled={sel!==null}>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 mr-3 rounded-full border-2 flex items-center justify-center text-xs ${
                        sel===null ? 'border-gray-300' :
                        correct ? 'border-green-600 bg-green-600 text-white' :
                        chosen ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'
                      }`}>{String.fromCharCode(65+i)}</div>
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>

            {sel !== null && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-1 flex items-center gap-2"><Brain size={16}/>Explanation</h4>
                <p className="text-blue-800 text-sm">{q.explanation || "Review the referenced section for context."}</p>

                {q.ref && (
                  <div className="mt-3 text-xs text-blue-900 flex items-center gap-2">
                    <BookOpen size={14}/>
                    <span><strong>{q.ref.book}</strong> — {q.ref.section}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button onClick={toggleFlag} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${flags[q.id] ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-slate-200 text-slate-700'} `}>
                    <Flag size={14}/> {flags[q.id] ? "Flagged" : "Flag for Review"}
                  </button>
                  <button onClick={next} className="ml-auto inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md">
                    Next <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 mx-auto flex items-center justify-center mb-4">
              <Brain className="text-yellow-600" size={32}/>
            </div>
            <h3 className="text-2xl font-bold mb-2">Exam Complete</h3>
            <p className="text-slate-600 mb-6">Score: <strong>{score}</strong></p>
            <button onClick={reset} className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-md">
              <RotateCcw size={16}/> New Exam
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
