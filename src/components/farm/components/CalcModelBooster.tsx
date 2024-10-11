import React, { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useState, useEffect, useRef } from "react";
import { BigNumber } from "bignumber.js";
import { handleNumber, mftGetBalance } from "../../../services/farm";
import Modal from "react-modal";
import Link from "next/link";
import { getMftTokenId } from "../../../services/farm";
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from "../../../services/m-token";
import {
  FarmBoost,
  Seed,
  BoostConfig,
  UserSeedInfo,
} from "../../../services/farm";
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from "../../../utils/numbers";
import { isMobile } from "../../../utils/device";
import useTokens from "@/hooks/useTokens";
import getConfig from "../../../utils/config";
import { TokenMetadata, unWrapToken } from "../../../services/ft-contract";
import { LightningIcon, BoostOptIcon } from "../icon/FarmBoost";
import { getLoveAmount } from "../../../services/referendum";
import { LOVE_TOKEN_DECIMAL } from "../../../services/referendum";
import { SwitchBtn, VEARROW } from "../icon/index";
import { openUrl } from "../../../services/commonV3";
import { ModalClose, HandIcon, LinkIcon } from "../icon";
import { useAccountStore } from "../../../stores/account";
import { useRouter } from "next/router";
import { isStablePool } from "@/services/swap/swapUtils";
import getStablePoolTypeConfig from "@/utils/stablePoolConfig/stablePoolTypeConfig";
import CalcEle from "./CalcEle";

const stablePoolTypeConfig = getStablePoolTypeConfig();
const { STABLE_POOL_IDS } = stablePoolTypeConfig;

function CalcModelBooster(
  props: ReactModal.Props & {
    seed: Seed;
    tokenPriceList: Record<string, string>;
    loveSeed?: Seed;
    boostConfig: BoostConfig;
    user_seeds_map: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map: Record<string, any>;
    user_unclaimed_map: Record<string, any>;
  }
) {
  const {
    seed,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const router = useRouter();
  const [usd, setUsd] = useState("");
  const [lpTokenNum, setLpTokenNum] = useState("");
  const [usdDisplay, setUsdDisplay] = useState("");
  const [lpTokenNumDisplay, setLpTokenNumDisplay] = useState("");
  const [userLpTokenNum, setUserLpTokenNum] = useState("");
  const [userLpTokenNumActual, setUserLpTokenNumActual] = useState("");
  const [inputType, setInputType] = useState(true);
  const [symbols, setSymbols] = useState("");
  const [isMaxValue, setIsMaxValue] = useState(false);
  const pool = seed.pool;
  const { token_account_ids } = pool!;
  const tokens = useTokens(token_account_ids) || [];
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(
    (pool?.id || "").toString()
  )
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  useEffect(() => {
    getUserLpTokenInPool();
  }, []);
  useEffect(() => {
    const symbolList: string[] = [];
    tokens.forEach((token) => {
      symbolList.push(unWrapToken(token, true).symbol);
    });
    setSymbols(symbolList.join("-"));
  }, [tokens]);
  const cardWidth = isMobile() ? "100vw" : "420px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();
  async function getUserLpTokenInPool() {
    if (isSignedIn) {
      if (pool) {
        const lpTokenId = pool.id.toString();
        const b = await mftGetBalance(getMftTokenId(lpTokenId));
        const num = toReadableNumber(DECIMALS, b);
        setUserLpTokenNum(toPrecision(num, 6));
        setUserLpTokenNumActual(num);
      }
    } else {
      setUserLpTokenNum("0");
      setUserLpTokenNumActual("0");
    }
  }

  function changeLp(e: any) {
    const lpNum = e.currentTarget.value;
    if (!seed.pool) {
      return;
    }
    const { shares_total_supply, tvl } = seed.pool;
    const totalShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const shareUsd = Number(tvl)
      ? new BigNumber((lpNum * tvl) / totalShares).toFixed()
      : "0";
    let actualUsd;
    let displayUsd;
    let displayLp;
    if (!lpNum) {
      actualUsd = displayUsd = displayLp = "";
    } else if (new BigNumber(0).isEqualTo(lpNum)) {
      actualUsd = displayUsd = displayLp = "0";
    } else if (new BigNumber("0.001").isGreaterThan(shareUsd)) {
      displayUsd = "<0.001";
      actualUsd = shareUsd;
    } else {
      displayUsd = handleNumber(shareUsd);
      actualUsd = shareUsd;
    }
    if (new BigNumber(0.001).isGreaterThan(lpNum)) {
      displayLp = "<0.001";
    } else {
      displayLp = handleNumber(lpNum);
    }
    if (Number(lpNum) === Number(userLpTokenNumActual)) {
      setIsMaxValue(true);
    } else {
      setIsMaxValue(false);
    }

    setLpTokenNum(lpNum);
    setUsd(actualUsd);
    setLpTokenNumDisplay(displayLp);
    setUsdDisplay(displayUsd);
  }
  function changeUsd(e: any) {
    const usdV = e.currentTarget.value;
    if (!seed.pool) {
      return;
    }
    const { shares_total_supply, tvl } = seed.pool;
    const totalShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const shareV = Number(tvl)
      ? new BigNumber((usdV * totalShares) / tvl).toFixed()
      : "0";
    let actualLp;
    let displayLp;
    let displayUsd;
    if (!usdV) {
      actualLp = displayLp = displayUsd = "";
    } else if (new BigNumber(0).isEqualTo(usdV)) {
      actualLp = displayLp = displayUsd = "0";
    } else if (new BigNumber("0.001").isGreaterThan(shareV)) {
      displayLp = "<0.001";
      actualLp = shareV;
    } else {
      displayLp = handleNumber(shareV);
      actualLp = shareV;
    }
    if (new BigNumber("0.001").isGreaterThan(usdV)) {
      displayUsd = "<0.001";
    } else {
      displayUsd = handleNumber(usdV);
    }
    setLpTokenNum(actualLp);
    setUsd(usdV);
    setLpTokenNumDisplay(displayLp);
    setUsdDisplay(displayUsd);
  }
  function showMaxLp() {
    changeLp({ currentTarget: { value: userLpTokenNumActual } });
    setInputType(false);
  }
  function switchInputSort() {
    setInputType(!inputType);
  }
  function goPool() {
    const poolId = seed?.pool?.id;
    const isStable = poolId !== undefined ? isStablePool(poolId) : false;
    if (isStable) {
      router.push(`/sauce/${poolId}`);
    } else {
      router.push(`/pool/${poolId}`);
    }
  }
  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
        content: {
          outline: "none",
          ...(is_mobile
            ? {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
              }
            : {
                transform: "translate(-50%, -50%)",
              }),
        },
      }}
    >
      <div
        className="text-white bg-dark-10 rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg p-5"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="flex justify-between items-center">
          <label className="text-lg">ROI Calculator</label>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <div className="mt-4">
          <div className="frcb text-sm text-gray-50">
            <div className="flex items-center">
              <span className="flex items-center gap-2 w-48">
                {symbols} LP Tokens Staked
              </span>
            </div>
            <span
              className="flex items-center cursor-pointer whitespace-nowrap underline hover:text-primaryGreen"
              onClick={goPool}
            >
              Get LP Tokens
              <VEARROW className="ml-1.5"></VEARROW>
            </span>
          </div>
          <div className="mt-4">
            {inputType ? (
              <UsdInput usd={usd} changeUsd={changeUsd}></UsdInput>
            ) : (
              <LpInput lpTokenNum={lpTokenNum} changeLp={changeLp}></LpInput>
            )}
            <div
              className="cursor-pointer frcc -mt-4 -mb-4"
              onClick={switchInputSort}
            >
              <SwitchBtn></SwitchBtn>
            </div>
            {inputType ? (
              <LpInput
                lpTokenNum={lpTokenNumDisplay}
                changeLp={changeLp}
                disabled={true}
                type="text"
                title={lpTokenNum}
              ></LpInput>
            ) : (
              <UsdInput
                usd={usdDisplay}
                changeUsd={changeUsd}
                disabled={true}
                type="text"
                title={usd}
              ></UsdInput>
            )}
          </div>
          <div className="mt-2.5 frcb">
            <span className="text-gray-50 text-sm">
              LP Tokens:
              <span
                onClick={showMaxLp}
                className={`underline cursor-pointer ml-1 ${
                  isMaxValue ? "text-primaryGreen" : ""
                }`}
              >
                {userLpTokenNum}
              </span>
            </span>
            {/* <label
              onClick={showMaxLp}
              style={{ zoom: 0.8 }}
              className={
                "text-sm text-gray-50 cursor-pointer underline hover:text-primaryGreen"
              }
            >
              MAX
            </label> */}
          </div>
        </div>
        <div className="mt-5">
          <CalcEle
            seed={seed}
            tokenPriceList={tokenPriceList}
            lpTokenNumAmount={lpTokenNum}
            loveSeed={loveSeed}
            boostConfig={boostConfig}
            user_seeds_map={user_seeds_map}
            user_unclaimed_map={user_unclaimed_map}
            user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
          ></CalcEle>
        </div>
        {/* <div className="mt-5 xs:mt-3 md:mt-3">
            <LinkPool pooId={seed.pool.id}></LinkPool>
          </div> */}
      </div>
    </Modal>
  );
}
export function LinkPool(props: { pooId: number }) {
  const { pooId } = props;
  const intl = useIntl();
  return (
    <div className="flex justify-center items-center">
      <Link
        title={intl.formatMessage({ id: "view_pool" })}
        href={{
          pathname: `/pool/${pooId}`,
        }}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex items-center"
      >
        <HandIcon></HandIcon>
        <label className="mx-2 text-sm text-framBorder cursor-pointer">
          get_lp_token
        </label>
        <LinkIcon></LinkIcon>
      </Link>
    </div>
  );
}
function UsdInput(props: {
  changeUsd: any;
  usd: string;
  disabled?: boolean;
  type?: string;
  title?: string;
}) {
  const { changeUsd, usd, disabled, type, title } = props;
  const usdRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (usdRef.current && !disabled) {
      usdRef.current.focus();
    }
  }, [usdRef, disabled]);
  return (
    <div className="frcb w-full rounded bg-dark-60 py-4 px-3.5" title={title}>
      <span
        className={
          "flex items-center text-xl " +
          (disabled ? "text-gray-50" : "text-white")
        }
      >
        <label>$</label>
        <input
          onChange={changeUsd}
          className={
            "text-lg ml-2 " + (disabled ? "text-gray-50" : "text-white")
          }
          type={type || "number"}
          value={usd}
          disabled={disabled}
          placeholder="0.0"
          ref={usdRef}
        ></input>
      </span>
      <label className="text-base text-gray-50">USD</label>
    </div>
  );
}
function LpInput(props: {
  changeLp: any;
  lpTokenNum: string;
  disabled?: boolean;
  type?: string;
  title?: string;
}) {
  const { changeLp, lpTokenNum, disabled, type, title } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [inputRef, disabled]);
  return (
    <div className="frcb w-full rounded bg-dark-60 py-4 px-3.5" title={title}>
      <span>
        <input
          type={type || "number"}
          className={"text-lg " + (disabled ? "text-gray-50" : "text-white")}
          value={lpTokenNum}
          onChange={changeLp}
          disabled={disabled}
          placeholder="0.0"
          ref={inputRef}
        ></input>
      </span>
      <label className="text-base text-gray-50">LP Tokens</label>
    </div>
  );
}

export default React.memo(CalcModelBooster);
