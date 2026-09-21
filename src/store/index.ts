import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, PersistConfig } from 'redux-persist';

import authReducer, { authDataName, logout, setTokens } from './slices/authSlice';
import networkReducer, { networkDataName } from './slices/networkSlice';
import notificationsReducer, { notificationsDataName, incrementUnread } from './slices/notificationsSlice';
import { API } from '../api';
import { chatSocket } from '../services/chatSocket';

const rootReducer = combineReducers({
  [authDataName]: authReducer,
  [networkDataName]: networkReducer,
  [notificationsDataName]: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootState> = {
  key: 'app_root',
  storage: AsyncStorage,
  whitelist: [authDataName],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: __DEV__,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

API.configure({
  getToken: () => store.getState().authData.tokens?.accessToken ?? null,
  getRefreshToken: () => store.getState().authData.tokens?.refreshToken ?? null,
  onTokensRefreshed: (accessToken, refreshToken) => {
    store.dispatch(setTokens({ accessToken, refreshToken }));
  },
  onSessionExpired: () => {
    if (store.getState().authData.isAuthenticated) {
      store.dispatch(logout());
    }
  },
});

chatSocket.configure(() => store.getState().authData.tokens?.accessToken ?? null);
chatSocket.onNotification(() => store.dispatch(incrementUnread()));

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { setAuthSession, setTokens, updateUserProfile, completeOnboarding, logout } from './slices/authSlice';
export { setIsConnected } from './slices/networkSlice';
export { setUnreadCount } from './slices/notificationsSlice';
