import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import Big from "big.js";
import { FormattedMessage } from "react-intl";
import BigNumber from "bignumber.js";
import { LiquidityProviderData } from "../../AddYourLiquidityDCL";
import { useAccountStore } from "@/stores/account";
import { add_liquidity, batch_add_liquidity } from "@/services/swapV3";
import { IAddLiquidityInfo } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { getSelector } from "@/utils/wallet";
import getConfigV2 from "@/utils/configV2";
import { ButtonTextWrapper } from "@/components/common/Button";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
const configV2 = getConfigV2();

/**
 * 双边 最小token数量不满足 提示
 * 双边 一侧token 数量太多 传递的时候只传实际使用值
 * @returns
 */
export function AddLiquidityButton(props: any) {
  const { setAddSuccess, setDclModalVisible } = props;
  const {
    currentSelectedPool,
    tokenX,
    tokenY,
    liquidityShape,
    tokenXAmount,
    tokenYAmount,
    tokenXBalanceFromNear,
    tokenYBalanceFromNear,
    onlyAddXToken,
    onlyAddYToken,
    invalidRange,
    getLiquiditySpot,
    getLiquidityForCurveAndBidAskMode,
  }: any = useContext(LiquidityProviderData);
  const appStore = useAppStore();
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const accountStore = useAccountStore();

  const isSignedIn = accountStore.isSignedIn;

  function addLiquiditySpot() {
    setAddLiquidityButtonLoading(true);
    const new_liquidity = getLiquiditySpot();
    add_liquidity(new_liquidity).then((res: any) => {
      if (!res) return;
      if (res.status == "success") {
        successToast();
        setAddSuccess((pre: any) => pre + 1);
      } else if (res.status == "error") {
        failToast(res.errorResult?.message);
      }
    });
  }
  function addLiquidityForCurveAndBidAskMode() {
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    setAddLiquidityButtonLoading(true);
    let nftList: IAddLiquidityInfo[] = [];
    nftList = getLiquidityForCurveAndBidAskMode();
    if (!nftList) {
      setAddLiquidityButtonLoading(false);
      return;
    }
    /**
     * 计算出 nftList token x tokeny 的数量，这是需要的总数量
     * tokenXAmount_nonDivisible，tokenYAmount_nonDivisible 是输入的总数量
     * 单边只有一个nft且包含当前点位的，输入的量可能会多余，所以不采用输入的值作为参数，而是采用实际使用的值作为参数
     */
    let last_total_needed_token_x_amount = Big(0);
    let last_total_needed_token_y_amount = Big(0);
    nftList.forEach((nft: IAddLiquidityInfo) => {
      const { amount_x, amount_y } = nft;
      last_total_needed_token_x_amount = last_total_needed_token_x_amount.plus(
        amount_x || 0
      );
      last_total_needed_token_y_amount = last_total_needed_token_y_amount.plus(
        amount_y || 0
      );
    });
    batch_add_liquidity({
      liquidityInfos: nftList,
      token_x: tokenX,
      token_y: tokenY,
      amount_x: last_total_needed_token_x_amount.toFixed(),
      amount_y: last_total_needed_token_y_amount.toFixed(),
      selectedWalletId:
        getSelector()?.store?.getState()?.selectedWalletId || "",
    }).then((res: any) => {
      if (!res) return;
      if (res.status == "success") {
        successToast();
        setAddSuccess((pre: any) => pre + 1);
      } else if (res.status == "error") {
        failToast(res.errorResult?.message);
      }
    });
  }
  function getMax(token: TokenMetadata, balance: string) {
    return token.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? "0"
      : String(Number(balance) - 0.5);
  }
  function getButtonText() {
    let txt: any = <span>Add Liquidity</span>;
    if (!currentSelectedPool?.pool_id) {
      txt = <span>Create Pool</span>;
    } else if (invalidRange) {
      txt = <span>Update Range</span>;
    } else if (onlyAddXToken && +tokenXAmount == 0) {
      txt = <span>Input Amount</span>;
    } else if (onlyAddYToken && +tokenYAmount == 0) {
      txt = <span>Input Amount</span>;
    } else if (
      !onlyAddXToken &&
      !onlyAddYToken &&
      (+tokenXAmount == 0 || +tokenYAmount == 0)
    ) {
      txt = <span>Input Amount</span>;
    } else if (
      +tokenXAmount > 0 &&
      new BigNumber(tokenXAmount).isGreaterThan(
        getMax(tokenX, tokenXBalanceFromNear)
      )
    ) {
      txt = <span>Not Enough Balance</span>;
    } else if (
      +tokenYAmount > 0 &&
      new BigNumber(tokenYAmount).isGreaterThan(
        getMax(tokenY, tokenYBalanceFromNear)
      )
    ) {
      txt = <span>Not Enough Balance</span>;
    }
    return txt;
  }
  function getButtonStatus() {
    const condition1 = currentSelectedPool?.pool_id;
    let condition2;
    if (onlyAddXToken) {
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount);
    } else if (onlyAddYToken) {
      condition2 =
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
    } else if (!invalidRange) {
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount) &&
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
    }
    return !(condition1 && condition2);
  }
  const isAddLiquidityDisabled = getButtonStatus();

  const add_lp_func =
    liquidityShape === "Spot"
      ? addLiquiditySpot
      : addLiquidityForCurveAndBidAskMode;
  return (
    <div className={`w-full fccc  mt-5 poolBtnStyle cursor-pointer rounded`}>
      {isSignedIn ? (
        <div
          color="#fff"
          className={`w-full h-12 fccc rounded  focus:outline-none ${
            isAddLiquidityDisabled && !!currentSelectedPool?.pool_id
              ? "bg-gray-40 cursor-not-allowed text-gray-60"
              : ""
          }`}
          onClick={() => {
            if (!currentSelectedPool?.pool_id) {
              return setDclModalVisible(true);
            }
            if (isAddLiquidityDisabled) return;
            add_lp_func();
          }}
        >
          <ButtonTextWrapper
            loading={addLiquidityButtonLoading}
            Text={() => <>{getButtonText()}</>}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center bg-greenGradient rounded w-full text-black font-bold text-base cursor-pointer"
          style={{ height: "42px" }}
          onClick={() => {
            showWalletSelectorModal(appStore.setShowRiskModal);
          }}
        >
          Connect Wallet
        </div>
      )}
    </div>
  );
}
