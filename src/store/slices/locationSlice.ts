import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

export type LocationPermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked' | 'unavailable';
export type LocalitySource = 'device' | 'address';

export interface LocationState {
  permission: LocationPermissionStatus;
  promptedAt: number | null;
  locality: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  source: LocalitySource | null;
  addressId: string | null;
  updatedAt: number | null;
}

const initialState: LocationState = {
  permission: 'unknown',
  promptedAt: null,
  locality: null,
  city: null,
  state: null,
  pincode: null,
  source: null,
  addressId: null,
  updatedAt: null,
};

export interface SetLocalityPayload {
  locality: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  source: LocalitySource;
  addressId?: string | null;
}

const locationSlice = createSlice({
  name: 'locationData',
  initialState,
  reducers: {
    setLocality: (state, action: PayloadAction<SetLocalityPayload>) => {
      state.locality = action.payload.locality;
      state.city = action.payload.city;
      state.state = action.payload.state;
      state.pincode = action.payload.pincode;
      state.source = action.payload.source;
      state.addressId = action.payload.addressId ?? null;
      state.updatedAt = Date.now();
    },
    clearLocality: (state) => {
      state.locality = null;
      state.city = null;
      state.state = null;
      state.pincode = null;
      state.source = null;
      state.addressId = null;
      state.updatedAt = null;
    },
    setLocationPermission: (state, action: PayloadAction<LocationPermissionStatus>) => {
      state.permission = action.payload;
    },
    markLocationPrompted: (state) => {
      state.promptedAt = Date.now();
    },
    resetLocation: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      if (state.source === 'address') {
        Object.assign(state, { ...initialState, permission: state.permission, promptedAt: state.promptedAt });
      }
    });
  },
});

export const { setLocality, clearLocality, setLocationPermission, markLocationPrompted, resetLocation } = locationSlice.actions;
export default locationSlice.reducer;
export const locationDataName = locationSlice.name;
