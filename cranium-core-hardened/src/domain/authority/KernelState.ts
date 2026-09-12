/**
 * Cranium Core — Kernel State
 *
 * Immutable snapshot of the authority and cognitive substrate.
 */

import { AuthorityTransition } from "./types.js";
import { CognitiveAtom } from "../cognition/types.js";
import { ConstitutionalPrinciple } from "../constitution/types.js";

export interface ThreatAssessment {
  readonly threatLevel: "NOMINAL" | "ELEVATED" | "CRITICAL";
  readonly suspectedVectors: readonly string[];
  readonly replayAttemptsBlocked: number;
  readonly boundaryAnomaliesCount: number;
  readonly lastIncidentTimestamp: number | null;
}

export interface KernelState {
  readonly executionId: string;
  readonly authorityVersion: number;
  readonly cognitiveVersion: number;
  readonly canonVersion: number;
  readonly atomsById: Readonly<Record<string, CognitiveAtom>>;
  readonly activeAtomIds: readonly string[];
  readonly transitions: readonly AuthorityTransition[];
  readonly constitutionalPrinciples: readonly ConstitutionalPrinciple[];
  readonly threatAssessment: ThreatAssessment;
}

export function createInitialThreatAssessment(): ThreatAssessment {
  return {
    threatLevel: "NOMINAL",
    suspectedVectors: [],
    replayAttemptsBlocked: 0,
    boundaryAnomaliesCount: 0,
    lastIncidentTimestamp: null,
  };
}
