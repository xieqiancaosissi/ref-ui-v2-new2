export default function getStablePoolTokenIdConfig(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "mainnet":
      return {
        STABLE_TOKEN_USN_IDS: [
          "usn",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        STABLE_TOKEN_IDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
        ],
        USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        FRAX_USDC_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        ],
        CUSDIDS: ["usn", "cusd.token.a11bd.near"],
        STNEARIDS: ["meta-pool.near", "wrap.near"],
        LINEARIDS: ["linear-protocol.near", "wrap.near"],
        NEARXIDS: ["nearx.stader-labs.near", "wrap.near"],
        USDTIDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "usdt.tether-token.near",
        ],
        NEW_NEARXIDS: ["v2-nearx.stader-labs.near", "wrap.near"],
        FRAX_SFRAX_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "a663b02cf0a4b149d2ad41910cb81e23e1c41c32.factory.bridge.near",
        ],
        USDC_USDCW_TOKEN_IDS: [
          "16.contract.portalbridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        DEGEN_POOLS_TOKEN_IDS: [],
      };
    case "pub-testnet":
      return {
        STABLE_TOKEN_IDS: [
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
          "dai.fakes.testnet",
        ],
        STABLE_TOKEN_USN_IDS: ["usdn.testnet", "usdt.fakes.testnet"],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdtt.fakes.testnet",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
        ],
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        CUSDIDS: ["usdn.testnet", "cusd.fakes.testnet"],
        STNEARIDS: ["meta-v2.pool.testnet", "wrap.testnet"],
        LINEARIDS: ["linear-protocol.testnet", "wrap.testnet"],
        NEARXIDS: ["nearx.staderlabs.testnet", "wrap.testnet"],
        USDTIDS: ["usdt.fakes.testnet", "usdtt.fakes.testnet"],
        NEW_NEARXIDS: ["v2-nearx.staderlabs.testnet", "wrap.testnet"],
        DEGEN_POOLS_TOKEN_IDS: [
          "eth.ft.ref-labs.testnet",
          "usdtt.ft.ref-labs.testnet",
          "usdcc.ft.ref-labs.testnet",
          "usdte.ft.ref-labs.testnet",
          "usdce.ft.ref-labs.testnet",
          "wrap.testnet",
          "usdcc.ft.ref-labs.testnet",
        ],
        FRAX_SFRAX_TOKEN_IDS: [],
        USDC_USDCW_TOKEN_IDS: [],
      };
    case "testnet":
      return {
        STABLE_TOKEN_IDS: [
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
          "dai.fakes.testnet",
        ],

        STABLE_TOKEN_USN_IDS: ["usdn.testnet", "usdt.fakes.testnet"],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdtt.fakes.testnet",
          "usdcc.fakes.testnet",
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
        ],
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        DEGEN_POOLS_TOKEN_IDS: [
          "eth.ft.ref-labs.testnet",
          "usdtt.ft.ref-labs.testnet",
          "usdcc.ft.ref-labs.testnet",
          "usdte.ft.ref-labs.testnet",
          "usdce.ft.ref-labs.testnet",
          "wrap.testnet",
          "usdcc.ft.ref-labs.testnet",
        ],
        CUSDIDS: ["usdn.testnet", "cusd.fakes.testnet"],
        STNEARIDS: ["meta-v2.pool.testnet", "wrap.testnet"],
        LINEARIDS: ["linear-protocol.testnet", "wrap.testnet"],
        NEARXIDS: ["nearx.staderlabs.testnet", "wrap.testnet"],
        NEW_NEARXIDS: ["v2-nearx.staderlabs.testnet", "wrap.testnet"],
        USDTIDS: ["usdt.fakes.testnet", "usdtt.fakes.testnet"],
        FRAX_SFRAX_TOKEN_IDS: [],
        USDC_USDCW_TOKEN_IDS: [],
      };
    default:
      return {
        STABLE_TOKEN_USN_IDS: [
          "usn",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        STABLE_TOKEN_IDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
        ],
        USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        FRAX_USDC_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        ],
        CUSDIDS: ["usn", "cusd.token.a11bd.near"],
        STNEARIDS: ["meta-pool.near", "wrap.near"],
        LINEARIDS: ["linear-protocol.near", "wrap.near"],
        NEARXIDS: ["nearx.stader-labs.near", "wrap.near"],
        NEW_NEARXIDS: ["v2-nearx.stader-labs.near", "wrap.near"],
        USDTIDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "usdt.tether-token.near",
        ],
        FRAX_SFRAX_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "a663b02cf0a4b149d2ad41910cb81e23e1c41c32.factory.bridge.near",
        ],
        USDC_USDCW_TOKEN_IDS: [
          "16.contract.portalbridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        DEGEN_POOLS_TOKEN_IDS: [],
      };
  }
}
