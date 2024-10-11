export interface TokenPairRate {
  symbol: string;
  contract_address: string;
  price_list: PriceList[];
}
export interface PriceList {
  price: number;
  date_time: number;
}

export interface Diff {
  percent: string;
  direction: "down" | "up" | "unChange";
  curPrice: number;
  h24Hight: number;
  h24Low: number;
  lastUpdate: string;
}

export interface IOrderPoint {
  [point: string]: IOrderPointItem;
}
export interface IOrderPointItem {
  point?: number;
  amount_x?: string;
  amount_y?: string;
  price?: string;
  amount_x_readable?: string;
  amount_y_readable?: string;
  accumulated_x_readable?: string;
  accumulated_y_readable?: string;
}

export type ISwitchToken = "X" | "Y";
export type ISide = "buy" | "sell";
export interface OrderTxType {
  order_id: string;
  tx_id: string | null;
  receipt_id: string | null;
}

export interface HistoryOrderSwapInfo {
  tx_id: string;
  token_in: string;
  token_out: string;
  pool_id: string;
  point: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
  receipt_id: string;
}

export type IOrderType = "active" | "history";
export type Dimensions = "24H" | "7D" | "1M" | "1Y" | "All";
