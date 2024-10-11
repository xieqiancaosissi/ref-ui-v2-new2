import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Big } from "big.js";
import estimateSwap from "@/services/swap/estimateSwap";
import { IEstimateResult } from "@/interfaces/swap";
import {
  usePersistSwapStore,
  IPersistSwapStore,
  useSwapStore,
} from "@/stores/swap";
import { ITokenMetadata } from "@/interfaces/tokens";
import { getTokenUIId, is_near_wnear_swap } from "@/services/swap/swapUtils";

const useSwap = ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  firstInput,
  setFirstInput,
  hideLowTvlPools,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  tokenInAmount: string;
  firstInput: boolean;
  setFirstInput: (f: boolean) => void;
  hideLowTvlPools: boolean;
}): IEstimateResult => {
  const [swapEstimateResult, setSwapEstimateResult] = useState<IEstimateResult>(
    {}
  );
  const swapStore = useSwapStore();
  const walletInteractionStatusUpdatedSwap =
    swapStore.getWalletInteractionStatusUpdated();
  const persistSwapStore = usePersistSwapStore() as IPersistSwapStore;
  const smartRoute = persistSwapStore.getSmartRoute();
  const slippage = persistSwapStore.getSlippage();
  const trigger = swapStore.getTrigger();
  const deflation = swapStore.getDeflation();
  useDebounce(
    () => {
      estimateWrap();
    },
    firstInput ? 100 : 300,
    [
      getTokenUIId(tokenIn),
      getTokenUIId(tokenOut),
      tokenInAmount,
      smartRoute,
      JSON.stringify(deflation || {}),
      walletInteractionStatusUpdatedSwap,
    ]
  );
  useEffect(() => {
    if (trigger) {
      estimateWrap();
    }
  }, [trigger]);
  function estimateWrap() {
    if (tokenIn?.id && tokenOut?.id && Number(tokenInAmount) > 0) {
      setSwapEstimateResult({
        quoteDone: false,
        tag: `${tokenIn?.id}@${tokenOut?.id}@${tokenInAmount}`,
      });
    }
    if (is_near_wnear_swap(tokenIn, tokenOut) && Number(tokenInAmount) > 0) {
      setSwapEstimateResult({
        is_near_wnear_swap: true,
        quoteDone: true,
        tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
      });
      swapStore.setTrigger(false);
    } else if (
      tokenIn?.id &&
      tokenOut?.id &&
      tokenIn?.id !== tokenOut?.id &&
      Number(tokenInAmount) > 0 &&
      deflation?.done
    ) {
      swapStore.setEstimating(true);
      doEstimateSwap({
        tokenIn,
        tokenOut,
        tokenInAmount: Big(1 - (deflation?.rate || 0))
          .mul(tokenInAmount || 0)
          .toFixed(),
        tokenInAmountNoRate: tokenInAmount,
      });
    }
  }
  async function doEstimateSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
    tokenInAmountNoRate,
  }: {
    tokenIn: ITokenMetadata;
    tokenOut: ITokenMetadata;
    tokenInAmount: string;
    tokenInAmountNoRate: string;
  }) {
    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      supportLedger: !smartRoute,
      hideLowTvlPools,
      slippage,
    })
      .then((estimateResult) => {
        let todo: any;
        if (estimateResult.source == "server") {
          swapStore.setEstimates(undefined);
          todo = { swapsToDoServer: estimateResult };
        } else {
          swapStore.setEstimatesServer(undefined);
          todo = { swapsToDo: estimateResult };
        }
        setSwapEstimateResult({
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmountNoRate}`,
          ...todo,
        });
      })
      .catch((e) => {
        setSwapEstimateResult({
          swapError: e,
          quoteDone: true,
          tag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmountNoRate}`,
        });
      })
      .finally(() => {
        swapStore.setTrigger(false);
      });
  }
  return swapEstimateResult;
};

export default useSwap;
