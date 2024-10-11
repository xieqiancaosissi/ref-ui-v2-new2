import React from "react";
import BigNumber from "bignumber.js";
import Big from "big.js";
import { Tooltip } from "react-tooltip";
import { TokenMetadata } from "@/services/ft-contract";
import { useTokenBalances } from "@/services/token";
import { getAccountId } from "@/utils/wallet";
import { useContext, useEffect, useState } from "react";
import { OverviewContextType, OverviewData } from "../index";
import { NEARXIDS } from "@/services/swap/swapConfig";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import { BeatLoader } from "react-spinners";
import { toReadableNumber } from "@/utils/numbers";
import {
  auroraAddr,
  batchWithdrawInner,
  batchWithdrawAurora,
  display_value_withCommas,
  useAuroraBalancesNearMapping,
  useDCLAccountBalance,
  useUserRegisteredTokensAllAndNearBalance,
} from "@/services/aurora";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { AuroraIcon, AuroraIconActive, MyNearWalltIcon } from "./icon";
import { CopyIcon } from "@/components/menu/icons";
import CopyToClipboard from "react-copy-to-clipboard";
import { IExecutionResult } from "@/interfaces/wallet";
import checkTxBeforeShowToast from "@/components/common/toast/checkTxBeforeShowToast";
import failToast from "@/components/common/toast/failToast";
import { useAppStore } from "@/stores/app";
import WalletTokenList from "./WalletTokenList";
import { BALANCE_REFRESH_INTERVAL } from "@/utils/constant";

function WalletPanel() {
  const {
    tokenPriceList,
    isSignedIn,
    accountId,
    set_wallet_assets_value_done,
    set_wallet_assets_value,
    setUserTokens,
    isOpen,
    setWalletLoading,
    setReloadLoading,
  } = useContext(OverviewData) as OverviewContextType;
  const [tipVisible, setTipVisible] = useState<boolean>(false);
  const [tabList, setTabList] = useState([{ name: "NEAR", tag: "near" }]);
  const [activeTab, setActiveTab] = useState("near");
  const [near_tokens, set_near_tokens] = useState<TokenMetadata[]>([]);
  const [inter_tokens, set_inter_tokens] = useState<TokenMetadata[]>([]);
  const [aurora_tokens, set_aurora_tokens] = useState<TokenMetadata[]>([]);
  const [near_total_value, set_near_total_value] = useState<string>("0");
  const [aurora_total_value, set_aurora_total_value] = useState<string>("0");
  const [inner_total_value, set_inner_total_value] = useState<string>("0");
  const [userTokensLast, setUserTokensLast] = useState<any[]>([]);
  const [batch_withdraw_loading, set_batch_withdraw_loading] =
    useState<boolean>(false);
  const auroraAddress = auroraAddr(getAccountId() || "");
  const { tokens: userTokens, tokens_loading } =
    useUserRegisteredTokensAllAndNearBalance(); // balances in near wallet
  const auroaBalances = useAuroraBalancesNearMapping(auroraAddress); // balances in aurora;
  const v1balances = useTokenBalances(); // balances in ref v1
  const DCLAccountBalance = useDCLAccountBalance(!!accountId); // balances in ref v3
  const displayAuroraAddress = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;
  const is_tokens_loading =
    !userTokens || !v1balances || !auroaBalances || !DCLAccountBalance;
  const appStore = useAppStore();
  const personalDataUpdatedSerialNumber =
    appStore.getPersonalDataUpdatedSerialNumber();
  // for update
  useEffect(() => {
    setWalletLoading(tokens_loading);
  }, [tokens_loading]);
  useEffect(() => {
    const isLatest = checkCacheLatest();
    if (isOpen && !isLatest) {
      setWalletLoading(true);
      appStore.setPersonalDataUpdatedSerialNumber(
        personalDataUpdatedSerialNumber + 1
      );
    }
  }, [isOpen]);
  // for reload
  useEffect(() => {
    setReloadLoading(is_tokens_loading);
  }, [is_tokens_loading]);
  useEffect(() => {
    if (!is_tokens_loading) {
      userTokens.forEach((token: TokenMetadata) => {
        const { decimals, id, nearNonVisible } = token;
        const b_onRef =
          id === NEARXIDS[0]
            ? "0"
            : toReadableNumber(decimals, v1balances[id] || "0");
        const b_onDcl = toReadableNumber(
          decimals,
          DCLAccountBalance[id] || "0"
        );
        const b_inner = Big(b_onRef).plus(b_onDcl).toFixed();
        token.ref = b_onRef;
        token.dcl = b_onDcl;
        token.inner = b_inner;
        token.near = toReadableNumber(
          decimals,
          (nearNonVisible || "0").toString()
        );
        token.aurora = toReadableNumber(
          decimals,
          auroaBalances[id] || "0"
        ).toString();
      });
      setUserTokensLast(JSON.parse(JSON.stringify(userTokens || [])));
    }
  }, [
    JSON.stringify(tokenPriceList || {}),
    JSON.stringify(userTokens || []),
    JSON.stringify(auroaBalances || {}),
    JSON.stringify(v1balances || {}),
    JSON.stringify(DCLAccountBalance || {}),
    is_tokens_loading,
  ]);
  useEffect(() => {
    if (!is_tokens_loading) {
      const near_tokens_temp: TokenMetadata[] = [];
      const aurora_tokens_temp: TokenMetadata[] = [];
      const inter_tokens_temp: TokenMetadata[] = [];
      userTokensLast.forEach((token: TokenMetadata) => {
        const { near, aurora, id, inner } = token;
        if (id === NEARXIDS[0]) return;
        if (near && +near > 0) {
          near_tokens_temp.push(token);
        }
        if (aurora && +aurora > 0) {
          aurora_tokens_temp.push(token);
        }
        if (inner && +inner > 0) {
          inter_tokens_temp.push(token);
        }
      });
      const { tokens: tokens_near, total_value: total_value_near } =
        token_data_process(near_tokens_temp, "near");
      const { tokens: tokens_aurora, total_value: total_value_aurora } =
        token_data_process(aurora_tokens_temp, "aurora");
      const { tokens: tokens_inner, total_value: total_value_inner } =
        token_data_process(inter_tokens_temp, "inner");
      set_near_tokens(tokens_near);
      set_aurora_tokens(tokens_aurora);
      set_inter_tokens(tokens_inner);

      set_near_total_value(total_value_near);
      set_aurora_total_value(total_value_aurora);
      set_inner_total_value(total_value_inner);
      set_wallet_assets_value(
        Big(total_value_inner || 0)
          .plus(total_value_near || 0)
          .plus(total_value_aurora || 0)
          .toFixed()
      );
      set_wallet_assets_value_done(true);
      const tab_list = [{ name: "NEAR", tag: "near" }];
      if (tokens_inner?.length > 0) {
        tab_list.push({
          name: "REF",
          tag: "ref",
        });
      }
      setTabList(JSON.parse(JSON.stringify(tab_list)));
    }
  }, [
    JSON.stringify(tokenPriceList || {}),
    JSON.stringify(userTokensLast || []),
    is_tokens_loading,
  ]);
  useEffect(() => {
    if (userTokensLast) {
      setUserTokens(userTokensLast);
    }
  }, [JSON.stringify(userTokensLast || [])]);
  useEffect(() => {
    if (is_tokens_loading) return;
    if (
      (!aurora_tokens?.length && activeTab == "aurora") ||
      (!inter_tokens?.length && activeTab == "ref")
    ) {
      setActiveTab("near");
    }
  }, [
    activeTab,
    aurora_tokens?.length,
    inter_tokens?.length,
    is_tokens_loading,
  ]);
  useEffect(() => {
    let timer: any;
    if (tipVisible) {
      timer = setTimeout(() => {
        setTipVisible(false);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [tipVisible]);
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("near");
    }
  }, [isOpen]);
  function checkCacheLatest() {
    const cachedTime = appStore.get_update_time();
    const nowTime = new Date().getTime();
    if (
      cachedTime &&
      Big(nowTime).minus(cachedTime).gt(BALANCE_REFRESH_INTERVAL)
    )
      return false;
    return true;
  }
  function token_data_process(
    target_tokens: TokenMetadata[],
    accountType: keyof TokenMetadata
  ) {
    const tokens = JSON.parse(JSON.stringify(target_tokens || []));
    tokens.forEach((token: TokenMetadata) => {
      const token_num = token[accountType] || "0";
      const token_price =
        tokenPriceList[token.id == "NEAR" ? WRAP_NEAR_CONTRACT_ID : token.id]
          ?.price || "0";
      const token_value = new BigNumber(token_num as string).multipliedBy(
        token_price
      );
      token.t_value = token_value.toFixed();
    });
    tokens.sort((tokenB: TokenMetadata, tokenA: TokenMetadata) => {
      const a_value = new BigNumber(tokenA.t_value || "0");
      const b_value = new BigNumber(tokenB.t_value || "0");
      return a_value.minus(b_value).toNumber();
    });
    const total_value = tokens.reduce((acc: string, cur: TokenMetadata) => {
      return new BigNumber(acc).plus(cur.t_value || "0").toFixed();
    }, "0");

    return { tokens, total_value };
  }
  function getTokenPrice(token: TokenMetadata) {
    const token_price =
      tokenPriceList[token.id == "NEAR" ? WRAP_NEAR_CONTRACT_ID : token.id]
        ?.price || "0";
    return token_price;
  }
  function showTotalValue() {
    let target = "0";
    if (activeTab == "near") {
      target = near_total_value;
    } else if (activeTab == "ref") {
      target = inner_total_value;
    } else if (activeTab == "aurora") {
      target = aurora_total_value;
    }
    return display_value_withCommas(target);
  }
  function doWithdrawAll() {
    set_batch_withdraw_loading(true);
    if (activeTab == "ref") {
      batchWithdrawInner(inter_tokens).then(
        (res: IExecutionResult | undefined) => {
          if (!res) return;
          if (res.status == "success") {
            checkTxBeforeShowToast({ txHash: res.txHash });
            appStore.setPersonalDataUpdatedSerialNumber(
              personalDataUpdatedSerialNumber + 1
            );
          } else if (res.status == "error") {
            failToast(res.errorResult?.message);
          }
          set_batch_withdraw_loading(false);
        }
      );
    } else if (activeTab == "aurora") {
      batchWithdrawAurora(aurora_tokens).then(
        (res: IExecutionResult | undefined) => {
          if (!res) return;
          if (res.status == "success") {
            checkTxBeforeShowToast({ txHash: res.txHash });
            appStore.setPersonalDataUpdatedSerialNumber(
              personalDataUpdatedSerialNumber + 1
            );
          } else if (res.status == "error") {
            failToast(res.errorResult?.message);
          }
          set_batch_withdraw_loading(false);
        }
      );
    }
  }
  return (
    <>
      <div className="mb-2.5 flex items-center h-8">
        {tabList.map((item: any, index: number) => {
          return (
            <span
              key={item.tag}
              onClick={() => {
                setActiveTab(item.tag);
              }}
              className={`frcc border border-gray-100 rounded-md h-7 p-1.5 mr-2.5 text-xs cursor-pointer hover:bg-portfolioLightGreyColor xsm:h-9 ${
                index != tabList.length - 1 ? "mr-0.5" : ""
              } ${
                activeTab == item.tag
                  ? "bg-gray-100 text-white"
                  : "text-gray-60"
              }`}
            >
              {item.tag == "near" && <MyNearWalltIcon className="mr-1" />}
              {item.tag == "ref" ? "REF(Inner)" : item.name}
            </span>
          );
        })}
        {aurora_tokens?.length > 0 ? (
          activeTab == "aurora" ? (
            <AuroraIconActive className="cursor-pointer"></AuroraIconActive>
          ) : (
            <AuroraIcon
              onClick={() => {
                setActiveTab("aurora");
              }}
              className="text-primaryText hover:text-portfolioLightGreenColor cursor-pointer"
            ></AuroraIcon>
          )
        ) : null}
        <div
          className={`flex flex-col ml-2.5 xsm:hidden ${
            activeTab == "aurora" && aurora_tokens?.length > 0 ? "" : "hidden"
          }`}
        >
          <p className="text-xs text-gray-60"> Mapping Account</p>
          <p className="text-xs text-white frcc">
            {displayAuroraAddress}

            <div
              data-tooltip-id="copy-tooltip"
              data-tooltip-content={`${tipVisible ? "Copied" : ""}`}
            >
              <CopyToClipboard text={auroraAddress}>
                <CopyIcon
                  className="text-gray-60 hover:text-white cursor-pointer ml-1.5"
                  onClick={() => {
                    setTipVisible(true);
                  }}
                ></CopyIcon>
              </CopyToClipboard>
              <Tooltip
                id="copy-tooltip"
                style={{
                  color: "#fff",
                  padding: "4px",
                  fontSize: "12px",
                  background: "#7E8A93",
                }}
                openOnClick
              />
            </div>
          </p>
        </div>
      </div>
      <div
        className={`flex mb-4 lg:hidden ${
          activeTab == "aurora" && aurora_tokens?.length > 0 ? "" : "hidden"
        }`}
      >
        <p className="text-xs text-gray-60 mr-1"> Mapping Account:</p>
        <p className="text-xs text-white flex">
          {displayAuroraAddress}
          <CopyToClipboard text={auroraAddress}>
            <CopyIcon className="text-gray-60 hover:text-white cursor-pointer ml-1.5"></CopyIcon>
          </CopyToClipboard>
        </p>
      </div>
      <div className="bg-gray-20 bg-opacity-40 py-4 rounded">
        <div className="flex items-center text-gray-50 text-xs w-full mb-5 pl-4 pr-5">
          <div style={{ width: "50%" }}>Token</div>
          <div style={{ width: "25%" }}>Balance</div>
          {activeTab == "near" ? (
            <div
              className={`flex items-center justify-end `}
              style={{ width: "25%" }}
            >
              Value
            </div>
          ) : (
            <div
              className={`flex items-center justify-end`}
              style={{ width: "25%" }}
            >
              {batch_withdraw_loading ? (
                <div className="flex items-center justify-center w-full h-6">
                  <BeatLoader size={4} color={"#9EFF00"} />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center text-sm text-primaryGreen underline cursor-pointer whitespace-nowrap h-6"
                  onClick={doWithdrawAll}
                >
                  Withdraw all
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ height: "34vh", overflow: "auto" }}>
          {is_tokens_loading && isSignedIn ? (
            <div className="flex justify-center">
              <SkeletonTheme
                baseColor="rgba(33, 43, 53, 0.3)"
                highlightColor="#2A3643"
                duration={3}
              >
                <Skeleton width={330} height={52} count={4} className="mt-4" />
              </SkeletonTheme>
            </div>
          ) : (
            <>
              <div className={`${activeTab == "near" ? "" : "hidden"}`}>
                {near_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "near"}
                      token={token}
                      tokenBalance={token?.near ?? 0}
                      getTokenPrice={getTokenPrice}
                    />
                  );
                })}
              </div>
              <div className={`${activeTab == "ref" ? "" : "hidden"}`}>
                {inter_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "ref"}
                      token={token}
                      tokenBalance={token?.inner ?? 0}
                      getTokenPrice={getTokenPrice}
                      showWithdraw={true}
                    />
                  );
                })}
              </div>
              <div className={`${activeTab == "aurora" ? "" : "hidden"}`}>
                {aurora_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "aurora"}
                      token={token}
                      tokenBalance={token?.aurora ?? 0}
                      getTokenPrice={getTokenPrice}
                      showWithdraw={true}
                      isAurora={true}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="frcb mt-6 px-4">
        <p className="text-gray-50 text-sm">Total</p>
        <p className="text-base xsm:text-primaryGreen">{showTotalValue()}</p>
      </div>
    </>
  );
}

export default React.memo(WalletPanel);
