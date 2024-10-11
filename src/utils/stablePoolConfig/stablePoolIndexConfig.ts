export default function getStablePoolIndexConfig(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "mainnet":
      return {
        BTC_STABLE_POOL_INDEX: {
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near": 0,
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near": 1,
        },
        CUSD_STABLE_POOL_INDEX: {
          usn: 0,
          "cusd.token.a11bd.near": 1,
        },
        STNEAR_POOL_INDEX: {
          "meta-pool.near": 0,
          "wrap.near": 1,
        },
        LINEAR_POOL_INDEX: {
          "linear-protocol.near": 0,
          "wrap.near": 1,
        },
        NEARX_POOL_INDEX: {
          "nearx.stader-labs.near": 0,
          "wrap.near": 1,
        },
        NEW_NEARX_POOL_INDEX: {
          "v2-nearx.stader-labs.near": 0,
          "wrap.near": 1,
        },
        USDT_POOL_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "usdt.tether-token.near": 1,
        },
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          "usdt.tether-token.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 2,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 3,
        },
        USDT_USDC_POOL_INDEX: {
          "usdt.tether-token.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
        FRAX_USDC_POOL_INDEX: {
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
        STABLE_TOKEN_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 1,
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": 2,
        },
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 1,
        },
        STABLE_FRAX_SFRAX_INDEX: {
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near": 0,
          "a663b02cf0a4b149d2ad41910cb81e23e1c41c32.factory.bridge.near": 1,
        },
        USDC_USDCW_INDEX: {
          "16.contract.portalbridge.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
      };
    case "pub-testnet":
      return {
        BTC_STABLE_POOL_INDEX: {
          "wbtc.fakes.testnet": 0,
          "hbtc.fakes.testnet": 1,
        },
        CUSD_STABLE_POOL_INDEX: {
          "usdn.testnet": 0,
          "cusd.fakes.testnet": 1,
        },
        STNEAR_POOL_INDEX: {
          "meta-v2.pool.testnet": 0,
          "wrap.testnet": 1,
        },
        LINEAR_POOL_INDEX: {
          "linear-protocol.testnet": 0,
          "wrap.testnet": 1,
        },
        NEARX_POOL_INDEX: {
          "nearx.staderlabs.testnet": 0,
          "wrap.testnet": 1,
        },
        NEW_NEARX_POOL_INDEX: {
          "v2-nearx.staderlabs.testnet": 0,
          "wrap.testnet": 1,
        },
        USDT_POOL_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdtt.fakes.testnet": 1,
        },
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          "usdtt.fakes.testnet": 0,
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af": 1,
          "usdt.fakes.testnet": 2,
          "usdc.fakes.testnet": 3,
        },
        USDT_USDC_POOL_INDEX: {},
        FRAX_USDC_POOL_INDEX: {},
        STABLE_TOKEN_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdc.fakes.testnet": 1,
          "dai.fakes.testnet": 2,
        },
        STABLE_TOKEN_USN_INDEX: {
          "usdn.testnet": 0,
          "usdt.fakes.testnet": 1,
        },
      };
    case "testnet":
      return {
        BTC_STABLE_POOL_INDEX: {
          "wbtc.fakes.testnet": 0,
          "hbtc.fakes.testnet": 1,
        },
        CUSD_STABLE_POOL_INDEX: {
          "usdn.testnet": 0,
          "cusd.fakes.testnet": 1,
        },
        STNEAR_POOL_INDEX: {
          "meta-v2.pool.testnet": 0,
          "wrap.testnet": 1,
        },
        LINEAR_POOL_INDEX: {
          "linear-protocol.testnet": 0,
          "wrap.testnet": 1,
        },
        NEARX_POOL_INDEX: {
          "nearx.staderlabs.testnet": 0,
          "wrap.testnet": 1,
        },
        NEW_NEARX_POOL_INDEX: {
          "v2-nearx.staderlabs.testnet": 0,
          "wrap.testnet": 1,
        },
        USDT_POOL_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdtt.fakes.testnet": 1,
        },
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          "usdtt.fakes.testnet": 0,
          "usdcc.fakes.testnet": 1,
          "usdt.fakes.testnet": 2,
          "usdc.fakes.testnet": 3,
        },
        USDT_USDC_POOL_INDEX: {},
        FRAX_USDC_POOL_INDEX: {},
        STABLE_TOKEN_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdc.fakes.testnet": 1,
          "dai.fakes.testnet": 2,
        },
        STABLE_TOKEN_USN_INDEX: {
          "usdn.testnet": 0,
          "usdt.fakes.testnet": 1,
        },
      };
    default:
      return {
        BTC_STABLE_POOL_INDEX: {
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near": 0,
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near": 1,
        },
        CUSD_STABLE_POOL_INDEX: {
          usn: 0,
          "cusd.token.a11bd.near": 1,
        },
        STNEAR_POOL_INDEX: {
          "meta-pool.near": 0,
          "wrap.near": 1,
        },
        LINEAR_POOL_INDEX: {
          "linear-protocol.near": 0,
          "wrap.near": 1,
        },
        NEARX_POOL_INDEX: {
          "nearx.stader-labs.near": 0,
          "wrap.near": 1,
        },
        NEW_NEARX_POOL_INDEX: {
          "v2-nearx.stader-labs.near": 0,
          "wrap.near": 1,
        },
        USDT_POOL_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "usdt.tether-token.near": 1,
        },
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          "usdt.tether-token.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 2,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 3,
        },
        USDT_USDC_POOL_INDEX: {
          "usdt.tether-token.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
        FRAX_USDC_POOL_INDEX: {
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
        STABLE_TOKEN_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 1,
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": 2,
        },
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 1,
        },
        STABLE_FRAX_SFRAX_INDEX: {
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near": 0,
          "a663b02cf0a4b149d2ad41910cb81e23e1c41c32.factory.bridge.near": 1,
        },
        USDC_USDCW_INDEX: {
          "16.contract.portalbridge.near": 0,
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1": 1,
        },
      };
  }
}
