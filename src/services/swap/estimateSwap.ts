import { toNonDivisibleNumber } from "@/utils/numbers";
import { EstimateSwapView, EstimateSwapOptions } from "@/interfaces/swap";
import estimateSwapFromScript from "./estimateSwapFromScript";
import {
  estimateSwapFromServer,
  getUsedPools,
  getUsedTokens,
} from "./smartRouterFromServer";
import getConfigV3 from "@/utils/configV3";
import { getAllTokenPrices } from "@/services/farm";
import { IEstimateSwapServerView, ISource } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { Pool } from "@/services/pool_detail";
const configV3 = getConfigV3();
const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  supportLedger,
  hideLowTvlPools,
  slippage,
}: EstimateSwapOptions & { slippage: number }): Promise<{
  source: ISource;
  tag: string;
  estimates?: EstimateSwapView[];
  estimatesFromServer?: IEstimateSwapServerView;
  poolsMap?: Record<string, Pool>;
  tokensMap?: Record<string, TokenMetadata>;
}> => {
  const SHUTDOWN_SERVER = configV3.SHUTDOWN_SERVER;
  if (!SHUTDOWN_SERVER) {
    const resultFromServer = await estimateSwapFromServer({
      tokenIn: tokenIn.id,
      tokenOut: tokenOut.id,
      amountIn: toNonDivisibleNumber(tokenIn.decimals, amountIn),
      slippage,
      supportLedger,
    }).catch(() => ({}));
    if (
      !(
        resultFromServer?.result_code !== 0 ||
        !resultFromServer?.result_data?.routes?.length
      )
    ) {
      const routes = resultFromServer.result_data?.routes;
      let poolsMap = {};
      let tokensMap = {};
      try {
        poolsMap = await getUsedPools(routes);
      } catch (error) {}
      try {
        tokensMap = await getUsedTokens(routes);
      } catch (error) {}
      return {
        estimatesFromServer: resultFromServer.result_data,
        tag: `${tokenIn.id}-${toNonDivisibleNumber(
          tokenIn.decimals,
          amountIn
        )}-${tokenOut.id}`,
        source: "server",
        poolsMap,
        tokensMap,
      };
    } else {
      return await doEstimateSwapFromScript({
        tokenIn,
        tokenOut,
        amountIn,
        supportLedger,
        hideLowTvlPools,
      });
    }
  } else {
    return await doEstimateSwapFromScript({
      tokenIn,
      tokenOut,
      amountIn,
      supportLedger,
      hideLowTvlPools,
    });
  }
};
async function doEstimateSwapFromScript({
  tokenIn,
  tokenOut,
  amountIn,
  supportLedger,
  hideLowTvlPools,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  supportLedger: boolean;
  hideLowTvlPools: boolean;
}) {
  const resultFromScript = await estimateSwapFromScript({
    tokenIn,
    tokenOut,
    amountIn,
    supportLedger,
    hideLowTvlPools,
  });
  const s: ISource = "script";
  return {
    ...resultFromScript,
    source: s,
  };
}
export default estimateSwap;
