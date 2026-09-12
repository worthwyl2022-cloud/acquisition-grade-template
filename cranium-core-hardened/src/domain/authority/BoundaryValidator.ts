/**
 * Cranium Core — Boundary Validator
 *
 * Performs the mandatory pre-decision checks that uphold the constitutional invariants.
 */

import {
  AuthorityClass,
  AuthorityTransitionRequest,
  BoundaryAssessment,
  BoundaryViolation,
  RequestHash,
} from "./types.js";
import { KernelState } from "./KernelState.js";
import { ReplayStatus } from "./ReplayGuard.js";

export class DefaultBoundaryValidator {
  validate(
    request: AuthorityTransitionRequest,
    requestHash: RequestHash,
    state: KernelState,
    replayStatus: ReplayStatus
  ): BoundaryAssessment {
    const violations: BoundaryViolation[] = [];
    const explanations: string[] = [];

    // RULE: Subject must exist in the committed snapshot
    if (!state.atomsById[request.subjectId]) {
      violations.push(BoundaryViolation.MISSING_SUBJECT);
      explanations.push(
        `Subject atom '${request.subjectId}' does not exist in the committed kernel snapshot.`
      );
    }

    // RULE: Target authority version must match current
    if (request.targetAuthorityVersion !== state.authorityVersion) {
      violations.push(BoundaryViolation.STALE_AUTHORITY_VERSION);
      explanations.push(
        `Request targets authorityVersion ${request.targetAuthorityVersion} but current is ${state.authorityVersion}.`
      );
    }

    // RULE: Replay conflict
    if (replayStatus.kind === "ConflictingReuse") {
      violations.push(BoundaryViolation.REPLAY_CONFLICT);
      explanations.push(
        `Idempotency key reuse with mismatched hash (existing: ${replayStatus.existingHash.slice(0, 12)}…, new: ${replayStatus.newHash.slice(0, 12)}…).`
      );
    }

    // RULE: Elevation into FACTUAL or ENTERPRISE requires verified evidence
    const elevating =
      request.requestedAuthority.authorityClass === AuthorityClass.FACTUAL ||
      request.requestedAuthority.authorityClass === AuthorityClass.ENTERPRISE ||
      request.requestedAuthority.authorityClass === AuthorityClass.SYSTEM;

    if (elevating) {
      const hasVerifiedEvidence =
        request.evidence.length > 0 &&
        request.evidence.every((e) => e.verified && e.sha256.length === 64);

      if (!hasVerifiedEvidence) {
        violations.push(BoundaryViolation.INSUFFICIENT_EVIDENCE);
        explanations.push(
          "Promotion into FACTUAL, ENTERPRISE, or SYSTEM requires at least one verified 256-bit evidence reference."
        );
      }
    }

    // RULE: Large authority jumps without strong evidence are invalid
    const subject = state.atomsById[request.subjectId];
    if (subject) {
      const fromRank = classRank(subject.authority.authorityClass);
      const toRank = classRank(request.requestedAuthority.authorityClass);
      if (toRank - fromRank >= 2 && request.evidence.length === 0) {
        violations.push(BoundaryViolation.INVALID_AUTHORITY_JUMP);
        explanations.push(
          `Multi-rank authority jump from ${subject.authority.authorityClass} to ${request.requestedAuthority.authorityClass} requires evidence.`
        );
      }
    }

    // RULE: Degradation of high-authority atoms requires justification
    if (subject) {
      const fromRank = classRank(subject.authority.authorityClass);
      const toRank = classRank(request.requestedAuthority.authorityClass);
      if (toRank < fromRank && (!request.justification || request.justification.trim().length === 0)) {
        violations.push(BoundaryViolation.DEGRADATION_WITHOUT_REASON);
        explanations.push(
          "Authority degradation requires a non-empty justification."
        );
      }
    }

    // RULE: SYSTEM class is constitutionally protected
    if (
      request.requestedAuthority.authorityClass === AuthorityClass.SYSTEM &&
      request.requesterId !== "ROOT_QUORUM"
    ) {
      violations.push(BoundaryViolation.CONSTITUTION_VIOLATION);
      explanations.push(
        "SYSTEM authority may only be granted under ROOT_QUORUM requester identity."
      );
    }

    const passed = violations.length === 0;

    return {
      passed,
      violations,
      explanation: passed
        ? "All boundary checks passed."
        : explanations.join(" | "),
    };
  }
}

function classRank(c: AuthorityClass): number {
  switch (c) {
    case AuthorityClass.HYPOTHETICAL: return 0;
    case AuthorityClass.WORK: return 1;
    case AuthorityClass.USER: return 2;
    case AuthorityClass.FACTUAL: return 3;
    case AuthorityClass.ENTERPRISE: return 4;
    case AuthorityClass.SYSTEM: return 5;
    default: return -1;
  }
}
