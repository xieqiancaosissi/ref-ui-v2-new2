export default function getStablePoolIdConfig(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "mainnet":
      return {
        BTC_STABLE_POOL_ID: "3364",
        CUSD_STABLE_POOL_ID: "3433",
        STNEAR_POOL_ID: "3514",
        LINEAR_POOL_ID: "3515",
        NEARX_POOL_ID: "3612",
        NEW_NEARX_POOL_ID: "3688",
        USDT_POOL_ID: "3689",
        STABLE_POOL_USN_ID: 3020,
        STABLE_POOL_ID: 1910,
        USDTT_USDCC_USDT_USDC_POOL_ID: 4179,
        USDT_USDC_POOL_ID: 4513,
        FRAX_USDC_POOL_ID: 4514,
        USDC_USDCW_POOL_ID: 5219,
        FRAX_SFRAX_POOL_ID: 5029,
      };
    case "pub-testnet":
      return {
        BTC_STABLE_POOL_ID: "456",
        CUSD_STABLE_POOL_ID: "494",
        STNEAR_POOL_ID: "568",
        LINEAR_POOL_ID: "571",
        NEARX_POOL_ID: "1044",
        NEW_NEARX_POOL_ID: "1751",
        USDT_POOL_ID: "1752",
        STABLE_POOL_ID: 218,
        STABLE_POOL_USN_ID: 356,
        USDTT_USDCC_USDT_USDC_POOL_ID: 1843,
      };
    case "testnet":
      return {
        BTC_STABLE_POOL_ID: "604",
        CUSD_STABLE_POOL_ID: "608",
        STNEAR_POOL_ID: "621",
        LINEAR_POOL_ID: "622",
        NEARX_POOL_ID: "666",
        NEW_NEARX_POOL_ID: "685",
        USDT_POOL_ID: "686",
        STABLE_POOL_ID: 79,
        STABLE_POOL_USN_ID: 603,
        USDTT_USDCC_USDT_USDC_POOL_ID: 711,
      };
    default:
      return {
        BTC_STABLE_POOL_ID: "3364",
        CUSD_STABLE_POOL_ID: "3433",
        STNEAR_POOL_ID: "3514",
        LINEAR_POOL_ID: "3515",
        NEARX_POOL_ID: "3612",
        NEW_NEARX_POOL_ID: "3688",
        USDT_POOL_ID: "3689",
        STABLE_POOL_USN_ID: 3020,
        STABLE_POOL_ID: 1910,
        USDTT_USDCC_USDT_USDC_POOL_ID: 4179,
        USDT_USDC_POOL_ID: 4513,
        FRAX_USDC_POOL_ID: 4514,
        USDC_USDCW_POOL_ID: 5219,
        FRAX_SFRAX_POOL_ID: 5029,
      };
  }
}
