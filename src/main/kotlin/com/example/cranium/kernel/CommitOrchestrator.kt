package com.example.cranium.kernel

import com.example.cranium.authority.AuthorityTransition
import com.example.cranium.authority.AuthorityTransitionEngine
import com.example.cranium.authority.AuthorityTransitionRequest
import com.example.cranium.authority.TransitionDecision
import com.example.cranium.hash.RequestHash
import com.example.cranium.receipt.AuthorityReceipt
import com.example.cranium.receipt.ReceiptChain
import com.example.cranium.replay.ReplayGuard
import com.example.cranium.replay.ReplayStatus
import java.time.Instant
import java.util.UUID

/**
 * The sole declared entry point for the governed authority commit path.
 * Nothing else calls KernelStateReducer.reduce() in production.
 */
class CommitOrchestrator(
    private val engine: AuthorityTransitionEngine,
    private val reducer: KernelStateReducer,
    private val receiptChain: ReceiptChain,
    private val replayGuard: ReplayGuard,
    private val clock: () -> Instant = { Instant.now() }
) {

    sealed interface CommitResult {
        data class Committed(
            val newState: KernelState,
            val transition: AuthorityTransition,
            val receipt: AuthorityReceipt
        ) : CommitResult

        data class Replayed(val originalTransition: AuthorityTransition) : CommitResult
        data class Declined(val transition: AuthorityTransition) : CommitResult

        data class ConflictingReuse(
            val originalRequestHash: RequestHash,
            val attemptedRequestHash: RequestHash
        ) : CommitResult

        data class InvariantViolation(
            val violations: List<InvariantResult.Violated>
        ) : CommitResult
    }

    fun commit(
        request: AuthorityTransitionRequest,
        requestHash: RequestHash,
        state: KernelState
    ): CommitResult {
        when (val replay = replayGuard.inspect(
            request.requestId, request.idempotencyKey, requestHash
        )) {
            is ReplayStatus.Existing -> return CommitResult.Replayed(replay.transition)
            is ReplayStatus.ConflictingReuse -> return CommitResult.ConflictingReuse(
                replay.originalRequestHash, requestHash
            )
            ReplayStatus.New -> Unit
        }

        val transition = engine.evaluate(request, state)

        if (transition.decision !is TransitionDecision.Granted) {
            return CommitResult.Declined(transition)
        }

        val newState = try {
            reducer.reduce(state, transition)
        } catch (e: IllegalStateException) {
            return CommitResult.InvariantViolation(emptyList())
        }

        val receipt = AuthorityReceipt(
            receiptId = UUID.randomUUID().toString(),
            executionId = state.executionId,
            transitionId = transition.id,
            requestHash = requestHash,
            evaluatedAuthorityVersion = transition.evaluatedAuthorityVersion,
            committedAuthorityVersion = newState.authorityVersion,
            decision = transition.decision,
            boundaryAssessment = transition.boundary,
            invariantResults = emptyList(),
            constitutionHash = AuthorityReceipt.CONSTITUTION_HASH_STUB,
            previousReceiptHash = receiptChain.headHash(),
            timestamp = clock()
        )

        receiptChain.append(receipt)

        return CommitResult.Committed(newState, transition, receipt)
    }
}
