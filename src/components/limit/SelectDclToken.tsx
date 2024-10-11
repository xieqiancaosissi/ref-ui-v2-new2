import React, { useMemo, useState } from "react";
import Modal from "react-modal";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { TokenMetadata } from "@/services/ft-contract";
import { sort_tokens_by_base } from "@/services/commonV3";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";
import { SelectedIcon, SelectedIconBig } from "./icons";
import { getBestTvlPoolList } from "@/services/limit/limitUtils";
import { SearchIcon } from "@/components/common/Icons";
import { CloseButttonIcon } from "@/components/common/SelectTokenModal/Icons";
function SelectDclTokenBox({
  onSelect,
  show,
}: {
  onSelect: (pool: IPoolDcl) => void;
  show: boolean;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allPools = persistLimitStore.getAllDclPools();
  const selectedDclPool = persistLimitStore.getDclPool();
  const bestTvlPoolList = getBestTvlPoolList(allPools || []) as IPoolDcl[];
  function changeSearchText(e: any) {
    setSearchText(e.target.value);
  }
  function clearSearchText() {
    setSearchText("");
  }
  const filteredList = useMemo(() => {
    if (searchText) {
      const searchTextToLocaleLowerCase = searchText.toLocaleLowerCase();
      const searchResult = bestTvlPoolList.filter((p: IPoolDcl) => {
        const { token_x_metadata, token_y_metadata, pool_id } = p;
        return (
          token_x_metadata?.symbol
            ?.toLocaleLowerCase()
            .includes(searchTextToLocaleLowerCase) ||
          token_y_metadata?.symbol
            ?.toLocaleLowerCase()
            ?.includes(searchTextToLocaleLowerCase) ||
          token_x_metadata?.id == searchText ||
          token_y_metadata?.id == searchText
        );
      });
      return searchResult;
    }
    return bestTvlPoolList;
  }, [bestTvlPoolList?.length, searchText]);
  if (!show) return null;
  return (
    <div className="absolute rounded-lg border border-gray-70 bg-dark-70 py-2.5 right-0 top-8 z-50 w-[280px]">
      <p className="text-sm text-gray-60 mb-2.5 px-2.5">Instrument</p>
      <div className="flex items-center justify-between border border-gray-90 rounded-md bg-black bg-opacity-40 px-2.5 h-10 mx-2.5">
        <SearchIcon />
        <input
          className="mx-1.5 outline-none text-sm text-white flex-grow bg-transparent"
          placeholder="Search token"
          onChange={changeSearchText}
          value={searchText}
        />
        <CloseButttonIcon
          onClick={clearSearchText}
          className={`cursor-pointer ${searchText ? "" : "hidden"}`}
        />
      </div>
      <div
        style={{ maxHeight: "215px" }}
        className="overflow-y-auto px-2.5 thinGrayscrollBar mt-3"
      >
        {filteredList.map((p: IPoolDcl) => {
          const { token_x_metadata, token_y_metadata, pool_id } = p;
          const tokens = sort_tokens_by_base([
            token_x_metadata as TokenMetadata,
            token_y_metadata as TokenMetadata,
          ]);
          const isSelected = selectedDclPool?.pool_id == pool_id;
          return (
            <div
              key={p.pool_id}
              style={{ height: "38px" }}
              className={`flex items-center justify-between rounded-md px-2.5 py-1.5 mb-1.5 hover:bg-dark-10 gap-10 cursor-pointer min-w-max ${
                isSelected ? "bg-dark-10" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p);
              }}
            >
              <div className="flex items-center gap-2">
                <Images tokens={tokens} />
                <Symbols tokens={tokens} />
              </div>
              {isSelected ? <SelectedIcon /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function SelectDclTokenModalPre({
  onSelect,
  show,
  onRequestClose,
}: {
  onSelect: (pool: IPoolDcl) => void;
  show: boolean;
  onRequestClose: any;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allPools = persistLimitStore.getAllDclPools();
  const selectedDclPool = persistLimitStore.getDclPool();
  const bestTvlPoolList = getBestTvlPoolList(allPools || []) as IPoolDcl[];
  function changeSearchText(e: any) {
    setSearchText(e.target.value);
  }
  function clearSearchText() {
    setSearchText("");
  }
  const filteredList = useMemo(() => {
    if (searchText) {
      const searchResult = bestTvlPoolList.filter((p: IPoolDcl) => {
        const { token_x_metadata, token_y_metadata, pool_id } = p;
        return (
          token_x_metadata?.symbol
            ?.toLocaleLowerCase()
            .includes(searchText.toLocaleLowerCase()) ||
          token_y_metadata?.symbol?.toLocaleLowerCase()?.includes(searchText) ||
          token_x_metadata?.id == searchText ||
          token_y_metadata?.id == searchText
        );
      });
      return searchResult;
    }
    return bestTvlPoolList;
  }, [bestTvlPoolList?.length, searchText]);
  if (!show) return null;
  return (
    <Modal
      isOpen={show}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div className="rounded-lg bg-dark-10 py-2.5 w-screen">
        <p className="text-base text-white px-2.5 mt-2 mb-4">Instrument</p>
        <div className="flex items-center justify-between border border-gray-90 rounded-md bg-black bg-opacity-40 px-2.5 h-[46px] mx-2.5">
          <SearchIcon />
          <input
            className="mx-1.5 outline-none text-base text-white flex-grow bg-transparent"
            placeholder="Search token"
            onChange={changeSearchText}
            value={searchText}
          />
          <CloseButttonIcon
            onClick={clearSearchText}
            className={`cursor-pointer ${searchText ? "" : "hidden"}`}
          />
        </div>
        <div
          style={{ maxHeight: "60vh" }}
          className="overflow-y-auto px-2.5 thinGrayscrollBar mt-3"
        >
          {filteredList.map((p: IPoolDcl) => {
            const { token_x_metadata, token_y_metadata, pool_id } = p;
            const tokens = sort_tokens_by_base([
              token_x_metadata as TokenMetadata,
              token_y_metadata as TokenMetadata,
            ]);
            const isSelected = selectedDclPool?.pool_id == pool_id;
            return (
              <div
                key={p.pool_id}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 mb-1.5 gap-10 cursor-pointer min-w-max h-[50px] ${
                  isSelected ? "bg-gray-280" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(p);
                }}
              >
                <div className="flex items-center gap-2">
                  <Images tokens={tokens} />
                  <Symbols tokens={tokens} />
                </div>
                {isSelected ? <SelectedIconBig /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function Images({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center flex-shrink-0">
      {tokens.map((token, index) => {
        return (
          <img
            key={token.id}
            src={token.icon}
            className={`w-6 h-6 rounded-full border-gray-110 border-opacity-50 flex-shrink-0 ${
              index > 0 ? " -ml-1.5" : ""
            }`}
          />
        );
      })}
    </div>
  );
}
function Symbols({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        return (
          <span
            key={token.id}
            className="text-white text-sm xsm:text-base font-bold"
          >
            {token.symbol}
            {index == 0 ? "-" : ""}
          </span>
        );
      })}
    </div>
  );
}

export default React.memo(SelectDclTokenBox);
export const SelectDclTokenModal = React.memo(SelectDclTokenModalPre);
