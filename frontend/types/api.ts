export type StrategyStatus = 'running' | 'stopped' | 'error';

export interface Strategy {
  id: string;
  name: string;
  status: StrategyStatus;
  created_at?: string;
  updated_at?: string;
  description?: string;
  metrics?: {
    win_rate?: number;
    pnl?: number;
    trades?: number;
  };
}

export interface ToggleResponse {
  id: string;
  status: StrategyStatus;
  message?: string;
}

export interface BrokerProfile {
  client_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  segment?: string[];
  balance?: number;
  broker?: string; // e.g., "DhanHQ"
  raw?: any;
}

export interface Holding {
  symbol: string;
  qty: number;
  avg_price: number;
  ltp?: number;
  pnl?: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
  product?: string;
  qty: number;
  avg_price: number;
  ltp?: number;
  pnl?: number;
}

export interface Execution {
  id: string;
  strategy_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  status: 'FILLED' | 'PARTIAL' | 'REJECTED' | 'CANCELLED' | 'OPEN';
  timestamp: string; // ISO
  order_id?: string;
  exchange?: string;
}
