import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AIModel {
  id: number;
  name: string;
  provider: string;
  current_balance: number;
  status: string;
}

interface Position {
  id: number;
  model_id: number;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
}

interface Trade {
  id: number;
  model_id: number;
  symbol: string;
  side: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  profit_loss?: number;
  status: string;
}

interface TradingState {
  models: AIModel[];
  positions: Position[];
  trades: Trade[];
  selectedModelId: number | null;
}

const initialState: TradingState = {
  models: [],
  positions: [],
  trades: [],
  selectedModelId: null,
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setModels: (state, action: PayloadAction<AIModel[]>) => {
      state.models = action.payload;
    },
    updateModel: (state, action: PayloadAction<AIModel>) => {
      const index = state.models.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = action.payload;
      }
    },
    setPositions: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload;
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const index = state.positions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.positions[index] = action.payload;
      } else {
        state.positions.push(action.payload);
      }
    },
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    setSelectedModel: (state, action: PayloadAction<number | null>) => {
      state.selectedModelId = action.payload;
    },
  },
});

export const {
  setModels,
  updateModel,
  setPositions,
  updatePosition,
  setTrades,
  addTrade,
  setSelectedModel,
} = tradingSlice.actions;

export default tradingSlice.reducer;
