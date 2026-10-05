import type { Call, CallIssue } from '../types/call.types';

export function issueMessage(issue: CallIssue): string {
  switch (issue) {
    case 'permission_denied':
      return 'Allow microphone access in Settings so the other person can hear you.';
    case 'microphone_unavailable':
      return 'We could not use your microphone. Check that no other app is using it.';
    case 'camera_unavailable':
      return 'Your camera is unavailable right now. You can continue with audio only.';
    case 'token_failed':
      return 'We could not keep this call secure. Please start the call again.';
    default:
      return 'We could not connect the call. Please check your connection and try again.';
  }
}

export function endedMessage(call: Call, userId: string): string {
  const outgoing = call.caller.userId === userId;

  switch (call.status) {
    case 'REJECTED':
      return 'Call declined';
    case 'CANCELLED':
      return outgoing ? 'Call cancelled' : 'Missed call';
    case 'MISSED':
      return outgoing ? 'No answer' : 'Missed call';
    case 'FAILED':
      return 'Could not connect';
    default:
      if (call.endReason === 'NETWORK_FAILURE') {
        return 'Call ended because of a poor connection';
      }
      if (call.endReason === 'MAX_DURATION') {
        return 'Call time limit reached';
      }
      return 'Call ended';
  }
}

export function startFailureMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'We could not start the call. Please try again.';
}
