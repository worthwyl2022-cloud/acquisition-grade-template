/**
 * Cranium Core — Application Service
 *
 * Thin orchestration layer over the sole authority issuance boundary.
 * Adapters (HTTP, UI, CLI) call this service; they never touch the engine directly.
 */

import {
  AuthorityTransitionEngine,
  EvaluationResult,
} from "../domain/authority/AuthorityTransitionEngine.js";
import { InMemoryReplayGuard } from "../domain/authority/ReplayGuard.js";
import { KernelStateReducer } from "../domain/authority/KernelStateReducer.js";
import { createBootstrapState } from "../domain/authority/bootstrap.js";
import { KernelState } from "../domain/authority/KernelState.js";
import { AuthorityTransitionRequest } from "../domain/authority/types.js";

export class AuthorityService {
  private state: KernelState;
  private readonly replayGuard: InMemoryReplayGuard;
  private readonly engine: AuthorityTransitionEngine;

  constructor() {
    this.state = createBootstrapState();
    this.replayGuard = new InMemoryReplayGuard();
    this.engine = new AuthorityTransitionEngine(this.replayGuard);
  }

  /** Current committed kernel snapshot (read-only view). */
  getState(): KernelState {
    return this.state;
  }

  /**
   * Submit an authority transition request.
   * This is the only public path that can result in a Granted decision.
   */
  submitTransition(request: AuthorityTransitionRequest): EvaluationResult {
    const result = this.engine.evaluate(request, this.state);
    this.state = KernelStateReducer.reduce(
      this.state,
      result.transition,
      this.replayGuard,
      request,
      result.replayStatus
    );
    return result;
  }

  /** Convenience: current authority version */
  getAuthorityVersion(): number {
    return this.state.authorityVersion;
  }

  /** Convenience: current threat level */
  getThreatLevel(): string {
    return this.state.threatAssessment.threatLevel;
  }
}
