const { performance } = require('perf_hooks');

const numAssignments = 1000;
const assignments = Array.from({ length: numAssignments }, (_, i) => ({ id: `id-${i}`, name: `Assignment ${i}` }));

const totalRenders = 100000;
const selectedIdChangeInterval = 50;
const reviewOpenEvery = 3;

// --- Baseline (original branch behavior) ---
// The lookup only happens on renders where review is open.
const startBaseline = performance.now();
let resultBaseline;
for (let i = 0; i < totalRenders; i++) {
    const selectedId = `id-${(numAssignments - 1 - Math.floor(i / selectedIdChangeInterval)) % numAssignments}`;
    const isReviewOpen = i % reviewOpenEvery === 0;

    if (isReviewOpen) {
        resultBaseline = assignments.find(a => a.id === selectedId);
    }
}
const endBaseline = performance.now();

// --- Memoized simulation (closer to React useMemo behavior) ---
// Recompute only when dependencies change, even if the value is only consumed
// when review is open.
const startOptimized = performance.now();
let resultOptimized;
let memoizedSelectedId;
let memoizedAssignments;
let memoizedResult;

for (let i = 0; i < totalRenders; i++) {
    const selectedId = `id-${(numAssignments - 1 - Math.floor(i / selectedIdChangeInterval)) % numAssignments}`;
    const isReviewOpen = i % reviewOpenEvery === 0;

    if (memoizedAssignments !== assignments || memoizedSelectedId !== selectedId) {
        memoizedAssignments = assignments;
        memoizedSelectedId = selectedId;
        memoizedResult = assignments.find(a => a.id === selectedId);
    }

    if (isReviewOpen) {
        resultOptimized = memoizedResult;
    }
}
const endOptimized = performance.now();

console.log(
    `Baseline (find only when review is open): ${(endBaseline - startBaseline).toFixed(2)} ms`
);
console.log(
    `Memoized (recompute on dependency changes, consume when open): ${(endOptimized - startOptimized).toFixed(2)} ms`
);
