export function getRpcSelectorList(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "pub-testnet":
      return {
        RPC_LIST: {
          defaultRpc: {
            url: "https://rpc.testnet.near.org",
            simpleName: "official rpc",
          },
          lavaRpc: {
            url: "https://g.w.lavanet.xyz/gateway/neart/rpc-http/a6e88c7710da77f09430aacd6328efd6",
            simpleName: "lava rpc",
          },
        },
        pool_protocol: "indexer",
      };
    case "testnet":
      return {
        RPC_LIST: {
          defaultRpc: {
            url: "https://rpc.testnet.near.org",
            simpleName: "official rpc",
          },
          lavaRpc: {
            url: "https://g.w.lavanet.xyz/gateway/neart/rpc-http/a6e88c7710da77f09430aacd6328efd6",
            simpleName: "lava rpc",
          },
        },
        pool_protocol: "indexer",
      };
    default:
      return {
        RPC_LIST: {
          defaultRpc: {
            url: "https://rpc.mainnet.near.org",
            simpleName: "official rpc",
          },
          adaptiveRPC: null,
          lavaRpc: {
            url: "https://near.lava.build",
            simpleName: "lava rpc",
          },
          betaRpc: {
            url: "https://beta.rpc.mainnet.near.org",
            simpleName: "official beta rpc",
          },
          fastnearRpc: {
            url: "https://free.rpc.fastnear.com",
            simpleName: "fastnear rpc",
          },
        },
        pool_protocol: "indexer",
      };
  }
}
export const adaptive_rpc = {
  adaptiveRPC: {
    simpleName: "adaptive rpc",
    url: "",
  },
};
export function getCustomAddRpcSelectorList() {
  let customRpcMapStr: string | null = null;
  try {
    customRpcMapStr = window.localStorage.getItem("customRpcList");
  } catch (error) {}

  let customRpcMap: CustomRpcMap = {};
  if (customRpcMapStr) {
    try {
      customRpcMap = JSON.parse(customRpcMapStr);
    } catch (error) {}
  }
  return customRpcMap;
}

export function getAdaptiveRpc() {
  try {
    const adapterInStorage = window.localStorage.getItem("adaptiveRPC");
    if (adapterInStorage) {
      adaptive_rpc.adaptiveRPC.url = adapterInStorage;
      return adaptive_rpc;
    }
    return adaptive_rpc;
  } catch (error) {
    return {};
  }
}
export const getRPCList = (excludeAdapter = false) => {
  const RPCLIST_system = getRpcSelectorList().RPC_LIST;
  const RPCLIST_custom = getCustomAddRpcSelectorList();
  // if (excludeAdapter) {
  delete RPCLIST_system.adaptiveRPC;
  const RPCLIST = Object.assign(RPCLIST_system, RPCLIST_custom);
  // } else {
  //   const RPC_adapter = getAdaptiveRpc() as any;
  //   RPCLIST_system.adaptiveRPC = RPC_adapter.adaptiveRPC;
  //   RPCLIST = Object.assign(RPCLIST_system, RPCLIST_custom);
  // }
  return RPCLIST;
};

export function getSelectedRpc() {
  const rpclist = getRPCList();
  let endPoint = "defaultRpc";
  try {
    endPoint = window.localStorage.getItem("endPoint") || endPoint;
    const adaptive_url = getBusinessAdaptiveRpcInStorage();
    if (endPoint == "adaptiveRPC") {
      return {
        simpleName: adaptive_rpc.adaptiveRPC.simpleName,
        url: adaptive_url,
      };
    } else if (!rpclist[endPoint]) {
      endPoint = "defaultRpc";
      localStorage.removeItem("endPoint");
    }
  } catch (error) {}
  return rpclist[endPoint];
}

export function getBusinessAdaptiveRpcInStorage() {
  const url = localStorage.getItem("adaptiveRPC");
  if (window.adaptiveRPC) return window.adaptiveRPC;
  window.adaptiveRPC = url;
  return url;
}
export function getRpcKeyByUrl(url: string) {
  const rpcList = getRPCList(true);
  const finded = Object.entries(rpcList).find(([, o]: any) => o?.url == url);
  if (finded) {
    return finded[0];
  }
}

export function updateAdaptiveRpcInStorage(url: string) {
  localStorage.setItem("adaptiveRPC", url);
}

type CustomRpcEntry = {
  url: string;
  simpleName: string;
  custom: boolean;
};

type CustomRpcMap = Record<string, CustomRpcEntry>;
