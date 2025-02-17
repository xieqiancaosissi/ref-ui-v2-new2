import {
  bridgedETH,
  bridgedNEAR,
  naturalETH,
  naturalNEAR,
} from "@near-eth/near-ether";
import { bridgedNep141, naturalErc20 } from "@near-eth/nep141-erc20";
import Big from "big.js";
import { BridgeConfig } from "@/config/bridge";
import { evmServices } from "./contract";
import { decorate, get, Transfer } from "@near-eth/client";
import { BridgeTransferParams } from ".";
import { getTokenDecimals } from "@/utils/token";

const rainbowBridgeService = {
  getBridgeInstance({
    token,
    from,
  }: {
    token: BridgeModel.BridgeTokenMeta;
    from: BridgeModel.BridgeSupportChain;
  }) {
    if (from === "NEAR" && !token.addresses.Ethereum && token.symbol === "ETH")
      return { bridgedETH };
    //   nep141 to eth
    else if (
      from === "NEAR" &&
      !!token.addresses.NEAR &&
      !!token.addresses.Ethereum &&
      token.symbol !== "NEAR"
    )
      return { bridgedNep141 };
    else if (from === "NEAR" && token.symbol === "NEAR") return { naturalNEAR };
    //   erc20 to nep141
    else if (
      from === "Ethereum" &&
      !!token.addresses.Ethereum &&
      !!token.addresses.NEAR &&
      token.symbol !== "NEAR"
    )
      return { naturalErc20 };
    else if (from === "Ethereum" && token.symbol === "NEAR")
      return { bridgedNEAR };
    else if (
      from === "Ethereum" &&
      !token.addresses.Ethereum &&
      token.symbol === "ETH"
    )
      return { naturalETH };
  },
  async transfer({
    tokenIn,
    tokenOut,
    amount: amountIn,
    sender,
    from,
    recipient,
  }: BridgeTransferParams) {
    if (from !== "NEAR" && tokenIn.addresses.Ethereum) {
      await evmServices.checkErc20Approve({
        token: tokenIn.addresses.Ethereum,
        amount: amountIn,
        owner: sender,
        spender: BridgeConfig.Rainbow.bridgeParams.erc20LockerAddress,
      });
    }

    const nearAccount = (await window.selector?.wallet()) as any;

    const amount = new Big(amountIn)
      .times(10 ** getTokenDecimals(tokenIn.symbol, from))
      .toFixed();

    const instance = rainbowBridgeService.getBridgeInstance({
      token: tokenIn,
      from,
    });

    let result;
    if (instance.bridgedETH)
      result = await instance.bridgedETH.sendToEthereum({
        amount,
        recipient,
        options: {
          sender,
          nearAccount,
        },
      });
    else if (instance.bridgedNep141)
      result = await instance.bridgedNep141.sendToEthereum({
        erc20Address: tokenIn.addresses.Ethereum,
        amount,
        recipient,
        options: {
          sender,
          symbol: tokenIn.symbol,
          decimals: getTokenDecimals(tokenIn.symbol, "NEAR"),
          nep141Address: tokenIn.addresses.NEAR,
          nearAccount,
        },
      });
    else if (instance.naturalNEAR)
      result = await instance.naturalNEAR.sendToEthereum({
        recipient,
        amount,
        options: {
          sender,
          nearAccount,
        },
      });
    else if (instance.naturalErc20)
      result = await instance.naturalErc20.sendToNear({
        erc20Address: tokenIn.addresses.Ethereum,
        amount,
        recipient,
        options: {
          sender,
        },
      });
    else if (instance.bridgedNEAR)
      result = await instance.bridgedNEAR.sendToNear({
        amount,
        recipient,
        options: {
          sender,
        },
      });
    else if (instance.naturalETH)
      result = await instance.naturalETH.sendToNear({
        amount,
        recipient,
        options: {
          sender,
        },
      });
    if (result) return rainbowBridgeService.transformRawData(result);
  },
  async query(params?: Parameters<typeof get>[number]) {
    const result = await get(params);
    const sortedResult =
      (result as BridgeModel.BridgeTransaction[])?.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ) ?? [];

    const decodedResult = sortedResult.map((item) =>
      rainbowBridgeService.transformRawData(item)
    );

    return decodedResult as BridgeModel.BridgeTransaction[];
  },
  async getById(id: string) {
    const result = await rainbowBridgeService.query({
      filter: (t) => t.id === id,
    });
    return result?.[0];
  },
  async getByHash(hash: string) {
    const result = await rainbowBridgeService.query({
      filter: (t: any) =>
        t.lockHashes?.includes(hash) ||
        t.unlockHashes?.includes(hash) ||
        t.burnHashes?.includes(hash) ||
        t.mintHashes?.includes(hash),
    });
    return result?.[0];
  },
  transformRawData(data: Transfer) {
    try {
      const result = decorate(data, {
        locale: "en_US",
      }) as BridgeModel.BridgeTransaction;
      if (result.callToAction === "Deposit") result.callToAction = "Claim";
      return result;
    } catch (error) {
      console.error(error);
      return data as BridgeModel.BridgeTransaction;
    }
  },
};

export default rainbowBridgeService;
