/**
 * Cranium Core — Authority Rule Evaluator
 *
 * Produces the TransitionDecision after boundary checks have already passed.
 */

import {
  AuthorityLevel,
  AuthorityTransitionRequest,
  TransitionDecision,
} from "./types.js";
import { CognitiveAtom } from "../cognition/types.js";
import { KernelState } from "./KernelState.js";

export class DefaultAuthorityRuleEvaluator {
  evaluate(
    request: AuthorityTransitionRequest,
    subject: CognitiveAtom,
    _state: KernelState
  ): TransitionDecision {
    // At this point boundary checks have passed.
    // Additional policy logic can be added here later (scopes, time bounds, etc.).

    // Simple acceptance: if we reached this point, grant the requested authority.
    // Future versions may introduce weighted scoring, multi-party quorum, etc.
    return {
      kind: "Granted",
      grantedAuthority: request.requestedAuthority,
    };
  }
}
