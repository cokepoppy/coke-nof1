import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Price {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

interface MarketState {
  prices: Record<string, Price>;
  connected: boolean;
}

const initialState: MarketState = {
  prices: {},
  connected: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    updatePrice: (state, action: PayloadAction<Price>) => {
      state.prices[action.payload.symbol] = action.payload;
    },
    updatePrices: (state, action: PayloadAction<Price[]>) => {
      action.payload.forEach((price) => {
        state.prices[price.symbol] = price;
      });
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
  },
});

export const { updatePrice, updatePrices, setConnected } = marketSlice.actions;
export default marketSlice.reducer;
