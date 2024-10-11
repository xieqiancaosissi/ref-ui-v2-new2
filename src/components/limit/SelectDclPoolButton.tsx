import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ArrowDownIcon } from "../../components/swap/icons";
import { TokenMetadata } from "@/services/ft-contract";
import { IPoolDcl } from "@/interfaces/swapDcl";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { useLimitOrderChartStore } from "@/stores/limitChart";
import { sort_tokens_by_base } from "@/services/commonV3";
import { useAccountStore } from "@/stores/account";
import { getTokenBalance } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import { ITokenMetadata } from "@/interfaces/tokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { generateRandomString } from "@/utils/numbers";
import { isMobile } from "@/utils/device";
const SelectDclTokenBox = dynamic(() => import("./SelectDclToken"), {
  ssr: false,
});
const SelectDclTokenModal = dynamic(
  () => import("./SelectDclToken").then((mod) => mod.SelectDclTokenModal),
  {
    ssr: false,
  }
);
function SelectDclPoolButton({
  isIn,
  isOut,
}: {
  isIn?: boolean;
  isOut?: boolean;
}) {
  const [show, setShow] = useState<boolean>(false);
  const limitStore = useLimitStore();
  const limitChartStore = useLimitOrderChartStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const cachedDclPool = persistLimitStore.getDclPool();
  const selectedToken = isIn
    ? limitStore.getTokenIn()
    : limitStore.getTokenOut();
  const accountStore = useAccountStore();
  const walletLoading = accountStore.getWalletLoading();
  const accountId = accountStore.getAccountId();
  const mobile = isMobile();
  useEffect(() => {
    if (cachedDclPool?.pool_id) {
      const { token_x_metadata, token_y_metadata } = cachedDclPool;
      const tokens: TokenMetadata[] = sort_tokens_by_base([
        token_x_metadata as TokenMetadata,
        token_y_metadata as TokenMetadata,
      ]);
      limitChartStore.setTokenIn(tokens[0]);
      limitChartStore.setTokenOut(tokens[1]);
      getTokensWithBalance(tokens);
    }
  }, [cachedDclPool?.pool_id, accountId, walletLoading]);
  async function getTokensWithBalance(tokens: TokenMetadata[]) {
    let TOKEN_IN: ITokenMetadata = tokens[0];
    let TOKEN_OUT: ITokenMetadata = tokens[1];
    const tokenInId = TOKEN_IN?.id;
    const tokenOutId = TOKEN_OUT?.id;
    if (accountId) {
      limitStore.setBalanceLoading(true);
      const in_pending = getTokenBalance(
        getTokenUIId(TOKEN_IN) == "near" ? "NEAR" : tokenInId
      );
      const out_pending = getTokenBalance(
        getTokenUIId(TOKEN_OUT) == "near" ? "NEAR" : tokenOutId
      );
      const balances = await Promise.all([in_pending, out_pending]);
      TOKEN_IN = {
        ...TOKEN_IN,
        balanceDecimal: balances[0],
        balance: toReadableNumber(TOKEN_IN.decimals, balances[0]),
      };
      TOKEN_OUT = {
        ...TOKEN_OUT,
        balanceDecimal: balances[1],
        balance: toReadableNumber(TOKEN_OUT.decimals, balances[1]),
      };
    }
    limitStore.setBalanceLoading(false);
    limitStore.setTokenIn(TOKEN_IN);
    limitStore.setTokenOut(TOKEN_OUT);
  }
  const id = useMemo(() => {
    return `setDclToken-${generateRandomString(5)}`;
  }, []);
  useEffect(() => {
    if (mobile) return;
    const event = (e: any) => {
      const path = e.composedPath();
      const el = path.find((el: any) => el.id == id);
      if (!el) {
        hideBox();
      }
    };
    document.addEventListener("click", event);
    return () => {
      document.removeEventListener("click", event);
    };
  }, []);
  function hideBox() {
    setShow(false);
  }
  function switchBox() {
    setShow(!show);
  }
  function selectEvent(p: IPoolDcl) {
    persistLimitStore.setDclPool(p);
    hideBox();
  }
  return (
    <div
      id={id}
      className="flex items-center cursor-pointer flex-shrink-0 relative"
    >
      {selectedToken ? (
        <div className="flex items-center" onClick={switchBox}>
          <div
            className="flex items-center justify-center relative overflow-hidden rounded-full border border-gray-110"
            style={{
              width: "24px",
              height: "24px",
            }}
          >
            <img
              className="flex-shrink-0 w-6 h-6"
              src={selectedToken.icon || "/images/placeholder.svg"}
              alt=""
            />
          </div>
          <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
            {selectedToken.symbol}
          </span>
          <ArrowDownIcon className="text-gray-50" />
        </div>
      ) : (
        <SkeletonTheme baseColor="#212B35" highlightColor="#2A3643">
          <Skeleton height={20} width={80} />
        </SkeletonTheme>
      )}
      {mobile ? (
        <SelectDclTokenModal
          show={show}
          onSelect={selectEvent}
          onRequestClose={hideBox}
        />
      ) : (
        <SelectDclTokenBox show={show} onSelect={selectEvent} />
      )}
    </div>
  );
}

export default React.memo(SelectDclPoolButton);
