/**
 * Unit tests for BoundaryValidator and core invariants
 */

import { DefaultBoundaryValidator } from "../../src/domain/authority/BoundaryValidator.js";
import { AuthorityClass, AuthorityLevel, BoundaryViolation } from "../../src/domain/authority/types.js";
import { createBootstrapState } from "../../src/domain/authority/bootstrap.js";
import { hashRequest } from "../../src/domain/crypto/Sha256Hasher.js";

const validator = new DefaultBoundaryValidator();
const state = createBootstrapState();

function baseRequest(overrides: Partial<any> = {}) {
  return {
    requestId: "req_test_1",
    idempotencyKey: "idem_test_1",
    subjectId: "atom-hypo-004",
    requestedAuthority: AuthorityLevel.of(AuthorityClass.USER, 0.7),
    evidence: [],
    justification: "Unit test",
    requesterId: "TESTER",
    timestamp: Date.now(),
    targetAuthorityVersion: state.authorityVersion,
    ...overrides,
  };
}

describe("BoundaryValidator", () => {
  test("rejects missing subject", () => {
    const req = baseRequest({ subjectId: "does-not-exist" });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(BoundaryViolation.MISSING_SUBJECT);
  });

  test("rejects stale authority version", () => {
    const req = baseRequest({ targetAuthorityVersion: 0 });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(BoundaryViolation.STALE_AUTHORITY_VERSION);
  });

  test("rejects elevation to ENTERPRISE without evidence", () => {
    const req = baseRequest({
      requestedAuthority: AuthorityLevel.of(AuthorityClass.ENTERPRISE, 0.9),
      evidence: [],
    });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(BoundaryViolation.INSUFFICIENT_EVIDENCE);
  });

  test("rejects SYSTEM grant from non-ROOT_QUORUM", () => {
    const req = baseRequest({
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.SYSTEM, 1.0),
      evidence: [
        {
          id: "ev1",
          uri: "https://example.com",
          sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
          verified: true,
          description: "test",
        },
      ],
      requesterId: "EXTERNAL_AGENT",
    });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(BoundaryViolation.CONSTITUTION_VIOLATION);
  });

  test("rejects unjustified degradation", () => {
    const req = baseRequest({
      subjectId: "atom-dir-001",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.HYPOTHETICAL, 0.1),
      justification: "",
    });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(BoundaryViolation.DEGRADATION_WITHOUT_REASON);
  });

  test("passes a well-formed non-elevating request", () => {
    const req = baseRequest({
      subjectId: "atom-intent-003",
      requestedAuthority: AuthorityLevel.of(AuthorityClass.USER, 0.82),
      justification: "Minor weight adjustment within same class",
    });
    const hash = hashRequest(req);
    const result = validator.validate(req, hash, state, { kind: "New" });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
