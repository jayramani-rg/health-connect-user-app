let pendingAction: (() => void) | null = null;

export function setPendingProfileAction(action: () => void): void {
  pendingAction = action;
}

export function consumePendingProfileAction(): (() => void) | null {
  const action = pendingAction;
  pendingAction = null;
  return action;
}

export function hasPendingProfileAction(): boolean {
  return pendingAction !== null;
}
