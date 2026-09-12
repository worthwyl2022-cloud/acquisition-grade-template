/**
 * Cranium Core — Replay Guard
 *
 * Enforces the Idempotent Replay Boundary (CONST-03).
 * A reused idempotency key with a different canonical hash is ConflictingReuse.
 */

import { AuthorityTransition, RequestHash } from "./types.js";

export type ReplayStatus =
  | { readonly kind: "New" }
  | { readonly kind: "Existing"; readonly transitionId: string }
  | { readonly kind: "ConflictingReuse"; readonly existingHash: string; readonly newHash: string };

interface RecordedEntry {
  readonly requestId: string;
  readonly idempotencyKey: string;
  readonly requestHash: RequestHash;
  readonly transition: AuthorityTransition;
}

export class InMemoryReplayGuard {
  private readonly byIdempotencyKey = new Map<string, RecordedEntry>();
  private readonly byTransitionId = new Map<string, AuthorityTransition>();

  inspect(
    requestId: string,
    idempotencyKey: string,
    canonicalRequestHash: RequestHash
  ): ReplayStatus {
    const existing = this.byIdempotencyKey.get(idempotencyKey);

    if (!existing) {
      return { kind: "New" };
    }

    if (existing.requestHash.hexDigest === canonicalRequestHash.hexDigest) {
      return { kind: "Existing", transitionId: existing.transition.id };
    }

    return {
      kind: "ConflictingReuse",
      existingHash: existing.requestHash.hexDigest,
      newHash: canonicalRequestHash.hexDigest,
    };
  }

  record(
    requestId: string,
    idempotencyKey: string,
    requestHash: RequestHash,
    transition: AuthorityTransition
  ): void {
    const entry: RecordedEntry = {
      requestId,
      idempotencyKey,
      requestHash,
      transition,
    };
    this.byIdempotencyKey.set(idempotencyKey, entry);
    this.byTransitionId.set(transition.id, transition);
  }

  loadCommittedTransition(transitionId: string): AuthorityTransition | null {
    return this.byTransitionId.get(transitionId) ?? null;
  }
}
