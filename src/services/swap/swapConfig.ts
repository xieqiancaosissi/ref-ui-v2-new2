import getConfig from "@/utils/config";
import getStablePoolIdConfig from "@/utils/stablePoolConfig/stablePoolIdConfig";
import getStablePoolIndexConfig from "@/utils/stablePoolConfig/stablePoolIndexConfig";
import getStablePoolTokenIdConfig from "@/utils/stablePoolConfig/stablePoolTokenIdConfig";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
export const {
  BTC_STABLE_POOL_ID,
  CUSD_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  LINEAR_POOL_ID,
  NEARX_POOL_ID,
  NEW_NEARX_POOL_ID,
  USDT_POOL_ID,
  STABLE_POOL_USN_ID,
  STABLE_POOL_ID,
  USDTT_USDCC_USDT_USDC_POOL_ID,
  USDT_USDC_POOL_ID,
  FRAX_USDC_POOL_ID,
  USDC_USDCW_POOL_ID,
  FRAX_SFRAX_POOL_ID,
} = getStablePoolIdConfig();
export const {
  BTC_STABLE_POOL_INDEX,
  CUSD_STABLE_POOL_INDEX,
  STNEAR_POOL_INDEX,
  LINEAR_POOL_INDEX,
  NEARX_POOL_INDEX,
  NEW_NEARX_POOL_INDEX,
  USDT_POOL_INDEX,
  USDTT_USDCC_USDT_USDC_POOL_INDEX,
  USDT_USDC_POOL_INDEX,
  FRAX_USDC_POOL_INDEX,
  STABLE_TOKEN_INDEX,
  STABLE_TOKEN_USN_INDEX,
  USDC_USDCW_INDEX,
  STABLE_FRAX_SFRAX_INDEX,
} = getStablePoolIndexConfig();
export const {
  STABLE_TOKEN_USN_IDS,
  STABLE_TOKEN_IDS,
  USDT_USDC_TOKEN_IDS,
  FRAX_USDC_TOKEN_IDS,
  USDTT_USDCC_USDT_USDC_TOKEN_IDS,
  DEGEN_POOLS_TOKEN_IDS,
  CUSDIDS,
  STNEARIDS,
  LINEARIDS,
  NEARXIDS,
  NEW_NEARXIDS,
  USDTIDS,
  FRAX_SFRAX_TOKEN_IDS,
  USDC_USDCW_TOKEN_IDS,
} = getStablePoolTokenIdConfig();
export const { RATED_POOLS_IDS, DEGEN_POOLS_IDS } = getStablePoolTypeConfig();
export const ALL_STABLE_POOL_IDS = [
  // used many site
  // 12
  USDTT_USDCC_USDT_USDC_POOL_ID,
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
  BTC_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  CUSD_STABLE_POOL_ID,
  LINEAR_POOL_ID,
  NEARX_POOL_ID,
  NEW_NEARX_POOL_ID,
  USDT_POOL_ID,
  USDT_USDC_POOL_ID,
  FRAX_USDC_POOL_ID,
  USDC_USDCW_POOL_ID,
  FRAX_SFRAX_POOL_ID,
]
  .filter((_) => _)
  .map((id) => id.toString());

export const getStableTokenIndex = (stable_pool_id: string | number) => {
  // used in getSwappedAmount 12
  const id = stable_pool_id.toString();
  switch (id) {
    case STABLE_POOL_ID.toString():
      return STABLE_TOKEN_INDEX;
    case STABLE_POOL_USN_ID.toString():
      return STABLE_TOKEN_USN_INDEX;
    case BTC_STABLE_POOL_ID:
      return BTC_STABLE_POOL_INDEX;
    case STNEAR_POOL_ID:
      return STNEAR_POOL_INDEX;
    case CUSD_STABLE_POOL_ID:
      return CUSD_STABLE_POOL_INDEX;
    case LINEAR_POOL_ID:
      return LINEAR_POOL_INDEX;
    case NEARX_POOL_ID:
      return NEARX_POOL_INDEX;
    case NEW_NEARX_POOL_ID:
      return NEW_NEARX_POOL_INDEX;

    case USDT_POOL_ID:
      return USDT_POOL_INDEX;
    case USDTT_USDCC_USDT_USDC_POOL_ID.toString():
      return USDTT_USDCC_USDT_USDC_POOL_INDEX;
    case USDT_USDC_POOL_ID.toString():
      return USDT_USDC_POOL_INDEX;
    case FRAX_USDC_POOL_ID.toString():
      return FRAX_USDC_POOL_INDEX;
    case FRAX_SFRAX_POOL_ID.toString():
      return STABLE_FRAX_SFRAX_INDEX;
    case USDC_USDCW_POOL_ID.toString():
      return USDC_USDCW_INDEX;
    default:
      return {};
  }
};

export const AllStableTokenIds = new Array( // 12 used many site
  ...new Set(
    LINEARIDS.concat(STNEARIDS)
      .concat(NEARXIDS)
      .concat(CUSDIDS)
      .concat(NEW_NEARXIDS)
      .concat(USDTIDS)
      .concat(STABLE_TOKEN_USN_IDS)
      .concat(STABLE_TOKEN_IDS)
      .concat(USDTT_USDCC_USDT_USDC_TOKEN_IDS)
      .concat(USDT_USDC_TOKEN_IDS)
      .concat(FRAX_USDC_TOKEN_IDS)
      .concat(DEGEN_POOLS_TOKEN_IDS)
      .concat(FRAX_SFRAX_TOKEN_IDS)
      .concat(USDC_USDCW_TOKEN_IDS)
      .filter((_) => !!_)
  )
);
