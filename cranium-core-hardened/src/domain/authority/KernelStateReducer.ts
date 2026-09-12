/**
 * Cranium Core — Kernel State Reducer
 *
 * Applies a transition immutably.
 * Denied transitions never mutate authority.
 * Only Granted transitions that pass all checks advance authorityVersion.
 */

import { AuthorityTransition, AuthorityTransitionRequest, TransitionDecision } from "./types.js";
import { KernelState, ThreatAssessment } from "./KernelState.js";
import { CognitiveStatus } from "../cognition/types.js";
import { InMemoryReplayGuard, ReplayStatus } from "./ReplayGuard.js";
import { AuthorityClass } from "./types.js";

export class KernelStateReducer {
  /**
   * Reduce the current state by the given transition.
   * Side-effect: records New transitions into the replay guard.
   */
  static reduce(
    state: KernelState,
    transition: AuthorityTransition,
    replayGuard: InMemoryReplayGuard,
    request: AuthorityTransitionRequest,
    replayStatus: ReplayStatus
  ): KernelState {
    // Record only genuinely new transitions
    if (replayStatus.kind === "New") {
      replayGuard.record(
        request.requestId,
        request.idempotencyKey,
        transition.requestHash,
        transition
      );
    }

    const isDenied = transition.decision.kind === "Denied";

    // Update threat assessment on denial
    let threatAssessment = state.threatAssessment;
    if (isDenied) {
      threatAssessment = this.updateThreatOnDenial(state.threatAssessment, transition);
    }

    // Always append the transition to history (capped)
    const transitions = [transition, ...state.transitions].slice(0, 100);

    if (isDenied) {
      return {
        ...state,
        transitions,
        threatAssessment,
      };
    }

    // Granted path
    const granted = transition.decision as Extract<TransitionDecision, { kind: "Granted" }>;
    const currentAtom = state.atomsById[transition.subjectAtomId];
    if (!currentAtom) {
      // Defensive: should not happen after engine checks
      return { ...state, transitions, threatAssessment };
    }

    const newStatus =
      granted.grantedAuthority.authorityClass === AuthorityClass.FACTUAL ||
      granted.grantedAuthority.authorityClass === AuthorityClass.ENTERPRISE ||
      granted.grantedAuthority.authorityClass === AuthorityClass.SYSTEM
        ? CognitiveStatus.COMMITTED
        : CognitiveStatus.ACTIVE;

    const updatedAtom = {
      ...currentAtom,
      authority: granted.grantedAuthority,
      status: newStatus,
    };

    return {
      ...state,
      authorityVersion: state.authorityVersion + 1,
      atomsById: {
        ...state.atomsById,
        [updatedAtom.id]: updatedAtom,
      },
      transitions,
      threatAssessment,
    };
  }

  private static updateThreatOnDenial(
    current: ThreatAssessment,
    transition: AuthorityTransition
  ): ThreatAssessment {
    const vectors = [...current.suspectedVectors];
    let replayBlocked = current.replayAttemptsBlocked;
    let anomalies = current.boundaryAnomaliesCount + 1;

    for (const v of transition.boundary.violations) {
      if (!vectors.includes(v)) {
        vectors.push(v);
      }
    }

    if (transition.boundary.violations.includes("REPLAY_CONFLICT" as any)) {
      replayBlocked += 1;
    }

    let threatLevel: ThreatAssessment["threatLevel"] = current.threatLevel;
    if (anomalies > 6) {
      threatLevel = "CRITICAL";
    } else if (anomalies > 3 || replayBlocked > 0) {
      threatLevel = "ELEVATED";
    }

    return {
      threatLevel,
      suspectedVectors: vectors,
      replayAttemptsBlocked: replayBlocked,
      boundaryAnomaliesCount: anomalies,
      lastIncidentTimestamp: transition.timestamp,
    };
  }
}
