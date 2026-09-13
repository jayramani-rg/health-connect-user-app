import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthTokens, AuthUser } from '../../features/auth/types/auth.types';

const initialState: AuthState & { justRegistered: boolean } = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  justRegistered: false,
};

const authSlice = createSlice({
  name: 'authData',
  initialState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<{ user: AuthUser; tokens: AuthTokens; isNewRegistration?: boolean }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.justRegistered = !!action.payload.isNewRegistration;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      if (state.tokens) {
        state.tokens.accessToken = action.payload.accessToken;
        state.tokens.refreshToken = action.payload.refreshToken;
      }
    },
    completeOnboarding: (state) => {
      state.justRegistered = false;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setAuthSession, setTokens, completeOnboarding, logout } = authSlice.actions;
export default authSlice.reducer;
export const authDataName = authSlice.name;
