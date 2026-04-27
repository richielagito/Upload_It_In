const { performance } = require('perf_hooks');

const N = 10000; // assignments
const M = 10000; // results

const assignments = Array.from({ length: N }, (_, i) => ({ id: i, name: `Ass ${i}` }));
const myResults = Array.from({ length: M }, (_, i) => ({ assignment_id: i, result: `Res ${i}` }));

// Baseline
const startBaseline = performance.now();
const mappedBaseline = assignments.map(ass => {
    const result = myResults.find(r => r.assignment_id === ass.id);
    return { ...ass, result };
});
const endBaseline = performance.now();
console.log(`Baseline (find inside map): ${(endBaseline - startBaseline).toFixed(2)} ms`);

// Optimized
const startOptimized = performance.now();
const myResultsMap = new Map(myResults.map(r => [r.assignment_id, r]));
const mappedOptimized = assignments.map(ass => {
    const result = myResultsMap.get(ass.id);
    return { ...ass, result };
});
const endOptimized = performance.now();
console.log(`Optimized (Map.get): ${(endOptimized - startOptimized).toFixed(2)} ms`);
