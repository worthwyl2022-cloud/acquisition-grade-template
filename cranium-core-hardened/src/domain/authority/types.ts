/**
 * Cranium Core — Authority Domain Types
 *
 * Governing Statement:
 * Authority is not claimed. It is granted—only through Cranium Core.
 * Cranium Core is the sole authority issuance boundary:
 * all authority must be validated, scoped, versioned, and receipted
 * before it becomes effective.
 */

export enum AuthorityClass {
  HYPOTHETICAL = "HYPOTHETICAL",
  WORK = "WORK",
  USER = "USER",
  FACTUAL = "FACTUAL",
  ENTERPRISE = "ENTERPRISE",
  SYSTEM = "SYSTEM",
}

export interface AuthorityLevel {
  readonly authorityClass: AuthorityClass;
  readonly weight: number; // 0.0 – 1.0
}

export const AuthorityLevel = {
  NONE: { authorityClass: AuthorityClass.HYPOTHETICAL, weight: 0 } as AuthorityLevel,

  of(authorityClass: AuthorityClass, weight: number): AuthorityLevel {
    if (weight < 0 || weight > 1) {
      throw new Error(`Authority weight must be in [0, 1]. Received: ${weight}`);
    }
    return { authorityClass, weight };
  },
};

export enum BoundaryViolation {
  MISSING_SUBJECT = "MISSING_SUBJECT",
  STALE_AUTHORITY_VERSION = "STALE_AUTHORITY_VERSION",
  REPLAY_CONFLICT = "REPLAY_CONFLICT",
  INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE",
  INVALID_AUTHORITY_JUMP = "INVALID_AUTHORITY_JUMP",
  DEGRADATION_WITHOUT_REASON = "DEGRADATION_WITHOUT_REASON",
  CONSTITUTION_VIOLATION = "CONSTITUTION_VIOLATION",
  INVALID_REQUEST = "INVALID_REQUEST",
}

export interface BoundaryAssessment {
  readonly passed: boolean;
  readonly violations: readonly BoundaryViolation[];
  readonly explanation: string;
}

export type TransitionDecision =
  | { readonly kind: "Granted"; readonly grantedAuthority: AuthorityLevel }
  | { readonly kind: "Denied"; readonly reason: string; readonly primaryViolation: BoundaryViolation };

export interface EvidenceRef {
  readonly id: string;
  readonly uri: string;
  readonly sha256: string;
  readonly verified: boolean;
  readonly description: string;
}

export interface AuthorityTransitionRequest {
  readonly requestId: string;
  readonly idempotencyKey: string;
  readonly subjectId: string;
  readonly requestedAuthority: AuthorityLevel;
  readonly evidence: readonly EvidenceRef[];
  readonly justification: string;
  readonly requesterId: string;
  readonly timestamp: number;
  readonly targetAuthorityVersion: number;
}

export interface RequestHash {
  readonly hexDigest: string;
  readonly algorithm: "SHA-256";
}

export interface AuthorityTransition {
  readonly id: string;
  readonly subjectAtomId: string;
  readonly sourceAuthority: AuthorityLevel;
  readonly requestedAuthority: AuthorityLevel;
  readonly evaluatedAuthorityVersion: number;
  readonly decision: TransitionDecision;
  readonly boundary: BoundaryAssessment;
  readonly evidenceRefs: readonly string[];
  readonly requestHash: RequestHash;
  readonly timestamp: number;
  readonly receiptSignature: string;
}
