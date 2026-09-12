/**
 * Cranium Core — Bootstrap Initial Kernel State
 */

import { AuthorityClass, AuthorityLevel } from "./types.js";
import { AtomKind, CognitiveAtom, CognitiveStatus } from "../cognition/types.js";
import { CORE_CONSTITUTION } from "../constitution/types.js";
import { createInitialThreatAssessment, KernelState } from "./KernelState.js";

export function createBootstrapState(): KernelState {
  const now = Date.now();

  const atoms: CognitiveAtom[] = [
    {
      id: "atom-dir-001",
      kind: AtomKind.DIRECTIVE,
      status: CognitiveStatus.COMMITTED,
      content: "Authority is not claimed. It is granted—only through Cranium Core.",
      authority: AuthorityLevel.of(AuthorityClass.ENTERPRISE, 0.95),
      provenance: {
        source: "FOUNDATIONAL_CONSTITUTION",
        actor: "FOUNDER_CORE",
        recordedAt: now,
      },
      createdAt: now,
    },
    {
      id: "atom-fact-002",
      kind: AtomKind.FACT,
      status: CognitiveStatus.COMMITTED,
      content: "Cranium Core is the sole authority issuance boundary.",
      authority: AuthorityLevel.of(AuthorityClass.FACTUAL, 0.88),
      provenance: {
        source: "CONSTITUTIONAL_RECORD",
        actor: "FOUNDER_CORE",
        recordedAt: now,
      },
      createdAt: now,
    },
    {
      id: "atom-intent-003",
      kind: AtomKind.INTENT,
      status: CognitiveStatus.ACTIVE,
      content: "Human intention and creative identity are sovereign constraints.",
      authority: AuthorityLevel.of(AuthorityClass.USER, 0.80),
      provenance: {
        source: "USER_DIRECTIVE_SESSION",
        actor: "USER_PRIMARY",
        recordedAt: now,
      },
      createdAt: now,
    },
    {
      id: "atom-hypo-004",
      kind: AtomKind.HYPOTHESIS,
      status: CognitiveStatus.PROVISIONAL,
      content: "A provisional hypothesis requires evidence before promotion.",
      authority: AuthorityLevel.of(AuthorityClass.HYPOTHETICAL, 0.35),
      provenance: {
        source: "ADAPTER_EXPERIMENT",
        actor: "RESEARCH_SUBSTRATE",
        recordedAt: now,
      },
      createdAt: now,
    },
  ];

  const atomsById = Object.fromEntries(atoms.map((a) => [a.id, a]));

  return {
    executionId: `exec_cranium_core_${now}`,
    authorityVersion: 1,
    cognitiveVersion: 1,
    canonVersion: 1,
    atomsById,
    activeAtomIds: atoms.map((a) => a.id),
    transitions: [],
    constitutionalPrinciples: CORE_CONSTITUTION,
    threatAssessment: createInitialThreatAssessment(),
  };
}
