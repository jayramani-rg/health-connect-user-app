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
  store.dispatch(logout());
  store.dispatch(setUnreadCount(0));
  await persistor.flush().catch(() => undefined);
  if (isAuthenticated && tokens?.accessToken) {
    revokeOnServer(tokens.accessToken, tokens.refreshToken ?? undefined).catch(() => undefined);
  }
}

async function revokeOnServer(accessToken: string, refreshToken?: string): Promise<void> {
  try {
    await authService.logout(refreshToken, false, accessToken);
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode !== 401 || !refreshToken) return;
    const renewed = await authService.refreshSession(refreshToken);
    await authService.logout(renewed.data.refreshToken, false, renewed.data.accessToken);
  }
}
