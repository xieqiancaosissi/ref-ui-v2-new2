import Big from "big.js";
import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import SelectTokenModal from "../../components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "../../components/swap/icons";
import { useEffect, useState } from "react";
import { ITokenMetadata } from "@/interfaces/tokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { setSwapTokenAndBalances } from "@/components/common/SelectTokenModal/tokenUtils";
import { useAccountStore } from "@/stores/account";
import {
  useTokenStore,
  ITokenStore,
  useTokenStoreRealTime,
} from "@/stores/token";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";
import { BALANCE_REFRESH_INTERVAL } from "@/utils/constant";

import {
  usePersistSwapStore,
  useSwapStore,
  IPersistSwapStore,
} from "@/stores/swap";

interface ISelectTokenButtonProps {
  className?: string;
  isIn?: boolean;
  isOut?: boolean;
}
function SelectTokenButton(props: ISelectTokenButtonProps) {
  const { isIn, isOut } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const persistSwapStore: IPersistSwapStore = usePersistSwapStore();
  const accountStore = useAccountStore();
  const swapStore = useSwapStore();
  const tokenStore = useTokenStore() as ITokenStore;
  const tokenStoreRealTime = useTokenStoreRealTime();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const accountId = accountStore.getAccountId();
  const global_whitelisted_tokens_ids =
    tokenStore.get_global_whitelisted_tokens_ids();
  const tokenUpdatedSerialNumber =
    tokenStoreRealTime.get_tokenUpdatedSerialNumber();
  const showToken = isIn ? tokenIn : tokenOut;
  useEffect(() => {
    const isLatest = checkCacheLatest();
    if (isOpen && !isLatest) {
      tokenStoreRealTime.set_update_loading(true);
      tokenStoreRealTime.set_tokenUpdatedSerialNumber(
        tokenUpdatedSerialNumber + 1
      );
    }
  }, [isOpen]);
  tokenStore.getDefaultAccountTokens();
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }
  function onSelect(token: ITokenMetadata, needFetch = false) {
    let targetToken = token;
    if (needFetch) {
      const defaultAccountTokens =
        tokenStore.getDefaultAccountTokens()?.data || [];
      const tknAccountTokens = tokenStore.getTknAccountTokens()?.data || [];
      const tknxAccountTokens = tokenStore.getTknxAccountTokens()?.data || [];
      const mcAccountTokens = tokenStore.getMcAccountTokens()?.data || [];
      const tokens = defaultAccountTokens
        .concat(tknAccountTokens)
        .concat(tknxAccountTokens)
        .concat(mcAccountTokens);
      const target = tokens.find(
        (t) => t.id == token.id && t.symbol == token.symbol
      );
      if (target) {
        targetToken = target;
      }
    }
    const targetTokenId = getTokenUIId(targetToken);
    if (isIn) {
      swapStore.setTokenIn(targetToken);
      persistSwapStore.setTokenInId(targetTokenId);
    } else if (isOut) {
      swapStore.setTokenOut(targetToken);
      persistSwapStore.setTokenOutId(targetTokenId);
    }
    window.selectTokenUpdated = true;
  }
  function checkCacheLatest() {
    const cachedTime = tokenStore.get_update_time();
    const nowTime = new Date().getTime();
    if (
      cachedTime &&
      Big(nowTime).minus(cachedTime).gt(BALANCE_REFRESH_INTERVAL)
    )
      return false;
    return true;
  }
  return (
    <div>
      {showToken ? (
        <div
          className="flex items-center cursor-pointer flex-shrink-0"
          onClick={showModal}
        >
          <TokenImgWithRiskTag token={showToken} size="26" />
          <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
            {showToken.symbol}
          </span>
          <ArrowDownIcon className="text-gray-50" />
        </div>
      ) : (
        <SkeletonTheme baseColor="#212B35" highlightColor="#2A3643">
          <Skeleton height={20} width={80} />
        </SkeletonTheme>
      )}

      {isOpen ? (
        <SelectTokenModal
          isOpen={isOpen}
          onRequestClose={hideModal}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}
export default React.memo(SelectTokenButton);
