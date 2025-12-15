import { DOMAIN_WEIGHTS } from './weights.js'

export function buildWeightedExam(all, total) {
  const byDomain = {
    A201: [], A401_A701: [], FL_STATUTES: [],
    SCHEDULING: [], ACCOUNTING: [], OSHA: [], ESTIMATING_CONTRACTS: []
  };
  all.forEach(q => byDomain[q.domain]?.push(q));

  const domains = Object.keys(DOMAIN_WEIGHTS);
  const counts = {};
  let assigned = 0;
  domains.forEach(d => {
    const n = Math.max(1, Math.round((DOMAIN_WEIGHTS[d]/100)*total));
    counts[d] = Math.min(n, (byDomain[d] || []).length);
    assigned += counts[d];
  });

  while (assigned > total) {
    const d = domains.sort((a,b)=>counts[b]-counts[a])[0];
    if (counts[d] > 1) { counts[d]--; assigned--; } else break;
  }
  while (assigned < total) {
    const d = domains
      .sort((a,b)=>DOMAIN_WEIGHTS[b]-DOMAIN_WEIGHTS[a])
      .find(x => counts[x] < (byDomain[x] || []).length);
    if (!d) break;
    counts[d]++; assigned++;
  }

  const pick = (arr, n)=>arr.sort(()=>Math.random()-0.5).slice(0,n);
  const selected = [];
  domains.forEach(d => selected.push(...pick(byDomain[d]||[], counts[d])));
  return selected.sort(()=>Math.random()-0.5);
}
