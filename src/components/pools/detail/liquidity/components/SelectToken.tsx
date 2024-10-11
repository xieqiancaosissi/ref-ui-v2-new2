import { useState, useEffect, useMemo, useRef } from "react";
import { TokenMetadata } from "@/services/ft-contract";
// import { isMobile } from "@/utils/device";
import { useIntl } from "react-intl";
import { useDefaultWhitelistTokens } from "@/hooks/useDefaultWhitelistTokens";
import { PoolInfo } from "@/services/swapV3";
import { sort_tokens_by_base } from "@/services/commonV3";
import { useAllPoolsV2 } from "@/hooks/usePools";
import { Symbols, Images, IconLeftV3 } from "./liquidityComComp";
import { SearchIcon } from "@/components/common/Icons";
import { CloseButttonIcon } from "@/components/common/SelectTokenModal/Icons";
export function SelectTokenDCL({
  selectTokenIn,
  selectTokenOut,
  selectedToken,
  onSelect,
  selected,
  className,
  notNeedSortToken,
  limitOrder = false,
}: {
  selectTokenIn?: (token: TokenMetadata) => void;
  selectTokenOut?: (token: TokenMetadata) => void;
  onSelect?: (token: TokenMetadata) => void;
  selectedToken?: TokenMetadata;
  selected?: JSX.Element;
  className?: string;
  notNeedSortToken?: boolean;
  limitOrder?: boolean;
}) {
  const allPools = useAllPoolsV2(!limitOrder);
  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const intl = useIntl();

  // const mobileDevice = isMobile();

  const { whiteListTokens: globalWhiteList }: any = useDefaultWhitelistTokens();

  const displayPools = allPools?.reduce((acc, cur, i) => {
    const id = [cur.token_x, cur.token_y].sort().join("|");
    if (!acc[id]) {
      acc[id] = cur;
    }
    return acc;
  }, {} as Record<string, PoolInfo>);

  const handleSelect = (p: PoolInfo) => {
    // select token in
    const { token_x_metadata, token_y_metadata }: any = p;
    const tokens = notNeedSortToken
      ? [token_x_metadata, token_y_metadata]
      : sort_tokens_by_base([token_x_metadata, token_y_metadata]);

    if (!selectedToken) {
      selectTokenIn && selectTokenIn(tokens[0]);
      selectTokenOut && selectTokenOut(tokens[1]);

      return;
    }

    if (!!selectTokenOut) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenOut(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenOut(tokens[0]);
      } else {
        onSelect && onSelect(tokens[0]);
        selectTokenOut(tokens[1]);
      }

      return;
    }

    if (!!selectTokenIn) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenIn(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenIn(tokens[0]);
      } else {
        onSelect && onSelect(tokens[1]);
        selectTokenIn(tokens[0]);
      }
      return;
    }
  };

  const [searchText, setSearchText] = useState<string>("");
  function changeSearchText(e: any) {
    setSearchText(e.target.value);
  }
  function clearSearchText() {
    setSearchText("");
  }
  const renderPools = useMemo(
    () =>
      Object.values(displayPools || {})?.filter((p) => {
        const { token_x_metadata, token_y_metadata }: any = p;
        if (searchText.trim() !== "") {
          return (
            !!globalWhiteList.find(
              (t: any) =>
                t.id === token_x_metadata.id &&
                (token_x_metadata.symbol
                  .toLowerCase()
                  .indexOf(searchText.toLowerCase()) != -1 ||
                  token_y_metadata.symbol
                    .toLowerCase()
                    .indexOf(searchText.toLowerCase()) != -1)
            ) &&
            !!globalWhiteList.find(
              (t: any) =>
                t.id === token_y_metadata.id &&
                (token_x_metadata.symbol
                  .toLowerCase()
                  .indexOf(searchText.toLowerCase()) != -1 ||
                  token_y_metadata.symbol
                    .toLowerCase()
                    .indexOf(searchText.toLowerCase()) != -1)
            )
          );
        } else {
          return (
            !!globalWhiteList.find((t: any) => t.id === token_x_metadata.id) &&
            !!globalWhiteList.find((t: any) => t.id === token_y_metadata.id)
          );
        }
      }),
    [globalWhiteList, allPools?.length, searchText]
  );

  const renderList =
    renderPools.length > 0 ? (
      renderPools?.map((p) => {
        const { token_x_metadata, token_y_metadata }: any = p;
        const tokens = sort_tokens_by_base([
          token_x_metadata,
          token_y_metadata,
        ]);
        return (
          <div
            key={p.pool_id}
            className="flex items-center text-sm xs:text-base min-w-max px-1.5 bg-opacity-90 py-3 rounded-lg hover:bg-dark-10 cursor-pointer"
            onClick={() => {
              setHoverSelectToken(false);
              handleSelect(p);
            }}
          >
            <Images tokens={tokens} size="5" className="mr-2 ml-1" />

            <Symbols tokens={tokens} separator="-" />
          </div>
        );
      })
    ) : (
      <div className="h-[280px] fccc text-gray-60 text-sm">
        There's No Content
      </div>
    );

  // fetch all dcl pools

  useEffect(() => {
    if (hoverSelectToken && isMobile) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [hoverSelectToken]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const modalRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setHoverSelectToken(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div
      className="outline-none relative my-auto flex-shrink-0 bg-dark-10"
      ref={modalRef}
    >
      {(selected || selectedToken) && (
        <div
          className="flex items-center relative justify-end font-semibold"
          style={{
            zIndex: !!selectTokenOut ? 80 : 70,
          }}
          onClick={() => {
            setHoverSelectToken((pre) => !pre);
          }}
        >
          {selected || (
            <IconLeftV3
              size={"7"}
              token={selectedToken as any}
              hover={hoverSelectToken}
              className={"p-1"}
            />
          )}
        </div>
      )}

      {hoverSelectToken && (
        <div
          className={`${
            className ||
            "pt-2  absolute top-8 outline-none xsm:text-white xsm:font-bold xsm:fixed xsm:bottom-0 xsm:w-full  right-0"
          }    `}
          style={{
            zIndex: isMobile ? 80 : !!selectTokenOut ? 80 : 75,
          }}
        >
          {isMobile && (
            <div
              className="fixed w-screen h-screen top-0"
              style={{
                zIndex: 150,
                background: "rgba(0, 19, 32, 0.8)",
                position: "fixed",
              }}
              onClick={() => {
                setHoverSelectToken(false);
              }}
            ></div>
          )}
          <div
            className="overflow-auto xsm:absolute xsm:w-full xsm:bottom-0 xsm:pb-8 xsm:rounded-2xl rounded-lg bg-dark-70 px-2 pb-3 lg:w-[280px] xsm:hidden border border-gray-70"
            style={{
              zIndex: isMobile ? 300 : "",
              maxHeight: isMobile ? `${48 * 10 + 78}px` : "380px",
              minHeight: isMobile ? `${48 * 5 + 78}px` : "",
            }}
          >
            <div
              className="sticky top-0 bg-dark-70 py-2"
              style={{
                zIndex: 100,
              }}
            >
              <p className="text-sm text-gray-60 mb-2.5">Instrument</p>
              <div className="flex items-center justify-between border border-gray-90 rounded-md bg-black bg-opacity-40 px-2.5 h-10">
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
            </div>
            {renderList}
          </div>

          <div
            className="overflow-auto xsm:absolute xsm:w-full xsm:bottom-0 xsm:pb-8 xsm:rounded-2xl rounded-lg bg-dark-70 px-2 pb-3 lg:w-70 lg:hidden"
            style={{
              zIndex: isMobile ? 300 : "",
              maxHeight: isMobile ? `${48 * 10 + 78}px` : "380px",
              minHeight: isMobile ? `${48 * 5 + 78}px` : "",
            }}
          >
            <div
              className="sticky top-0 bg-dark-70 py-3"
              style={{
                zIndex: 100,
              }}
            >
              <p className="text-sm text-gray-60 mb-2.5">Instrument</p>
              <div className="flex items-center justify-between border border-gray-90 rounded-md bg-black bg-opacity-40 px-2.5 h-10">
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
            </div>
            {renderList}
          </div>
        </div>
      )}
    </div>
  );
}
