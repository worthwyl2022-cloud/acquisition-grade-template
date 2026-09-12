/**
 * Cranium Core — Public Entry Point
 *
 * Authority is not claimed. It is granted—only through Cranium Core.
 */

export { AuthorityService } from "./application/AuthorityService.js";

// Domain re-exports for advanced consumers
export * from "./domain/authority/types.js";
export * from "./domain/cognition/types.js";
export * from "./domain/constitution/types.js";
export { createBootstrapState } from "./domain/authority/bootstrap.js";
export { AuthorityTransitionEngine } from "./domain/authority/AuthorityTransitionEngine.js";
export { InMemoryReplayGuard } from "./domain/authority/ReplayGuard.js";
export { KernelStateReducer } from "./domain/authority/KernelStateReducer.js";
export type { KernelState, ThreatAssessment } from "./domain/authority/KernelState.js";
