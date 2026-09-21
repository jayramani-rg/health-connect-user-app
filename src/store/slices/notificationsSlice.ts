import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationsState {
  unreadCount: number;
}

const initialState: NotificationsState = {
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notificationsData',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
  },
});

export const { setUnreadCount, incrementUnread } = notificationsSlice.actions;
export default notificationsSlice.reducer;
export const notificationsDataName = notificationsSlice.name;
