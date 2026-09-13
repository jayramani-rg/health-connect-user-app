// src/store/slices/networkSlice.ts
// Handbook Sec 5.1 — Infrastructure State: updated by a NetInfo listener in
// the root navigator or app entry point. Drives NoInternetScreen (Sec 15.1).

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NetworkState {
  isConnected: boolean;
}

const initialState: NetworkState = {
  isConnected: true,
};

const networkSlice = createSlice({
  name: 'networkData',
  initialState,
  reducers: {
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setIsConnected } = networkSlice.actions;
export default networkSlice.reducer;
export const networkDataName = networkSlice.name;
