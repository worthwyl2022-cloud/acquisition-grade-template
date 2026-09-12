# Cranium Core — Hardened Architecture

**Governing Statement**

> Authority is not claimed. It is granted—only through Cranium Core.  
> Cranium Core is the sole authority issuance boundary: all authority must be validated, scoped, versioned, and receipted before it becomes effective.

## Architectural Style

Clean / Hexagonal Architecture with strict dependency direction:

```
Adapters  →  Application  →  Domain  ←  Infrastructure
```

- **Domain**: Pure, immutable, zero external dependencies. Contains the constitutional core.
- **Application**: Use cases and orchestration. Depends only on Domain.
- **Adapters**: Inbound (HTTP, CLI, UI) and outbound (persistence, crypto, messaging).
- **Infrastructure**: Concrete implementations of ports defined in Domain/Application.

## Core Domain Modules

### 1. Authority Kernel (the sole issuance boundary)
- `AuthorityLevel` / `AuthorityClass`
- `AuthorityTransitionRequest`
- `AuthorityTransition` (the receipted result)
- `TransitionDecision` (Granted | Denied)
- `BoundaryAssessment` + `BoundaryViolation`
- `AuthorityTransitionEngine` (the only path that can produce a Granted decision)

### 2. Cognitive Substrate
- `CognitiveAtom` (immutable epistemic unit)
- `AtomKind`, `CognitiveStatus`
- `Provenance`
- `CanonLane` (priority-ordered semantic channels)

### 3. Constitutional Layer
- `ConstitutionalPrinciple`
- Hard invariants that cannot be bypassed by any transition

### 4. Cryptographic & Replay Layer
- Canonical request hashing (SHA-256)
- `ReplayGuard` (New | Existing | ConflictingReuse)
- Receipt signatures

## Non-Negotiable Invariants

1. No authority increase may be committed unless it results from a unique, non-replayed `AuthorityTransitionRequest`.
2. The request must be evaluated against the current committed state.
3. All mandatory boundary checks must pass.
4. The decision must be an explicit `GRANTED`.
5. Kernel invariants and constitutional principles must be satisfied.
6. The transition must be receipt-bound within the same atomic commit.

These invariants exist solely to make the governing statement true at runtime.

## Target Project Layout

```
cranium-core-hardened/
├── src/
│   ├── domain/                 # Pure constitutional core
│   │   ├── authority/
│   │   ├── cognition/
│   │   ├── canon/
│   │   ├── constitution/
│   │   └── crypto/
│   ├── application/            # Use cases
│   ├── adapters/               # Inbound / outbound
│   └── infrastructure/         # Concrete implementations
├── tests/
│   ├── unit/
│   ├── property/
│   ├── integration/
│   └── adversarial/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── COGNITIVE_MODEL.md
│   ├── GOVERNANCE.md
│   ├── EXECUTIVE_ONE_PAGER.md
│   └── VALUE_AND_IP.md
├── deploy/
└── scripts/
```

## Design Decisions (Initial)

- TypeScript as primary language for coherence with the live demonstration surface.
- Immutable data structures and pure functions wherever possible in the domain.
- Explicit result types over exceptions for all authority decisions.
- Every Granted transition produces a cryptographically bound receipt.
- The live demo UI becomes an adapter over the hardened kernel, not the source of truth.
