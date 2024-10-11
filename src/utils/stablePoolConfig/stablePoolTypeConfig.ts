export default function getStablePoolTypeConfig(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "mainnet":
      return {
        RATED_POOLS_IDS: [
          "3514",
          "3515",
          "3612",
          "3688",
          "3689",
          "4179",
          "4513",
          "4514",
          "5219",
          "5029",
        ],
        DEGEN_POOLS_IDS: [],
        STABLE_POOL_IDS: ["1910", "3020", "3364", "3433"],
      };
    case "pub-testnet":
      return {
        RATED_POOLS_IDS: ["568", "571", "1044", "1751", "1752", "1843", "1919"],
        DEGEN_POOLS_IDS: ["2022", "2031", "2065"],
        STABLE_POOL_IDS: ["218", "356", "456", "494"],
      };
    case "testnet":
      return {
        RATED_POOLS_IDS: ["621", "622", "666", "685", "686", "711"],
        DEGEN_POOLS_IDS: ["736"],
        STABLE_POOL_IDS: ["79", "603", "604", "608"],
      };
    default:
      return {
        RATED_POOLS_IDS: [
          "3514",
          "3515",
          "3612",
          "3688",
          "3689",
          "4179",
          "4513",
          "4514",
          "5219",
          "5029",
        ],
        DEGEN_POOLS_IDS: [],
        STABLE_POOL_IDS: ["1910", "3020", "3364", "3433"],
      };
  }
}
