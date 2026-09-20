// A single in-memory "resume this after the profile is completed" slot. Navigation params can't carry a
// function, and this app has no global event bus, so `useProfileGate` stashes the gated action here right
// before navigating to ProfileBasics, and ProfileBasicsScreen consumes it after a successful save. Simple
// on purpose: at most one gated action is ever pending at a time (the screen that set it is still mounted
// underneath ProfileBasics in the native stack).
let pendingAction: (() => void) | null = null;

export function setPendingProfileAction(action: () => void): void {
  pendingAction = action;
}

export function consumePendingProfileAction(): (() => void) | null {
  const action = pendingAction;
  pendingAction = null;
  return action;
}

/** Non-destructive check — lets a screen decide what to render (e.g. hide "Skip" when a protected
 * action is waiting to resume) without consuming the pending action. */
export function hasPendingProfileAction(): boolean {
  return pendingAction !== null;
}
