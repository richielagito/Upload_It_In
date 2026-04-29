const { performance } = require('perf_hooks');

const numAssignments = 1000;
const assignments = Array.from({ length: numAssignments }, (_, i) => ({ id: `id-${i}`, name: `Assignment ${i}` }));
const selectedId = `id-${numAssignments - 1}`; // Worst case: last element

// --- Baseline ---
const startBaseline = performance.now();
let resultBaseline;
for (let i = 0; i < 100000; i++) {
    resultBaseline = assignments.find(a => a.id === selectedId);
}
const endBaseline = performance.now();

// --- Optimized (Memoized approach simulation) ---
const startOptimized = performance.now();
let resultOptimized;
// We compute the map once (or in React, useMemo handles caching it or just the found item)
// Here we simulate the useMemo just caching the result:
const cachedResult = assignments.find(a => a.id === selectedId);
for (let i = 0; i < 100000; i++) {
    resultOptimized = cachedResult;
}
const endOptimized = performance.now();


console.log(`Baseline (O(N) search on every render simulation): ${(endBaseline - startBaseline).toFixed(2)} ms`);
console.log(`Optimized (Memoized simulation): ${(endOptimized - startOptimized).toFixed(2)} ms`);
