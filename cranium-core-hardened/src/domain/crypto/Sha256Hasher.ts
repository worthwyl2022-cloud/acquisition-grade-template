/**
 * Cranium Core — Canonical SHA-256 Request Hasher
 *
 * Produces a deterministic, canonical hash of an AuthorityTransitionRequest.
 * This hash is the basis for replay detection and receipt binding.
 */

import { createHash } from "crypto";
import { AuthorityTransitionRequest, RequestHash } from "../authority/types.js";

/**
 * Canonical serialization: stable key order, no whitespace variance.
 * Any change to the request that should be considered distinct must change this digest.
 */
function canonicalize(request: AuthorityTransitionRequest): string {
  const payload = {
    requestId: request.requestId,
    idempotencyKey: request.idempotencyKey,
    subjectId: request.subjectId,
    requestedAuthority: {
      authorityClass: request.requestedAuthority.authorityClass,
      weight: request.requestedAuthority.weight,
    },
    evidence: request.evidence.map((e) => ({
      id: e.id,
      uri: e.uri,
      sha256: e.sha256,
      verified: e.verified,
    })),
    justification: request.justification,
    requesterId: request.requesterId,
    timestamp: request.timestamp,
    targetAuthorityVersion: request.targetAuthorityVersion,
  };

  return JSON.stringify(payload);
}

export function hashRequest(request: AuthorityTransitionRequest): RequestHash {
  const canonical = canonicalize(request);
  const hexDigest = createHash("sha256").update(canonical, "utf8").digest("hex");

  return {
    hexDigest,
    algorithm: "SHA-256",
  };
}
