// src/store/slices/orderSlice.ts
// Handbook Sec 5.1 — Transient Domain State, same rationale as cartSlice.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderSummary {
  orderId: string;
  status: string;
}

export interface OrderState {
  activeOrder: OrderSummary | null;
}

const initialState: OrderState = {
  activeOrder: null,
};

const orderSlice = createSlice({
  name: 'orderData',
  initialState,
  reducers: {
    setActiveOrder: (state, action: PayloadAction<OrderSummary | null>) => {
      state.activeOrder = action.payload;
    },
  },
});

export const { setActiveOrder } = orderSlice.actions;
export default orderSlice.reducer;
export const orderDataName = orderSlice.name;
