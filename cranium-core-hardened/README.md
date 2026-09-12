# Cranium Core (Hardened)

**Authority is not claimed. It is granted—only through Cranium Core.**

Cranium Core is the sole authority issuance boundary: all authority must be validated, scoped, versioned, and receipted before it becomes effective.

---

## What This Is

A production-oriented, TypeScript implementation of a directive-governed cognitive kernel whose central purpose is to make authority a first-class, runtime-enforced property.

No authority increase can occur unless it passes through the `AuthorityTransitionEngine`. The engine is the only component permitted to emit a `Granted` decision.

## Core Invariants

1. Authority is never claimed; it is only granted.
2. Every grant is evaluated against the current committed kernel state.
3. Requests are canonically hashed (SHA-256).
4. Replay of an idempotency key with a different hash is rejected.
5. Elevation into FACTUAL / ENTERPRISE / SYSTEM requires verified cryptographic evidence.
6. SYSTEM authority is constitutionally restricted to `ROOT_QUORUM`.
7. Every transition (granted or denied) produces a receipt and updates threat assessment.

## Project Structure

```
src/domain/
  authority/     ← Engine, Validator, ReplayGuard, Reducer, bootstrap
  cognition/     ← CognitiveAtom, CanonLane
  constitution/  ← CORE_CONSTITUTION
  crypto/        ← Canonical SHA-256 hasher

tests/
  adversarial/   ← 6-vector adversarial suite
  unit/          ← Boundary and invariant tests

docs/
  ARCHITECTURE.md
  EXECUTIVE_ONE_PAGER.md
  VALUE_AND_IP.md

deploy/
  Dockerfile
```

## Quick Start (Development)

```bash
npm install
npx ts-node --esm tests/adversarial/run.ts
```

## Governing Statement (Constitutional Root)

> Authority is not claimed. It is granted—only through Cranium Core.  
> Cranium Core is the sole authority issuance boundary: all authority must be validated, scoped, versioned, and receipted before it becomes effective.

## Ownership

© 2026 Wyl Mathes · WorthWyl Media  
All rights reserved. No license is granted for reproduction, redistribution, or derivative works without explicit written permission.
