/**
 * Cranium Core — Authority Transition Engine
 *
 * THE SOLE AUTHORITY ISSUANCE BOUNDARY.
 *
 * Authority is not claimed. It is granted—only through Cranium Core.
 * This engine is the only component permitted to produce a Granted decision.
 */

import { randomUUID } from "crypto";
import {
  AuthorityTransition,
  AuthorityTransitionRequest,
  BoundaryAssessment,
  BoundaryViolation,
  RequestHash,
  TransitionDecision,
} from "./types.js";
import { KernelState } from "./KernelState.js";
import { InMemoryReplayGuard, ReplayStatus } from "./ReplayGuard.js";
import { DefaultBoundaryValidator } from "./BoundaryValidator.js";
import { DefaultAuthorityRuleEvaluator } from "./AuthorityRuleEvaluator.js";
import { hashRequest } from "../crypto/Sha256Hasher.js";

export interface EvaluationResult {
  readonly transition: AuthorityTransition;
  readonly replayStatus: ReplayStatus;
}

export class AuthorityTransitionEngine {
  constructor(
    private readonly replayGuard: InMemoryReplayGuard,
    private readonly boundaryValidator: DefaultBoundaryValidator = new DefaultBoundaryValidator(),
    private readonly ruleEvaluator: DefaultAuthorityRuleEvaluator = new DefaultAuthorityRuleEvaluator()
  ) {}

  /**
   * Evaluate a transition request against the current committed state.
   * This is the only method that may ever return a Granted decision.
   */
  evaluate(
    request: AuthorityTransitionRequest,
    state: KernelState
  ): EvaluationResult {
    const requestHash: RequestHash = hashRequest(request);

    const replayStatus = this.replayGuard.inspect(
      request.requestId,
      request.idempotencyKey,
      requestHash
    );

    // Fast path: exact replay of a previously committed transition
    if (replayStatus.kind === "Existing") {
      const existing = this.replayGuard.loadCommittedTransition(replayStatus.transitionId);
      if (existing) {
        return { transition: existing, replayStatus };
      }
    }

    // Mandatory boundary validation
    const boundary = this.boundaryValidator.validate(
      request,
      requestHash,
      state,
      replayStatus
    );

    if (!boundary.passed) {
      const denied = this.createDenied(
        request,
        state,
        boundary.explanation,
        boundary,
        requestHash
      );
      return { transition: denied, replayStatus };
    }

    const subject = state.atomsById[request.subjectId];
    if (!subject) {
      // Should be unreachable after boundary check, but defensive.
      const denied = this.createDenied(
        request,
        state,
        `Subject atom '${request.subjectId}' does not exist.`,
        boundary,
        requestHash
      );
      return { transition: denied, replayStatus };
    }

    const decision = this.ruleEvaluator.evaluate(request, subject, state);

    const transitionId = `tx_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const receiptSignature = `sig_sha256_${requestHash.hexDigest.slice(0, 16)}_${Date.now()}`;

    const transition: AuthorityTransition = {
      id: transitionId,
      subjectAtomId: request.subjectId,
      sourceAuthority: subject.authority,
      requestedAuthority: request.requestedAuthority,
      evaluatedAuthorityVersion: state.authorityVersion,
      decision,
      boundary,
      evidenceRefs: request.evidence.map((e) => e.id),
      requestHash,
      timestamp: request.timestamp,
      receiptSignature,
    };

    return { transition, replayStatus };
  }

  private createDenied(
    request: AuthorityTransitionRequest,
    state: KernelState,
    reason: string,
    boundary: BoundaryAssessment,
    requestHash: RequestHash
  ): AuthorityTransition {
    const subject = state.atomsById[request.subjectId];
    const sourceAuth = subject?.authority ?? { authorityClass: "HYPOTHETICAL" as const, weight: 0 };

    return {
      id: `tx_denied_${Date.now()}_${randomUUID().slice(0, 8)}`,
      subjectAtomId: request.subjectId,
      sourceAuthority: sourceAuth,
      requestedAuthority: request.requestedAuthority,
      evaluatedAuthorityVersion: state.authorityVersion,
      decision: {
        kind: "Denied",
        reason,
        primaryViolation: boundary.violations[0] ?? BoundaryViolation.INVALID_REQUEST,
      },
      boundary,
      evidenceRefs: request.evidence.map((e) => e.id),
      requestHash,
      timestamp: request.timestamp,
      receiptSignature: `sig_denied_${requestHash.hexDigest.slice(0, 16)}`,
    };
  }
}
