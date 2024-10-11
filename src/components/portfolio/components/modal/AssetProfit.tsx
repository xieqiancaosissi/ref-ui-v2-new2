import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react";
import BigNumber from "bignumber.js";
import { PortfolioContextType, PortfolioData } from "../RefPanelModal";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import { toReadableNumber } from "@/utils/numbers";
import { UserLiquidityInfo, openUrl } from "@/services/commonV3";
import { display_value } from "@/services/aurora";
import { QuestionMark } from "@/components/farm/icon";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { ArrowJump } from "../Tool";
import { REF_POOL_NAV_TAB_KEY } from "@/components/pools/detail/liquidity/dclYourLiquidity/RemovePoolV3";
import { JumpUpperLeft } from "../icon";
import { useRouter } from "next/router";
const AssetProfitData = createContext<AssetProfitDataContextType | null>(null);
function AssetProfit() {
  const {
    tokenPriceList,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    dcl_liquidities_details_list,
    dcl_tokens_metas,
    user_unclaimed_map_done,
    dcl_liquidities_details_list_done,
  } = useContext(PortfolioData) as PortfolioContextType;
  const accountStore = useAccountStore();
  const accountId = getAccountId();
  const isSignedIn = !!accountId || accountStore.isSignedIn;
  const [total_unClaimed_rewrads_value, total_unClaimed_rewrads_value_done] =
    useMemo(() => {
      let total_value = new BigNumber(0);
      let total_value_done = false;
      if (
        Object.keys(tokenPriceList).length > 0 &&
        Object.keys(user_unclaimed_map).length > 0 &&
        Object.keys(user_unclaimed_token_meta_map).length > 0
      ) {
        const user_unclaimed_list = Object.values(user_unclaimed_map);
        user_unclaimed_list.forEach((item: any) => {
          Object.keys(item).forEach((tokenId: string) => {
            const token_meta = user_unclaimed_token_meta_map[tokenId];
            const token_quantity = toReadableNumber(
              token_meta.decimals,
              item[tokenId]
            );
            const token_price = tokenPriceList[tokenId]?.price || 0;
            const token_value = new BigNumber(token_quantity).multipliedBy(
              token_price
            );
            total_value = total_value.plus(token_value);
          });
        });
        total_value_done = true;
      }
      if (
        user_unclaimed_map_done &&
        Object.keys(user_unclaimed_map).length == 0
      ) {
        total_value_done = true;
      }
      return [total_value.toFixed(), total_value_done];
    }, [
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
      tokenPriceList,
      user_unclaimed_map_done,
    ]);
  const [total_fees_value, total_fees_value_done] = useMemo(() => {
    let total_value = new BigNumber(0);
    let total_value_done = false;
    if (
      Object.keys(tokenPriceList).length > 0 &&
      dcl_liquidities_details_list.length > 0 &&
      Object.keys(dcl_tokens_metas || {}).length > 0
    ) {
      dcl_liquidities_details_list.forEach((liquidity: UserLiquidityInfo) => {
        const { pool_id, unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        const [token_x, token_y] = pool_id.split("|");
        const tokenX = dcl_tokens_metas[token_x];
        const tokenY = dcl_tokens_metas[token_y];
        const price_x = tokenPriceList[token_x]?.price || 0;
        const price_y = tokenPriceList[token_y]?.price || 0;
        const token_x_quantity = toReadableNumber(
          tokenX.decimals,
          unclaimed_fee_x
        );
        const token_y_quantity = toReadableNumber(
          tokenY.decimals,
          unclaimed_fee_y
        );
        const token_x_value = new BigNumber(token_x_quantity).multipliedBy(
          price_x
        );
        const token_y_value = new BigNumber(token_y_quantity).multipliedBy(
          price_y
        );
        total_value = total_value.plus(token_x_value).plus(token_y_value);
      });
      total_value_done = true;
    }
    if (
      dcl_liquidities_details_list_done &&
      dcl_liquidities_details_list.length == 0
    ) {
      total_value_done = true;
    }
    return [total_value.toFixed(), total_value_done];
  }, [
    tokenPriceList,
    dcl_liquidities_details_list,
    dcl_tokens_metas,
    dcl_liquidities_details_list_done,
  ]);
  const total_proft = useMemo(() => {
    const total_profit = new BigNumber(total_unClaimed_rewrads_value)
      .plus(total_fees_value)
      .toFixed();
    return total_profit;
  }, [total_unClaimed_rewrads_value, total_fees_value]);

  function getTip() {
    const result: string = `<div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">
    USD value of unclaimed fees from DCL pools, and unclaimed farm rewards.</div>`;
    return result;
  }
  const show_total_proft = useMemo(() => {
    return total_unClaimed_rewrads_value_done && total_fees_value_done
      ? display_value(total_proft)
      : "$-";
  }, [total_fees_value_done, total_unClaimed_rewrads_value_done, total_proft]);
  const show_total_fees_value = useMemo(() => {
    return total_fees_value_done ? display_value(total_fees_value) : "$-";
  }, [total_fees_value_done, total_fees_value]);
  const show_total_unClaimed_rewrads_value = useMemo(() => {
    return total_unClaimed_rewrads_value_done
      ? display_value(total_unClaimed_rewrads_value)
      : "$-";
  }, [total_unClaimed_rewrads_value_done, total_unClaimed_rewrads_value]);
  return (
    <AssetProfitData.Provider
      value={{
        getTip,
        show_total_proft,
        show_total_fees_value,
        show_total_unClaimed_rewrads_value,
      }}
    >
      <AssetProfitPage></AssetProfitPage>
    </AssetProfitData.Provider>
  );
}

function AssetProfitPage() {
  const {
    getTip,
    show_total_proft,
    show_total_fees_value,
    show_total_unClaimed_rewrads_value,
  } = useContext(AssetProfitData)!;
  const { onRequestClose, setIsOpen } = useContext(
    PortfolioData
  ) as PortfolioContextType;
  const router = useRouter();
  return (
    <div className="flex mb-9">
      <div
        className="bg-gray-20 bg-opacity-70 rounded-md p-4 mr-1"
        style={{ width: "30%" }}
      >
        <div className="flex items-center mb-2">
          <p className="text-gray-50 text-sm">Unclaimed Earnings</p>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="selectAllId"
            data-place="top"
            data-tooltip-html={getTip()}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="selectAllId" />
          </div>
        </div>
        <div className="text-2xl text-primaryGreen pb-1">
          {show_total_proft}
        </div>
      </div>
      <div
        className="bg-gray-20 bg-opacity-70 rounded-md p-4 flex"
        style={{ width: "70%" }}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <p className="text-gray-50 text-sm mr-1">Unclaimed Pool Fees</p>
            <JumpUpperLeft
              className="cursor-pointer"
              onClick={() => {
                sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, "/yourliquidity");
                router.push("/yours");
                onRequestClose();
                setIsOpen(false);
              }}
            />
          </div>
          <div className="text-2xl pb-1">{show_total_fees_value}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <p className="text-gray-50 text-sm mr-1">Unclaimed Farm Rewards</p>
            <JumpUpperLeft
              className="cursor-pointer"
              onClick={() => {
                localStorage.setItem("farmV2Status", "my");
                router.push("/v2farms");
                onRequestClose();
                setIsOpen(false);
              }}
            />
          </div>
          <div className="text-2xl pb-1">
            {show_total_unClaimed_rewrads_value}
          </div>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}

interface AssetProfitDataContextType {
  getTip: () => string;
  show_total_proft: string;
  show_total_fees_value: string;
  show_total_unClaimed_rewrads_value: string;
}

export default React.memo(AssetProfit);
