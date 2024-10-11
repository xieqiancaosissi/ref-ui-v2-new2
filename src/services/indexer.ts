import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
import { parsePoolView } from "./api";
import { PoolRPCView } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import {
  TokenPairRate,
  OrderTxType,
  HistoryOrderSwapInfo,
} from "@/interfaces/limit";
import moment from "moment";
import { getAccountId } from "@/utils/wallet";
const config = getConfig();

const genUrlParams = (props: Record<string, string | number>) => {
  return Object.keys(props)
    .map((key) => key + "=" + props[key])
    .join("&");
};
export const currentRefPrice = async (): Promise<any> => {
  return await fetch(
    getConfig().indexerUrl +
      "/get-token-price?token_id=token.v2.ref-finance.near",
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-token-price"),
      },
    }
  )
    .then((res) => res.json())
    .then((priceBody) => {
      return priceBody.price;
    })
    .catch(() => {
      return "-";
    });
};

export const getTokenPriceList = async (): Promise<any> => {
  return await fetch(config.indexerUrl + "/list-token-price", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-token-price"),
    },
  })
    .then((res) => res.json())
    .then((list) => {
      return list;
    });
};

export const getTokens = async () => {
  return await fetch(getConfig().indexerUrl + "/list-token", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-token"),
    },
  })
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};

export const getPoolsByIds = async ({
  pool_ids,
}: {
  pool_ids: string[];
}): Promise<PoolRPCView[]> => {
  const ids = pool_ids.join("|");
  if (!ids) return [];
  return fetch(getConfig().indexerUrl + "/list-pools-by-ids?ids=" + ids, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-pools-by-ids"),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));
      return pools;
    })
    .catch(() => {
      return [];
    });
};

export const get24hVolumes = async (
  pool_ids: (string | number)[]
): Promise<string[]> => {
  const batchSize = 300;
  const numBatches = Math.ceil(pool_ids.length / batchSize);
  const promises: Promise<string[]>[] = [];

  for (let i = 0; i < numBatches; i++) {
    const batchIds = pool_ids.slice(i * batchSize, (i + 1) * batchSize);
    const promise = fetch(
      config.dataServiceApiUrl +
        `/poollist/${batchIds.join("|")}/24hvolume/sum`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          ...getAuthenticationHeaders(
            `/api/poollist/${batchIds.join("|")}/24hvolume/sum`
          ),
        },
      }
    )
      .then((res) => res.json())
      .then((batchData) => batchData.map((r: any) => r.toString()));

    promises.push(promise);
  }

  const results = await Promise.all(promises);
  return results.flat();
};

export const getTopPools = async (): Promise<PoolRPCView[]> => {
  const listTopPools = await fetch(config.indexerUrl + "/list-top-pools", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-top-pools"),
    },
  })
    .then((res) => res.json())
    .catch(() => []);
  return listTopPools;
};

export const getTxId = async (receipt_id: string) => {
  return await fetch(config.txIdApiUrl + `/v1/search/?keyword=${receipt_id}`)
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return [];
    });
};

export const getDclPoolPoints = async (
  pool_id: string,
  bin: number,
  start_point: number,
  end_point: number
) => {
  return await fetch(
    config.indexerUrl +
      `/get-dcl-points?pool_id=${pool_id}&slot_number=${bin}&start_point=${start_point}&end_point=${end_point}`,
    {
      headers: getAuthenticationHeaders("/get-dcl-points"),
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return {};
    });
};
export const getDclUserPoints = async (
  pool_id: string,
  bin: number,
  account_id: string
) => {
  return await fetch(
    config.indexerUrl +
      `/get-dcl-points-by-account?pool_id=${pool_id}&slot_number=${bin}&account_id=${account_id}`,
    {
      headers: getAuthenticationHeaders("/get-dcl-points-by-account"),
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return [];
    });
};

export interface DCLPoolFee {
  total_fee: string;
  total_liquidity: string;
}

export const getDCLAccountFee = async (props: {
  pool_id: string | number;
  account_id: string | number;
}): Promise<DCLPoolFee> => {
  const paramString = genUrlParams(props);
  try {
    return await fetch(
      config.indexerUrl + `/get-fee-by-account?${paramString}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          ...getAuthenticationHeaders("/get-fee-by-account"),
        },
      }
    ).then((res) => res.json());
  } catch (error) {
    return {
      total_fee: "",
      total_liquidity: "",
    };
  }
};

export const getDCLAccountFeeBatch = async (props: {
  pool_id: Array<string | number>;
  account_id: string | number;
}): Promise<DCLPoolFee> => {
  // const paramString = genUrlParams(props);
  const paramString = `pool_ids=${props.pool_id.join(",")}&account_id=${
    props.account_id
  }`;
  try {
    return await fetch(
      config.indexerUrl + `/batch-get-fee-by-account?${paramString}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          ...getAuthenticationHeaders("/batch-get-fee-by-account"),
        },
      }
    ).then((res) => res.json());
  } catch (error) {
    return {
      total_fee: "",
      total_liquidity: "",
    };
  }
};

export interface DCLPoolSwapTransaction {
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
  tx_id: string;
  receipt_id: string;
}

export const getDCLPoolSwapRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-dcl-swap?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-dcl-swap"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: DCLPoolSwapTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

const parsePoolTxTimeStamp = (ts: string) => {
  return moment(Math.floor(Number(ts) / 1000000)).format("YYYY-MM-DD HH:mm:ss");
};

export interface DCLPoolLiquidtyRecentTransaction {
  method_name: string;
  amount_x: string;
  amount_y: string;
  timestamp: string;
  tx_id: string;
  receipt_id: string;
}

export const getDCLPoolLiquidtyRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-dcl-liquidity?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-dcl-liquidity"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: DCLPoolLiquidtyRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface LimitOrderRecentTransaction {
  method_name: string;
  timestamp: string;
  amount: string;
  tx_id: string;
  point: string;
  sell_token: string;
  receipt_id: string;
}

export const getLimitOrderRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-limit-order?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-limit-order"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: LimitOrderRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface DCLPoolFee {
  total_fee: string;
  total_liquidity: string;
}

export const getDCLTopBinFee = async (props: {
  pool_id: string;
  bin: number;
  start_point: number;
  end_point: number;
}): Promise<DCLPoolFee> => {
  const { pool_id, bin, start_point, end_point } = props;
  const result = await getDclPoolPoints(pool_id, bin, start_point, end_point);
  return result?.top_bin_fee_data;
};
export const getTokenPairRate = async ({
  token,
  base_token,
  dimension,
}: {
  token: TokenMetadata;
  base_token: TokenMetadata;
  dimension: "Y" | "M" | "W" | "D" | "All";
}): Promise<TokenPairRate> => {
  return await fetch(
    config.indexerUrl +
      `/token-price-report?token=${token.id}&base_token=${base_token.id}&dimension=${dimension}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/token-price-report"),
      },
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return {
        ...data,
        price_list: data.price_list.map((item: any) => ({
          price: Number(item.price),
          date_time: item.date_time * 1000,
        })),
      };
    })

    .catch(() => {
      return {
        symbol: token.symbol,
        contract_address: token.id,
        price_list: [],
      };
    });
};
export const getHistoryOrder = async (
  account_id: string
): Promise<OrderTxType[]> => {
  return await fetch(
    config.indexerUrl + `/get-limit-order-log-by-account/${account_id}`,
    {
      method: "GET",
      headers: getAuthenticationHeaders(
        `/get-limit-order-log-by-account/${account_id}`
      ),
    }
  ).then((res) => res.json());
};
export const getHistoryOrderSwapInfo = async (
  account_id: string
): Promise<HistoryOrderSwapInfo[]> => {
  return await fetch(
    config.indexerUrl + `/get-limit-order-swap-by-account/${account_id}`,
    {
      method: "GET",
      headers: getAuthenticationHeaders(
        `/get-limit-order-swap-by-account/${account_id}`
      ),
    }
  ).then((res) => res.json());
};

export const getYourPools = async (): Promise<PoolRPCView[]> => {
  const account_id = getAccountId();
  return await fetch(config.indexerUrl + "/liquidity-pools/" + account_id, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders(`/liquidity-pools/${account_id}`),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      return pools;
    });
};

export const getLimitOrderLogsByAccount = async (): Promise<any[]> => {
  const account_id = getAccountId();
  return await fetch(
    config.indexerUrl + `/get-limit-order-log-by-account/${account_id}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders(
          `/get-limit-order-log-by-account/${account_id}`
        ),
      },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list;
    })
    .catch(() => {
      return [];
    });
};

export const getAssets = async (dateType: "M" | "W" | "H" | "ALL" = "H") => {
  const accountId = getAccountId();
  return await fetch(
    config.indexerUrl +
      "/get-assets-by-account?" +
      `account_id=${accountId}&dimension=${dateType}`,
    {
      method: "GET",
      headers: getAuthenticationHeaders("/get-assets-by-account"),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return [];
    });
};
export const addUserWallet = async (params: any) => {
  return await fetch(config.indexerUrl + "/add-user-wallet", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/add-user-wallet"),
    },
    body: JSON.stringify(params),
  }).catch(async (res) => {
    console.log("add user wallet failed", res);
  });
};
export const getAd = async () => {
  return await fetch(config.indexerUrl + "/v3/ad", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/v3/ad"),
    },
  })
    .then((res) => res.json())
    .then((res) => {
      return res.data || [];
    })
    .catch(() => {
      return [];
    });
};
export const checkIn = async (account_id: string) => {
  return await fetch(
    config.indexerUrl +
      `/v3/meme-farming/season/check-in?account_id=${account_id}`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/v3/meme-farming/season/check-in"),
      },
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return [];
    });
};
