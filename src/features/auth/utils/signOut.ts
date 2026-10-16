import { authService } from '../../../services/authService';
import { logout, persistor, setUnreadCount, store } from '../../../store';

let pending: Promise<void> | null = null;

export function signOut(): Promise<void> {
  if (!pending) {
    pending = endSession().finally(() => {
      pending = null;
    });
  }
  return pending;
}

async function endSession(): Promise<void> {
  const { isAuthenticated, tokens } = store.getState().authData;
  if (isAuthenticated) {
    await authService.logout(tokens?.refreshToken ?? undefined).catch(() => undefined);
  }
  store.dispatch(logout());
  store.dispatch(setUnreadCount(0));
  await persistor.flush();
}
