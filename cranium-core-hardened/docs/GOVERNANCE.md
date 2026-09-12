# Cranium Core — Governance Model

## Sole Issuance Boundary

Authority is not claimed. It is granted—only through Cranium Core.

Cranium Core is the sole authority issuance boundary. All authority must be validated, scoped, versioned, and receipted before it becomes effective.

No other component, adapter, or external system is permitted to mutate the authority of a Cognitive Atom.

## Constitutional Principles (CORE_CONSTITUTION)

1. **Sole Issuance Boundary** — No Granted decision may be produced outside AuthorityTransitionEngine.evaluate.
2. **Atomic Authority Invariant** — All authority must be validated, scoped, versioned, and receipted.
3. **Idempotent Replay Boundary** — Reused idempotency key with different hash is ConflictingReuse.
4. **Version Coherence** — Stale targetAuthorityVersion is denied.
5. **Evidence Provenance for Elevation** — FACTUAL / ENTERPRISE / SYSTEM require verified 256-bit evidence.

## Boundary Rules Enforced at Evaluation Time

- Subject must exist in the committed snapshot
- Request must target the current authorityVersion
- Replay conflicts are rejected
- Multi-rank jumps and privileged elevations require evidence
- Degradation of high-authority atoms requires justification
- SYSTEM class is restricted to ROOT_QUORUM

## Threat Assessment

Denied transitions accumulate into a live ThreatAssessment:
- threatLevel: NOMINAL | ELEVATED | CRITICAL
- suspectedVectors
- replayAttemptsBlocked
- boundaryAnomaliesCount
- lastIncidentTimestamp

This provides a continuous, machine-readable signal of boundary pressure.

## Receipts

Every transition (Granted or Denied) produces:
- a unique transition id
- the canonical request hash
- a receipt signature
- full boundary assessment

Receipts form an auditable history of every attempt to obtain authority.
