import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import estimateDclSwap from "@/services/swap/estimateDclSwap";
import { useSwapStore } from "@/stores/swap";
import { IEstimateDclSwapView, IEstimateResult } from "@/interfaces/swapDcl";
import { ITokenMetadata } from "@/interfaces/tokens";
const useDclSwap = ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  firstInput,
  setFirstInput,
  supportDclQuote,
}: {
  tokenIn: ITokenMetadata;
  tokenOut: ITokenMetadata;
  tokenInAmount: string;
  firstInput: boolean;
  setFirstInput: (f: boolean) => void;
  supportDclQuote: boolean;
}): IEstimateResult => {
  const [dclSwapEstimateResult, setDclSwapEstimateResult] =
    useState<IEstimateResult>({});
  const swapStore = useSwapStore();
  const trigger = swapStore.getTrigger();
  const walletInteractionStatusUpdatedSwap =
    swapStore.getWalletInteractionStatusUpdated();
  useDebounce(
    () => {
      dclEstimateWrap();
    },
    firstInput ? 100 : 300,
    [
      tokenIn?.id,
      tokenOut?.id,
      tokenInAmount,
      walletInteractionStatusUpdatedSwap,
    ]
  );
  useEffect(() => {
    if (trigger) {
      dclEstimateWrap();
    }
  }, [trigger]);
  function dclEstimateWrap() {
    if (tokenIn?.id && tokenOut?.id && Number(tokenInAmount) > 0) {
      setDclSwapEstimateResult({
        dclQuoteDone: false,
        dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
      });
      if (tokenIn?.id == tokenOut?.id) {
        setFirstInput(false);
        setDclSwapEstimateResult({
          dclQuoteDone: true,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
        swapStore.setTrigger(false);
      } else if (supportDclQuote) {
        swapStore.setEstimating(true);
        doDclEstimateSwap({
          tokenIn,
          tokenOut,
          tokenInAmount,
        });
      } else {
        setFirstInput(false);
        setDclSwapEstimateResult({
          dclQuoteDone: true,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
        swapStore.setTrigger(false);
      }
    }
  }
  async function doDclEstimateSwap({
    tokenIn,
    tokenOut,
    tokenInAmount,
  }: {
    tokenIn: ITokenMetadata;
    tokenOut: ITokenMetadata;
    tokenInAmount: string;
  }) {
    estimateDclSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
    })
      .then((estimate: IEstimateDclSwapView) => {
        setDclSwapEstimateResult({
          dclSwapsToDo: estimate,
          dclQuoteDone: true,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      })
      .catch((e) => {
        setDclSwapEstimateResult({
          dclSwapError: e,
          dclQuoteDone: true,
          dclTag: `${tokenIn.id}@${tokenOut.id}@${tokenInAmount}`,
        });
      })
      .finally(() => {
        swapStore.setTrigger(false);
      });
  }
  return dclSwapEstimateResult;
};

export default useDclSwap;
