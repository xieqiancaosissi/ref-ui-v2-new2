import { TokenMetadata } from "@/services/ft-contract";
import { RefFiFunctionCallOptions } from "@/utils/contract";
export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  pool_kind: string;
  update_time?: number;
  token_symbols?: string[];
  tvl?: string;
}

export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  shareSupply: string;
  fee: number;
  pool_kind: string;
  tvl?: string;
  partialAmountIn?: string;
  rates?: {
    [id: string]: string;
  };
  Dex?: string;
  pairAdd?: string;
  token0_ref_price?: string;
  source?: IPoolSource;
}

export interface IPoolsByTokens {
  id: number;
  token1Id: string;
  token2Id: string;
  token1Supply: string;
  token2Supply: string;
  fee: number;
  shares: string;
  update_time: number;
  pool_kind: string;
  Dex?: string;
  pairAdd?: string;
  tvl?: string;
}
export interface StablePool {
  id: number;
  token_account_ids: string[];
  decimals: number[];
  amounts: string[];
  c_amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  amp: number;
  rates: string[];
  update_time?: number;
  degens: string[];
}
export interface ReservesMap {
  [index: string]: string;
}
export type SwapContractType = "Ref_Classic" | "Ref_DCL" | "Trisolaris";
export enum PoolMode {
  PARALLEL = "parallel swap",
  SMART = "smart routing",
  SMART_V2 = "stableSmart",
  STABLE = "stable swap",
}
export enum SWAP_MODE {
  NORMAL = "normal",
  LIMIT = "limit",
}
export interface RoutePool {
  amounts: string[];
  fee: number;
  id: number;
  reserves: ReservesMap;
  shares: string;
  token0_ref_price: string;
  token1Id: string;
  token1Supply: string;
  token2Id: string;
  token2Supply: string;
  updateTime: number;
  partialAmountIn?: string | number | Big;
  gamma_bps?: Big;
  supplies?: ReservesMap;
  tokenIds?: string[];
  x?: string;
  y?: string;
}
export interface EstimateSwapView {
  estimate: string;
  pool: Pool | null;
  intl?: any;
  partialAmountIn?: string;
  dy?: string;
  status?: PoolMode;
  token?: TokenMetadata;
  noFeeAmountOut?: string;
  inputToken?: string;
  outputToken?: string;
  nodeRoute?: string[];
  tokens?: TokenMetadata[];
  routeInputToken?: string;
  routeOutputToken?: string;
  route?: RoutePool[];
  allRoutes?: RoutePool[][];
  allNodeRoutes?: string[][];
  totalInputAmount?: string;
  overallPriceImpact?: string;
  contract?: SwapContractType;
  percent?: string;
}
export interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  supportLedger: boolean;
  hideLowTvlPools: boolean;
}

export interface EstimateSwapParams {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  swapMode?: SWAP_MODE;
  supportLedger?: boolean;
  swapPro?: boolean;
  setSwapsToDoTri?: (todos: EstimateSwapView[]) => void;
  setSwapsToDoRef?: (todos: EstimateSwapView[]) => void;
  proGetCachePool?: boolean;
}

export interface IEstimateResult {
  swapError?: Error | undefined;
  swapsToDo?: IEstimateScriptResult | undefined;
  swapsToDoServer?: IEstimateServerResult | undefined;
  quoteDone?: boolean;
  tag?: string;
  is_near_wnear_swap?: boolean;
}
export interface IEstimateScriptResult {
  estimates: EstimateSwapView[];
  source: "script";
  tag: string;
}
export interface IEstimateServerResult {
  estimatesFromServer: IEstimateSwapServerView;
  source: "server";
  tag: string;
  poolsMap: Record<string, any>;
  tokensMap: Record<string, TokenMetadata>;
}

export type SwapMarket = "ref" | "tri" | undefined;
export interface SwapOptions {
  swapsToDo?: EstimateSwapView[];
  swapsToDoServer?: IEstimateSwapServerView;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  slippageTolerance?: number;
  swapMarket?: SwapMarket;
}
export interface nearSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
}
export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export type IButtonStatus =
  | "walletLoading"
  | "unLogin"
  | "available"
  | "insufficient"
  | "disabled";

export type IBest = "v1" | "v3" | "";

export interface IAddLiquidityInfo {
  pool_id: string;
  left_point: number;
  right_point: number;
  amount_x: string;
  amount_y: string;
  min_amount_x: string;
  min_amount_y: string;
}
export interface IAddLiquidityInfoHelp {
  [key: number]: {
    left_point: number;
    right_point: number;
    const_value: string;
  };
}

export type LiquidityShape = "Spot" | "Curve" | "BidAsk";
export type PriceRangeModeType = "by_range" | "by_radius";
export interface IRemoveLiquidityInfo {
  lpt_id: string;
  amount: string;
  min_amount_x: string;
  min_amount_y: string;
}

export interface IBatchUpdateiquidityInfo {
  remove_liquidity_infos: IRemoveLiquidityInfo[];
  add_liquidity_infos: IAddLiquidityInfo[];
}

export interface IEstimateSwapServerView {
  amount_in: string;
  amount_out: string;
  contract_in: string;
  contract_out: string;
  routes: IServerRoute[];
  contract?: string;
}
export interface IServerRoute {
  amount_in: string;
  min_amount_out: string;
  pools: IServerPool[];
  tokens: TokenMetadata[];
}
export interface IServerPool {
  amount_in?: string;
  min_amount_out: string;
  pool_id: string | number;
  token_in: string;
  token_out: string;
}
export interface IDeflation {
  rate: number;
  done: boolean;
}
export type ISource = "script" | "server";
export type IPoolSource = "indexer" | "rpc";
