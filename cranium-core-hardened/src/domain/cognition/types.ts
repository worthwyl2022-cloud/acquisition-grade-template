/**
 * Cranium Core — Cognitive Substrate Types
 */

import { AuthorityLevel } from "../authority/types.js";

export enum AtomKind {
  DIRECTIVE = "DIRECTIVE",
  FACT = "FACT",
  INTENT = "INTENT",
  HYPOTHESIS = "HYPOTHESIS",
  POLICY = "POLICY",
}

export enum CognitiveStatus {
  PROVISIONAL = "PROVISIONAL",
  ACTIVE = "ACTIVE",
  COMMITTED = "COMMITTED",
  SUPERSEDED = "SUPERSEDED",
  QUARANTINED = "QUARANTINED",
}

export interface Provenance {
  readonly source: string;
  readonly actor: string;
  readonly recordedAt: number;
}

export interface CognitiveAtom {
  readonly id: string;
  readonly kind: AtomKind;
  readonly status: CognitiveStatus;
  readonly content: string;
  readonly authority: AuthorityLevel;
  readonly provenance: Provenance;
  readonly createdAt: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Canon Lanes — priority-ordered semantic channels.
 * Higher priority lanes constrain lower ones.
 */
export enum CanonLane {
  SYSTEM_AXIOM = "SYSTEM_AXIOM",         // Highest
  ENTERPRISE_POLICY = "ENTERPRISE_POLICY",
  FACTUAL = "FACTUAL",
  USER_PREFERENCE = "USER_PREFERENCE",
  WORKING_MEMORY = "WORKING_MEMORY",
  HYPOTHETICAL = "HYPOTHETICAL",         // Lowest
}

export const CANON_LANE_PRIORITY: readonly CanonLane[] = [
  CanonLane.SYSTEM_AXIOM,
  CanonLane.ENTERPRISE_POLICY,
  CanonLane.FACTUAL,
  CanonLane.USER_PREFERENCE,
  CanonLane.WORKING_MEMORY,
  CanonLane.HYPOTHETICAL,
];
