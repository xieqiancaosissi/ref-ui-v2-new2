import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { isMobile } from "../../../utils/device";
import { CloseIcon, SearchIcon } from "../Icons";
import { CloseButttonIcon } from "./Icons";
import AssetTable from "./AssetTable";
import { useTokenStore, ITokenStore } from "../../../stores/token";
import { ITokenMetadata } from "@/interfaces/tokens";
import { SelectTokenContext } from "./Context";
import { TokenMetadata } from "@/services/ft-contract";
import { useSwapStore } from "@/stores/swap";
import { purgeTokensByIds } from "./tokenUtils";
import { beautifyNumber } from "@/components/common/beautifyNumber";
export default function SelectTokenModal({
  isOpen,
  onRequestClose,
  onSelect,
  excludedTokenIds,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (token: ITokenMetadata, needFetch?: boolean) => void;
  excludedTokenIds?: Array<string>;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const [addTokenError, setAddTokenError] = useState<boolean>(false);
  const [hoverCommonToken, setHoverCommonToken] =
    useState<TokenMetadata | null>();
  const tokenStore = useTokenStore() as ITokenStore;
  const swapStore = useSwapStore();
  const common_tokens: ITokenMetadata[] = purgeTokensByIds(
    tokenStore.get_common_tokens(),
    excludedTokenIds
  );
  const allTokenPrices = swapStore.getAllTokenPrices();
  useEffect(() => {
    setAddTokenError(false);
  }, [searchText]);
  function changeSearchText(e: any) {
    setSearchText(e.target.value);
  }
  function clearSearchText() {
    setSearchText("");
  }
  function delete_common_token(t: TokenMetadata) {
    tokenStore.set_common_tokens(
      common_tokens.filter(
        (token) => !(token.id == t.id && token.symbol == t.symbol)
      )
    );
  }
  function getTokenUIPrice(tokenId: string) {
    const price = allTokenPrices[tokenId]?.price || "";
    return beautifyNumber({
      num: price,
      isUsd: true,
      className: "text-xs text-gray-50",
      subClassName: "text-[8px]",
    });
  }
  const is_mobile = isMobile();
  const cardWidth = is_mobile ? "100vw" : "430px";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div
        style={{
          width: cardWidth,
        }}
        className="rounded-lg xsm:rounded-b-none bg-dark-70 py-6"
      >
        {/* title */}
        <div className="flexBetween px-6">
          <span className="text-lg text-white font-bold">Select a Token</span>
          <CloseIcon
            className="text-dark-80 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        <SelectTokenContext.Provider
          value={{
            onRequestClose,
            onSelect,
            searchText,
            allTokenPrices,
            setAddTokenError,
          }}
        >
          {/* search box */}
          <div
            className="flex items-center rounded-md border border-gray-90 bg-black bg-opacity-40 mt-3.5 px-2.5 mx-6 hover:border-green-10"
            style={{
              height: "46px",
            }}
          >
            <SearchIcon />
            <input
              className="ml-1.5 outline-none text-sm text-white flex-grow bg-transparent"
              placeholder="Search name or paste address..."
              onChange={changeSearchText}
              value={searchText}
            />
            <CloseButttonIcon
              onClick={clearSearchText}
              className={`cursor-pointer ${searchText ? "" : "hidden"}`}
            />
          </div>
          {/* register token error tip  */}
          {addTokenError ? (
            <div className="text-red-10 text-sm pl-7 mt-1.5">
              The token address was invalid
            </div>
          ) : null}
          <div
            className={`relative overflow-y-auto px-6 mt-2 pt-2 thinGrayscrollBar`}
            style={{ height: "400px" }}
          >
            {/* common tokens */}
            <div
              className={`flex items-center gap-2 flex-wrap ${
                searchText ? "hidden" : ""
              }`}
            >
              {common_tokens.map((token) => {
                return (
                  <div
                    className={`flex items-center gap-1.5 relative pl-2 pr-3.5 py-0.5 border border-gray-40 hover:bg-gray-40 cursor-pointer rounded-lg`}
                    style={{
                      minWidth: "90px",
                    }}
                    key={token.id}
                    onMouseEnter={() => {
                      if (!is_mobile) {
                        setHoverCommonToken(token);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!is_mobile) {
                        setHoverCommonToken(null);
                      }
                    }}
                    onClick={() => {
                      onSelect(token, true);
                      onRequestClose();
                    }}
                  >
                    <img
                      className="rounded-full"
                      style={{
                        width: "26px",
                        height: "26px",
                      }}
                      src={token.icon || "/images/placeholder.svg"}
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{token.symbol}</span>
                      <span className="text-xs text-gray-50">
                        {getTokenUIPrice(token.id)}
                      </span>
                    </div>
                    {hoverCommonToken?.id == token.id &&
                    hoverCommonToken.symbol == token.symbol ? (
                      <CloseButttonIcon
                        onClick={(e: any) => {
                          e.stopPropagation();
                          delete_common_token(token);
                        }}
                        className="absolute -right-2 -top-2 cursor-pointer transform scale-75"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            {/* assets table */}
            <AssetTable excludedTokenIds={excludedTokenIds} />
          </div>
        </SelectTokenContext.Provider>
      </div>
    </Modal>
  );
}
