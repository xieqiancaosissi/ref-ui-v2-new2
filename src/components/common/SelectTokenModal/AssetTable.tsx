import React, { useState, useContext, useMemo } from "react";
import _ from "lodash";
import { Spinner } from "@nextui-org/react";
import { SolidArrowDownIcon } from "./Icons";
import Table from "./Table";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
import { useAccountStore } from "@/stores/account";
import {
  useTokenStore,
  ITokenStore,
  useTokenStoreRealTime,
} from "@/stores/token";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { QuestionIcon } from "../Icons";
import { purgeTokensByIds } from "./tokenUtils";

export default function AssetTable({
  excludedTokenIds,
}: {
  excludedTokenIds?: string[];
}) {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [tab, setTab] = useState<"default" | "tkn" | "tknx" | "mc">("default");
  const tokenStore = useTokenStore() as ITokenStore;
  const tokenStoreRealTime = useTokenStoreRealTime();
  const accountStore = useAccountStore();
  const defaultAccountTokens = tokenStore.getDefaultAccountTokens();
  const tknAccountTokens = tokenStore.getTknAccountTokens();
  const tknxAccountTokens = tokenStore.getTknxAccountTokens();
  const mcAccountTokens = tokenStore.getMcAccountTokens();
  const update_loading = tokenStoreRealTime.get_update_loading();
  const tokenUpdatedSerialNumber =
    tokenStoreRealTime.get_tokenUpdatedSerialNumber();
  const isUpdate = tokenUpdatedSerialNumber > 1;
  const { searchText } = useContext(SelectTokenContext);
  const accountId = accountStore.getAccountId();
  const [
    defaultSearchResult,
    tknSearchResult,
    tknxSearchResult,
    mcSearchResult,
  ] = useMemo(() => {
    const defaultAccountTokensData = purgeTokensByIds(
      defaultAccountTokens.data,
      excludedTokenIds
    );
    const tknAccountTokenssData = purgeTokensByIds(
      tknAccountTokens.data,
      excludedTokenIds
    );
    const knxAccountTokensData = purgeTokensByIds(
      tknxAccountTokens.data,
      excludedTokenIds
    );
    const mcAccountTokensData = purgeTokensByIds(
      mcAccountTokens.data,
      excludedTokenIds
    );
    if (searchText) {
      const defaultSearchResult = defaultAccountTokensData.filter(filterFun);
      const tknSearchResult = tknAccountTokenssData.filter(filterFun);
      const tknxSearchResult = knxAccountTokensData.filter(filterFun);
      const mcSearchResult = mcAccountTokensData.filter(filterFun);
      return [
        defaultSearchResult,
        tknSearchResult,
        tknxSearchResult,
        mcSearchResult,
      ];
    } else {
      return [
        defaultAccountTokensData,
        tknAccountTokenssData,
        knxAccountTokensData,
        mcAccountTokensData,
      ];
    }
  }, [
    searchText,
    JSON.stringify(defaultAccountTokens || {}),
    JSON.stringify(tknAccountTokens || {}),
    JSON.stringify(tknxAccountTokens || {}),
    JSON.stringify(mcAccountTokens || {}),
  ]);
  function sortBalance() {
    if (sort == "asc") {
      setSort("desc");
    } else {
      setSort("asc");
    }
  }
  function filterFun(token: TokenMetadata) {
    const condition1 = token.symbol
      ?.toLocaleLowerCase()
      .includes(searchText.toLocaleLowerCase());
    const condition2 =
      token.id?.toLocaleLowerCase() == searchText.toLocaleLowerCase();
    return condition1 || condition2;
  }
  function tknTip() {
    return `
    <div class="text-gray-110 text-xs text-left  w-62">
    Created by any user on https://tkn.homes with the tkn.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  function tknxTip() {
    return `
    <div class="text-gray-110 text-xs text-left w-62">
        Created by any user on https://tkn.homes with the tknx.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  function mcTip() {
    return `
    <div class="text-gray-110 text-xs text-left w-62">
    Created by any user on https://meme.cooking/create with the meme-cooking.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>
    `;
  }
  return (
    <div className="mt-7">
      {/* title */}
      <div className="flexBetween text-sm text-gray-60">
        <div className="flex items-center gap-2">
          <div className="flex items-stretch border border-gray-100 rounded-md h-6 text-xs">
            <span
              className={`flexBetween cursor-pointer rounded-tl rounded-bl px-1.5 ${
                tab == "default" ? "bg-gray-100 text-white" : ""
              }`}
              onClick={() => {
                setTab("default");
              }}
            >
              Default
            </span>
            <div
              className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
                tab == "tkn" ? "bg-gray-100 text-white" : ""
              }`}
              onClick={() => {
                setTab("tkn");
              }}
            >
              <span>TKN</span>
              <div
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id="tknTipId"
                data-place="top"
                data-tooltip-html={tknTip()}
              >
                <QuestionIcon className="text-gray-60 hover:text-white" />
                <CustomTooltip id="tknTipId" />
              </div>
            </div>
            <div
              className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
                tab == "tknx" ? "bg-gray-100 text-white" : ""
              }`}
              onClick={() => {
                setTab("tknx");
              }}
            >
              <span>TKNX</span>
              <div
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id="tknxTipId"
                data-place="top"
                data-tooltip-html={tknxTip()}
              >
                <QuestionIcon className="text-gray-60 hover:text-white" />
                <CustomTooltip id="tknxTipId" />
              </div>
            </div>
            <div
              className={`flexBetween rounded-tr rounded-br gap-1 cursor-pointer px-1.5 ${
                tab == "mc" ? "bg-gray-100 text-white" : ""
              }`}
              onClick={() => {
                setTab("mc");
              }}
            >
              <span>MC</span>
              <div
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id="mcTipId"
                data-place="top"
                data-tooltip-html={mcTip()}
              >
                <QuestionIcon className="text-gray-60 hover:text-white" />
                <CustomTooltip id="mcTipId" />
              </div>
            </div>
          </div>
          {update_loading && isUpdate && accountId ? (
            <Spinner
              size="sm"
              className="mb-0.5"
              classNames={{
                circle1: "border-b-primaryGreen",
                circle2: "border-b-primaryGreen",
              }}
            />
          ) : null}
        </div>

        <div
          className="flex items-center gap-1.5 cursor-pointer pr-2"
          onClick={sortBalance}
        >
          <span>Balance</span>
          <SolidArrowDownIcon
            className={`${sort === "desc" ? "" : "transform rotate-180"}`}
          />
        </div>
      </div>
      <div className={`flex flex-col gap-1 mt-2`}>
        {/* Default */}
        <Table
          displayTokens={defaultSearchResult}
          loading={!defaultAccountTokens.done && !isUpdate}
          sort={sort}
          enableAddToken
          hidden={tab !== "default"}
        />
        {/* TKN */}
        <Table
          displayTokens={tknSearchResult}
          loading={!tknAccountTokens.done && !isUpdate}
          sort={sort}
          hidden={tab !== "tkn"}
        />
        <Table
          displayTokens={tknxSearchResult}
          loading={!tknxAccountTokens.done && !isUpdate}
          sort={sort}
          hidden={tab !== "tknx"}
        />
        <Table
          displayTokens={mcSearchResult}
          loading={!mcAccountTokens.done && !isUpdate}
          sort={sort}
          hidden={tab !== "mc"}
        />
      </div>
    </div>
  );
}
