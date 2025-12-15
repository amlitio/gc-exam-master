import { DOMAIN_LABELS } from './weights.js'

const uniqueShuffle = (arr) => [...new Set(arr)].sort(()=>Math.random()-0.5);
const pick = (arr, n) => [...arr].sort(()=>Math.random()-0.5).slice(0,n);

export function seedFromYourData({ flashcards, lookupData, studyData }) {
  const items = [];

  lookupData.forEach(group => {
    (group.items||[]).forEach((it, idx) => {
      const trigger = it.trigger || "";
      const src = it.source || "";
      const sec = it.section || "";

      let domain = "A201";
      if (/A401|A701/.test(src)) domain = "A401_A701";
      else if (/FL|Statutes|713|558|489/i.test(src)) domain = "FL_STATUTES";
      else if (/OSHA|1926/i.test(src)) domain = "OSHA";

      const stem = `When a question references "${trigger}", which reference fits best?`;
      const correct = `${src} – ${sec}`;
      const distractors = pick(
        (group.items||[]).filter(x => x !== it).map(x => `${x.source} – ${x.section}`),
        3
      );
      const options = uniqueShuffle([correct, ...distractors]);

      items.push({
        id: `ref-${group.category}-${idx}-${trigger}`,
        domain,
        stem,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `Open-book: ${src}, ${sec} is the correct starting point for "${trigger}".`,
        ref: { book: src, section: sec }
      });
    });
  });

  flashcards.forEach((fc, i) => {
    let domain = "FL_STATUTES";
    if (/A201|Architect|Change|Submittal|Retainage|IDM/i.test(fc.q)) domain = "A201";
    if (/A401|A701|Bid|Flow-Down/i.test(fc.q)) domain = "A401_A701";
    if (/OSHA|Scaffold|Ladder|Fall|Trench/i.test(fc.q)) domain = "OSHA";
    if (/WIP|Balance|Income|Depreciation|Labor Burden/i.test(fc.q)) domain = "ACCOUNTING";
    if (/Float|CPM|Critical Path|LD/i.test(fc.q)) domain = "SCHEDULING";
    if (/Estimate|Unit Price|Lump Sum|GMP/i.test(fc.q)) domain = "ESTIMATING_CONTRACTS";

    const correct = (fc.a||"").trim();
    const distractors = pick(flashcards.filter(x => x !== fc).map(x => x.a), 3);
    const options = uniqueShuffle([correct, ...distractors]);

    items.push({
      id: `fc-${i}`,
      domain,
      stem: fc.q,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `High-yield recall: ${fc.q} → ${correct}.`
    });
  });

  studyData.forEach((section, sIdx) => {
    (section.content||[]).forEach((group, gIdx) => {
      (group.topics||[]).forEach((t, tIdx) => {
        let domain = "A201";
        if (/A401|A701/i.test(section.title)) domain = "A401_A701";
        if (/Florida Statutes|Lien|558|489/i.test(section.title)) domain = "FL_STATUTES";
        if (/Accounting/i.test(section.title)) domain = "ACCOUNTING";
        if (/OSHA/i.test(section.title)) domain = "OSHA";
        if (/Estimating|ECI|Math|Contracts/i.test(section.title)) domain = "ESTIMATING_CONTRACTS";
        if (/Scheduling|Safety/i.test(section.title)) {
          if (/OSHA/i.test(section.title)) domain = "OSHA";
          else domain = "SCHEDULING";
        }

        const stem = `${t.term}: Which statement is most accurate?`;
        const correct = t.detail;
        const pool = (group.topics||[]).filter(x=>x!==t).map(x=>x.detail);
        const options = uniqueShuffle([correct, ...pick(pool.length>=3 ? pool : pool.concat(["(incorrect)"]), 3)]);

        let ref;
        if (/A201|A401|A701/.test(section.title)) {
          ref = { book: "AIA Docs", section: group.subtitle };
        }

        items.push({
          id: `sd-${sIdx}-${gIdx}-${tIdx}`,
          domain,
          stem,
          options,
          correctIndex: options.indexOf(correct),
          explanation: t.examTip ? `Exam tip: ${t.examTip}` : undefined,
          ref
        });
      });
    });
  });

  return items;
}
