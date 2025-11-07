import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AIModel {
  id: number;
  name: string;
  provider: string;
  modelId: string;
  initialBalance: number;
  currentBalance: number;
  status: string;
  season: number;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: number;
  model_id: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  leverage: number;
  entry_time: string;
  exit_time: string | null;
  realized_pnl: number | null;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
  stop_loss: number | null;
  take_profit: number | null;
}

export interface Position {
  id: number;
  model_id: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry_price: number;
  current_price: number;
  quantity: number;
  leverage: number;
  unrealized_pnl: number;
  liquidation_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  opened_at: string;
}

export interface DecisionLog {
  id: number;
  modelId: number;
  timestamp: string;
  decisionType: 'LONG' | 'SHORT' | 'HOLD' | 'CLOSE';
  symbol: string | null;
  reasoning: string;
  marketContext: any;
  accountContext: any;
  outputJson: any;
  executionStatus: 'pending' | 'executed' | 'failed' | 'skipped';
  executionError: string | null;
  latencyMs: number | null;
  createdAt: string;
  model?: AIModel;
}

// AI Models API
export const getAIModels = async (): Promise<AIModel[]> => {
  const response = await apiClient.get('/models');
  return response.data;
};

export const getAIModel = async (id: number): Promise<AIModel> => {
  const response = await apiClient.get(`/models/${id}`);
  return response.data;
};

// Trades API
export const getTrades = async (params?: {
  modelId?: number;
  status?: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
  limit?: number;
}): Promise<Trade[]> => {
  const response = await apiClient.get('/trades', { params });
  return response.data;
};

export const getTradesByModel = async (modelId: number): Promise<Trade[]> => {
  const response = await apiClient.get(`/trades/model/${modelId}`);
  return response.data;
};

// Positions API
export const getPositions = async (params?: {
  modelId?: number;
}): Promise<Position[]> => {
  const response = await apiClient.get('/positions', { params });
  return response.data;
};

export const getPositionsByModel = async (modelId: number): Promise<Position[]> => {
  const response = await apiClient.get(`/positions/model/${modelId}`);
  return response.data;
};

// Trading API
export const getTradingStatus = async () => {
  const response = await apiClient.get('/trading/status');
  return response.data;
};

export const runTradingCycle = async () => {
  const response = await apiClient.post('/trading/run-cycle');
  return response.data;
};

// Decision Logs API
export const getDecisionLogs = async (params?: {
  modelId?: number;
  limit?: number;
}): Promise<DecisionLog[]> => {
  const response = await apiClient.get('/decisions', { params });
  return response.data;
};

export const getDecisionLogsByModel = async (modelId: number): Promise<DecisionLog[]> => {
  const response = await apiClient.get(`/decisions/model/${modelId}`);
  return response.data;
};

export default apiClient;
