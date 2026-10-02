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
