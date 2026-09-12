/**
 * Cranium Core — Constitutional Layer
 *
 * These principles are non-bypassable. Any transition that would violate them
 * is denied by construction.
 */

export interface ConstitutionalPrinciple {
  readonly id: string;
  readonly name: string;
  readonly category: "GOVERNANCE" | "IMMUNITY" | "AUTHORITY" | "INTEGRITY";
  readonly statement: string;
  readonly enforcement: string;
}

export const CORE_CONSTITUTION: readonly ConstitutionalPrinciple[] = [
  {
    id: "CONST-01",
    name: "Sole Issuance Boundary",
    category: "AUTHORITY",
    statement:
      "Authority is not claimed. It is granted—only through Cranium Core. Cranium Core is the sole authority issuance boundary.",
    enforcement: "No Granted decision may be produced outside AuthorityTransitionEngine.evaluate",
  },
  {
    id: "CONST-02",
    name: "Atomic Authority Invariant",
    category: "GOVERNANCE",
    statement:
      "All authority must be validated, scoped, versioned, and receipted before it becomes effective.",
    enforcement: "STRICT_AUTHORITY_EVALUATION",
  },
  {
    id: "CONST-03",
    name: "Idempotent Replay Boundary",
    category: "IMMUNITY",
    statement:
      "A reused idempotency key with a different canonical hash is rejected as ConflictingReuse.",
    enforcement: "REPLAY_COLLISION_REJECTION",
  },
  {
    id: "CONST-04",
    name: "Version Coherence",
    category: "INTEGRITY",
    statement:
      "A transition request targeting a stale authorityVersion is denied.",
    enforcement: "STATE_VERSION_LOCK",
  },
  {
    id: "CONST-05",
    name: "Evidence Provenance for Elevation",
    category: "AUTHORITY",
    statement:
      "Promotion into FACTUAL or ENTERPRISE authority classes requires verified 256-bit evidence.",
    enforcement: "CRYPTOGRAPHIC_EVIDENCE_REQUIRED",
  },
];
