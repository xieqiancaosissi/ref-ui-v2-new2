import getConfig from "@/utils/config";
import { getAccount } from "@/utils/near";
import { getAccountId } from "@/utils/wallet";
import { ftGetTokenMetadata } from "./token";
import Big from "big.js";
import { refFiViewFunction } from "@/utils/contract";
import { shrinkToken } from "./burrow-utils";
import { IToken } from "./burrow-interfaces";
const { BURROW_CONTRACT_ID } = getConfig();
const lpTokenPrefix = "shadow_ref_v1";
export const burrowViewFunction = async ({
  methodName,
  args,
}: {
  methodName: string;
  args?: object;
}) => {
  const account = await getAccount();
  return account.viewFunction({
    contractId: BURROW_CONTRACT_ID,
    methodName,
    args,
  });
};

export async function getAccount_all_positions() {
  const accountId = getAccountId();
  return await burrowViewFunction({
    methodName: "get_account_all_positions",
    args: {
      account_id: accountId,
    },
  });
}

export async function getAssets() {
  const assets = await burrowViewFunction({ methodName: "get_assets_paged" });
  const tokenIds = assets?.map(([id]: [string, any]) => id);
  const tokenIds_lp = tokenIds?.filter((token_id: string) =>
    token_id.includes(lpTokenPrefix)
  );
  const tokenIds_normal = tokenIds?.filter(
    (token_id: string) => !token_id.includes(lpTokenPrefix)
  );
  const assetsDetailedRequest = tokenIds.map(async (token_id: string) =>
    burrowViewFunction({
      methodName: "get_asset",
      args: {
        token_id,
      },
    })
  );
  const assetsDetailed = await Promise.all(assetsDetailedRequest);
  const tokensMetadataRequest = tokenIds_normal.map(async (id: string) =>
    ftGetTokenMetadata(id)
  );
  const tokensMetadata = await Promise.all(tokensMetadataRequest);
  const tokensMetadataMap = tokensMetadata.reduce(
    (acc, cur) => ({ ...acc, [cur.id]: cur }),
    {}
  );
  const config = await burrowViewFunction({ methodName: "get_config" });
  const account = await getAccount();
  const prices = await account.viewFunction({
    contractId: config?.oracle_account_id,
    methodName: "get_price_data",
  });
  const refPrices = await fetch(
    "https://raw.githubusercontent.com/NearDeFi/token-prices/main/ref-prices.json"
  ).then((r) => r.json());
  const accountId = getAccountId();
  const balances = accountId
    ? await Promise.all(
        tokenIds_normal.map((token_id: string) =>
          account.viewFunction({
            contractId: token_id,
            methodName: "ft_balance_of",
            args: {
              account_id: accountId,
            },
          })
        )
      )
    : undefined;
  const pool_ids = tokenIds_lp.map((id: string) => +id.split("-")[1]);
  // get lp asset meta
  const lptAssets = await getUnitLptAssets(pool_ids);
  const priceMap = tokenIds_normal.reduce(
    (acc: any, cur: string | number) => ({
      ...acc,
      [cur]: getPrice(cur, prices, tokensMetadataMap[cur], refPrices),
    }),
    {}
  );
  return assetsDetailed?.map((asset, i) => {
    const token_id = asset.token_id;
    const is_lp_asset = token_id.indexOf(lpTokenPrefix) > -1;
    // const price = prices?.prices?.find(
    //   (p: any) => p.asset_id === asset?.token_id
    // );
    // const usd = price
    //   ? Number(price?.price?.multiplier || 0) /
    //     10 ** ((price?.price?.decimals || 0) - tokensMetadataMap[token_id].decimals)
    //   : 0;
    const temp_temp = Big(asset.supplied.balance)
      .plus(Big(asset.reserved))
      .minus(Big(asset.borrowed.balance));
    const temp = temp_temp.minus(temp_temp.mul(0.001));
    const decimals = is_lp_asset
      ? lptAssets[token_id].decimals + asset.config.extra_decimals
      : tokensMetadataMap[token_id].decimals + asset.config.extra_decimals;
    const availableLiquidity = Number(shrinkToken(temp.toFixed(0), decimals));
    // const extraPrice = price?.price || {
    //   decimals: Number(refPrices?.[asset.token_id]?.decimal || 0),
    //   multiplier: '1',
    // };
    return {
      ...asset,
      metadata: is_lp_asset ? lptAssets[token_id] : tokensMetadataMap[token_id],
      accountBalance: accountId ? balances?.[i] : undefined,
      availableLiquidity,
      // price: is_lp_asset
      //   ? getUnitLptPrice(lptAssets[token_id].tokens, priceMap, tokensMetadataMap)
      //   : {
      //       ...extraPrice,
      //       usd: usd || parseFloat(refPrices?.[asset.token_id]?.price) || 0,
      //     },
      price: is_lp_asset
        ? getUnitLptPrice(
            lptAssets[token_id].tokens,
            priceMap,
            tokensMetadataMap
          )
        : getPrice(token_id, prices, tokensMetadataMap[token_id], refPrices),
    };
  });
}

export const getUnitLptAssets = async (pool_ids: number[]): Promise<any> => {
  return refFiViewFunction({
    methodName: "get_unit_lpt_assets",
    args: { pool_ids },
  });
};

const getPrice = (
  tokenId: any,
  priceResponse: any,
  metadata: any,
  refPrices: any
) => {
  const price =
    priceResponse.prices.find((p: any) => p.asset_id === tokenId)?.price ||
    undefined;
  if (!price) {
    return {
      decimals: Number(refPrices[tokenId]?.decimal || 0),
      multiplier: "1",
      usd: parseFloat(refPrices[tokenId]?.price) || 0,
    };
  }
  const usd =
    Number(price.multiplier) / 10 ** (price.decimals - metadata.decimals);
  return { ...price, usd };
};

const getUnitLptPrice = (
  tokens: IToken[],
  priceMap: any,
  tokensMetadataMap: any
) => {
  const lpPrice = tokens.reduce((acc, cur) => {
    const { token_id, amount } = cur;
    const metadata = tokensMetadataMap[token_id];
    const price = priceMap[token_id].usd || "0";
    const p = new Big(shrinkToken(amount, metadata.decimals))
      .mul(price)
      .plus(acc);
    return p.toFixed(8);
  }, "0");
  return { multiplier: null, decimals: null, usd: lpPrice };
};
