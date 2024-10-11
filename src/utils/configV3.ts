export default function getConfigV3(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        findPathUrl: "smartrouter.ref.finance",
        SHUTDOWN_SERVER: false,
        DEFAULT_LIMIT_POOL_ID:
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1|wrap.near|2000",
      };
    case "pub-testnet":
      return {
        findPathUrl: "smartroutertest.refburrow.top",
        SHUTDOWN_SERVER: false,
        DEFAULT_LIMIT_POOL_ID: "",
      };
    case "testnet":
      return {
        findPathUrl: "smartroutertest.refburrow.top",
        SHUTDOWN_SERVER: false,
        DEFAULT_LIMIT_POOL_ID: "",
      };
    default:
      return {
        findPathUrl: "smartrouter.ref.finance",
        SHUTDOWN_SERVER: false,
        DEFAULT_LIMIT_POOL_ID:
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1|wrap.near|2000",
      };
  }
}
