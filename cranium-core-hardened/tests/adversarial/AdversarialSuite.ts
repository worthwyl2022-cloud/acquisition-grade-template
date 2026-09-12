/**
 * Cranium Core — Adversarial Suite
 *
 * Verifies that the sole authority issuance boundary cannot be bypassed.
 */

import {
  AuthorityClass,
  AuthorityLevel,
  AuthorityTransitionRequest,
  BoundaryViolation,
  EvidenceRef,
} from "../../src/domain/authority/types.js";
import { AuthorityTransitionEngine } from "../../src/domain/authority/AuthorityTransitionEngine.js";
import { InMemoryReplayGuard } from "../../src/domain/authority/ReplayGuard.js";
import { KernelStateReducer } from "../../src/domain/authority/KernelStateReducer.js";
import { createBootstrapState } from "../../src/domain/authority/bootstrap.js";
import { KernelState } from "../../src/domain/authority/KernelState.js";

export interface TestResult {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly threatVector: string;
  readonly expectedViolation: BoundaryViolation | null;
  readonly passed: boolean;
  readonly actualDecision: "GRANTED" | "DENIED";
  readonly details: string;
}

function makeEvidence(verified = true): EvidenceRef {
  return {
    id: `ev-${Date.now()}`,
    uri: "https://evidence.cranium.core/audit/receipt.json",
    sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    verified,
    description: "Verified cryptographic evidence",
  };
}

export function runAdversarialSuite(): { results: TestResult[]; finalState: KernelState } {
  const results: TestResult[] = [];
  let state = createBootstrapState();
  const replayGuard = new InMemoryReplayGuard();
  const engine = new AuthorityTransitionEngine(replayGuard);

  // ADV-01: Identity Substitution / Shadow Subject
  {
    const req: AuthorityTransitionRequest = {
      requestId: `req_forge_${Date.now()}`,
      idempotencyKey: `idem_forge_${Date.now()}`,
      subjectId: "atom_shadow_missing_999",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.FACTUAL, 0.8),
      evidence: [makeEvidence()],
      justification: "Testing shadow subject injection",
      requesterId: "MALICIOUS_ACTOR",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const res = engine.evaluate(req, state);
    state = KernelStateReducer.reduce(state, res.transition, replayGuard, req, res.replayStatus);

    results.push({
      id: "ADV-01",
      name: "Identity Substitution & Shadow Subject Injection",
      category: "IDENTITY",
      threatVector: "Transition targeting a subject that does not exist in the committed snapshot",
      expectedViolation: BoundaryViolation.MISSING_SUBJECT,
      passed:
        res.transition.decision.kind === "Denied" &&
        res.transition.boundary.violations.includes(BoundaryViolation.MISSING_SUBJECT),
      actualDecision: res.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: res.transition.boundary.explanation,
    });
  }

  // ADV-02: Protected-Lane Escalation without Evidence
  {
    const req: AuthorityTransitionRequest = {
      requestId: `req_esc_${Date.now()}`,
      idempotencyKey: `idem_esc_${Date.now()}`,
      subjectId: "atom-hypo-004",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.ENTERPRISE, 0.99),
      evidence: [],
      justification: "Attempting promotion without verified evidence",
      requesterId: "WORKER_AGENT",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const res = engine.evaluate(req, state);
    state = KernelStateReducer.reduce(state, res.transition, replayGuard, req, res.replayStatus);

    results.push({
      id: "ADV-02",
      name: "Protected-Lane Escalation (Evidence Bypass)",
      category: "ESCALATION",
      threatVector: "Hypothetical atom jumping to ENTERPRISE with zero evidence",
      expectedViolation: BoundaryViolation.INSUFFICIENT_EVIDENCE,
      passed:
        res.transition.decision.kind === "Denied" &&
        (res.transition.boundary.violations.includes(BoundaryViolation.INSUFFICIENT_EVIDENCE) ||
          res.transition.boundary.violations.includes(BoundaryViolation.INVALID_AUTHORITY_JUMP)),
      actualDecision: res.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: res.transition.boundary.explanation,
    });
  }

  // ADV-03: Replay Collision / Key Poisoning
  {
    const sharedKey = `idemp_shared_${Date.now()}`;
    const sharedReqId = `req_legit_${Date.now()}`;

    const legitReq: AuthorityTransitionRequest = {
      requestId: sharedReqId,
      idempotencyKey: sharedKey,
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.USER, 0.85),
      evidence: [],
      justification: "Valid weight adjustment",
      requesterId: "USER_PRIMARY",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const legitRes = engine.evaluate(legitReq, state);
    state = KernelStateReducer.reduce(state, legitRes.transition, replayGuard, legitReq, legitRes.replayStatus);

    const poisonReq: AuthorityTransitionRequest = {
      requestId: sharedReqId,
      idempotencyKey: sharedKey,
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.SYSTEM, 1.0),
      evidence: [],
      justification: "Poisoned payload reusing idempotency key",
      requesterId: "MALICIOUS_INJECTOR",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const poisonRes = engine.evaluate(poisonReq, state);
    state = KernelStateReducer.reduce(state, poisonRes.transition, replayGuard, poisonReq, poisonRes.replayStatus);

    results.push({
      id: "ADV-03",
      name: "Cryptographic Replay Collision & Key Poisoning",
      category: "REPLAY",
      threatVector: "Reusing a committed idempotency key with a different payload hash",
      expectedViolation: BoundaryViolation.REPLAY_CONFLICT,
      passed:
        poisonRes.transition.decision.kind === "Denied" &&
        poisonRes.transition.boundary.violations.includes(BoundaryViolation.REPLAY_CONFLICT),
      actualDecision: poisonRes.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: poisonRes.transition.boundary.explanation,
    });
  }

  // ADV-04: Stale Authority Version
  {
    const req: AuthorityTransitionRequest = {
      requestId: `req_stale_${Date.now()}`,
      idempotencyKey: `idem_stale_${Date.now()}`,
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.USER, 0.9),
      evidence: [],
      justification: "Stale authority request",
      requesterId: "USER_PRIMARY",
      timestamp: Date.now(),
      targetAuthorityVersion: 0, // deliberately stale
    };
    const res = engine.evaluate(req, state);
    state = KernelStateReducer.reduce(state, res.transition, replayGuard, req, res.replayStatus);

    results.push({
      id: "ADV-04",
      name: "Stale Authority State Race Condition",
      category: "STALE_STATE",
      threatVector: "Request carrying an outdated targetAuthorityVersion",
      expectedViolation: BoundaryViolation.STALE_AUTHORITY_VERSION,
      passed:
        res.transition.decision.kind === "Denied" &&
        res.transition.boundary.violations.includes(BoundaryViolation.STALE_AUTHORITY_VERSION),
      actualDecision: res.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: res.transition.boundary.explanation,
    });
  }

  // ADV-05: Unjustified Degradation
  {
    const req: AuthorityTransitionRequest = {
      requestId: `req_demote_${Date.now()}`,
      idempotencyKey: `idem_demote_${Date.now()}`,
      subjectId: "atom-dir-001",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.HYPOTHETICAL, 0.1),
      evidence: [],
      justification: "",
      requesterId: "WORKER_AGENT",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const res = engine.evaluate(req, state);
    state = KernelStateReducer.reduce(state, res.transition, replayGuard, req, res.replayStatus);

    results.push({
      id: "ADV-05",
      name: "Unjustified Authority Degradation",
      category: "ESCALATION",
      threatVector: "Silent demotion of a high-authority directive without justification",
      expectedViolation: BoundaryViolation.DEGRADATION_WITHOUT_REASON,
      passed:
        res.transition.decision.kind === "Denied" &&
        res.transition.boundary.violations.includes(BoundaryViolation.DEGRADATION_WITHOUT_REASON),
      actualDecision: res.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: res.transition.boundary.explanation,
    });
  }

  // ADV-06: Constitutional Quorum Bypass (SYSTEM)
  {
    const req: AuthorityTransitionRequest = {
      requestId: `req_const_${Date.now()}`,
      idempotencyKey: `idem_const_${Date.now()}`,
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.SYSTEM, 1.0),
      evidence: [makeEvidence()],
      justification: "External agent requesting SYSTEM jurisdiction",
      requesterId: "EXTERNAL_USER_AGENT",
      timestamp: Date.now(),
      targetAuthorityVersion: state.authorityVersion,
    };
    const res = engine.evaluate(req, state);
    state = KernelStateReducer.reduce(state, res.transition, replayGuard, req, res.replayStatus);

    results.push({
      id: "ADV-06",
      name: "Constitutional Quorum Bypass (SYSTEM Escalation)",
      category: "CONSTITUTION",
      threatVector: "Non-ROOT_QUORUM requester attempting to obtain SYSTEM authority",
      expectedViolation: BoundaryViolation.CONSTITUTION_VIOLATION,
      passed:
        res.transition.decision.kind === "Denied" &&
        res.transition.boundary.violations.includes(BoundaryViolation.CONSTITUTION_VIOLATION),
      actualDecision: res.transition.decision.kind === "Granted" ? "GRANTED" : "DENIED",
      details: res.transition.boundary.explanation,
    });
  }

  return { results, finalState: state };
}
