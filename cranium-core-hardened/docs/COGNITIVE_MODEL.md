# Cranium Core — Cognitive Model

## Cognitive Atoms

A Cognitive Atom is the fundamental epistemic unit of Cranium Core.

Properties:
- **id** — stable identifier
- **kind** — DIRECTIVE | FACT | INTENT | HYPOTHESIS | POLICY
- **status** — PROVISIONAL | ACTIVE | COMMITTED | SUPERSEDED | QUARANTINED
- **content** — the propositional content
- **authority** — current AuthorityLevel (class + weight)
- **provenance** — source, actor, recordedAt
- **createdAt**

Atoms are immutable. Authority changes occur only by producing a new version of the atom through a Granted transition.

## Canon Lanes

Priority-ordered semantic channels. Higher lanes constrain lower ones.

1. SYSTEM_AXIOM (highest)
2. ENTERPRISE_POLICY
3. FACTUAL
4. USER_PREFERENCE
5. WORKING_MEMORY
6. HYPOTHETICAL (lowest)

Lane membership and authority class are related but distinct. Lane enforcement and authority issuance are both mediated by the kernel.

## Authority Classes

- HYPOTHETICAL
- WORK
- USER
- FACTUAL
- ENTERPRISE
- SYSTEM

Elevation into FACTUAL, ENTERPRISE, or SYSTEM is a privileged operation that requires verified cryptographic evidence and, for SYSTEM, ROOT_QUORUM identity.

## Relationship to the Issuance Boundary

Cognition (content generation, hypothesis formation, reasoning) may occur freely.  
Authority over that cognition may not.  

Any change in the authority carried by a Cognitive Atom must pass through the sole issuance boundary: the AuthorityTransitionEngine.
