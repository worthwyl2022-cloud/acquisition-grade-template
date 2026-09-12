/**
 * Adversarial Suite Runner
 */

import { runAdversarialSuite } from "./AdversarialSuite.js";

const { results, finalState } = runAdversarialSuite();

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  CRANIUM CORE — ADVERSARIAL SUITE RESULTS");
console.log("  Authority is not claimed. It is granted—only through Cranium Core.");
console.log("══════════════════════════════════════════════════════════════\n");

let passed = 0;
let failed = 0;

for (const r of results) {
  const status = r.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}  ${r.id}  ${r.name}`);
  console.log(`         Category: ${r.category}`);
  console.log(`         Decision: ${r.actualDecision}`);
  console.log(`         Details:  ${r.details}`);
  console.log();
  if (r.passed) passed++;
  else failed++;
}

console.log("──────────────────────────────────────────────────────────────");
console.log(`Total: ${results.length}   Passed: ${passed}   Failed: ${failed}`);
console.log(`Final Authority Version: ${finalState.authorityVersion}`);
console.log(`Threat Level: ${finalState.threatAssessment.threatLevel}`);
console.log(`Boundary Anomalies: ${finalState.threatAssessment.boundaryAnomaliesCount}`);
console.log("──────────────────────────────────────────────────────────────\n");

if (failed > 0) {
  process.exit(1);
}
