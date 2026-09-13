// src/store/slices/cartSlice.ts
// Handbook Sec 5.1 — Transient Domain State: NOT persisted, re-fetched fresh
// after authentication on every session.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartLineItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartLineItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cartData',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartLineItem[]>) => {
      state.items = action.payload;
    },
    clearCart: state => {
      Object.assign(state, initialState);
    },
    // NOTE: cart total is intentionally NOT stored here — it is Derived State
    // (Sec 5.1) computed by a selector or in the component, never persisted.
  },
});

export const { setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const cartDataName = cartSlice.name;
