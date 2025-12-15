const LS_KEY = "gc_exam_sr_v1";
const PROGRESS_KEY = "gc_exam_progress_v1";

export const loadSR = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
export const saveSR = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

export const upsertSR = (id, updater) => {
  const store = loadSR();
  store[id] = updater(store[id]);
  saveSR(store);
  return store[id];
};

export const markResult = (id, correct, domain) => {
  const now = Date.now();
  return upsertSR(id, (prev) => {
    const rec = prev ?? {
      box: 1, last: 0, ease: 2.5, interval: 0, due: now, seen: 0, correct: 0, domain
    };
    rec.seen += 1;
    if (correct) rec.correct += 1;

    if (correct) {
      rec.box = Math.min(rec.box + 1, 5);
      rec.ease = Math.min(rec.ease + 0.1, 3.0);
      const days = [0,1,2,4,7,14][rec.box] || 1;
      rec.interval = days;
    } else {
      rec.box = 1;
      rec.ease = Math.max(rec.ease - 0.2, 1.3);
      rec.interval = 1;
    }
    rec.last = now;
    rec.due = now + rec.interval*24*60*60*1000;
    if (domain && !rec.domain) rec.domain = domain;
    return rec;
  });
};

export const loadProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
export const bumpProgress = (domain, correct) => {
  const prog = loadProgress();
  const d = prog[domain] ?? { seen: 0, correct: 0, pct: 0 };
  d.seen += 1;
  if (correct) d.correct += 1;
  d.pct = d.seen ? Math.round((d.correct / d.seen) * 100) : 0;
  prog[domain] = d;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  return prog;
};
