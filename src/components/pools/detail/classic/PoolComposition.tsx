import React from "react";
import tokenIcons from "@/utils/tokenIconConfig";
import { NearIcon } from "@/components/pools/icon";
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  multiply,
} from "@/utils/numbers";
import { useRouter } from "next/router";
import { usePersistSwapStore } from "@/stores/swap";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { filterSpecialChar } from "@/utils/numbers";

function PoolComposition(props: any) {
  const { poolDetail, tokenPriceList, updatedMapList } = props;
  const title = ["Pair", "Amount", "Value"];
  const persistSwapStore = usePersistSwapStore();
  const router = useRouter();
  const toSwap = (tokenList: any) => {
    persistSwapStore.setTokenInId(getTokenUIId(tokenList[0].id));
    persistSwapStore.setTokenOutId(getTokenUIId(tokenList[1].id));
    router.push("/");
  };

  function TokenIconComponent({ ite }: { ite: any }) {
    const hasCustomIcon = Reflect.has(tokenIcons, ite.tokenId);
    const isNearToken = ite.tokenId === "wrap.near";
    const iconStyle = { width: "26px", height: "26px", borderRadius: "50%" };
    if (hasCustomIcon && !isNearToken) {
      return (
        <div className={`relative`}>
          <img
            src={ite.icon || tokenIcons[ite.tokenId]}
            alt=""
            style={iconStyle}
          />
        </div>
      );
    }

    if (isNearToken) {
      return <NearIcon style={iconStyle} />;
    }

    return (
      <div>
        <img src={ite.icon} alt="" style={iconStyle} />
      </div>
    );
  }
  return (
    <div className="lg:w-183 xsm:w-full min-h-42 rounded-md p-4 bg-refPublicBoxDarkBg">
      {/* title */}
      <div className="grid grid-cols-11 xsm:hidden">
        {title.map((item, index) => {
          return (
            <span
              className={`${
                index == 0 ? "col-span-5" : "col-span-3"
              } text-sm text-gray-60 font-normal`}
              key={item + "_" + index}
            >
              {item}
            </span>
          );
        })}
      </div>
      {/* pair pc */}
      <div className="xsm:hidden">
        {updatedMapList.map((item: any, index: number) => {
          return item?.token_account_ids?.map((ite: any, ind: number) => {
            const tokenAmount = toReadableNumber(
              ite.decimals,
              item.supplies[ite.tokenId]
            );
            const price = tokenPriceList?.[ite.tokenId]?.price;
            return (
              <div
                className="grid grid-cols-11 my-3 hover:opacity-90"
                key={ite.tokenId + ind}
              >
                {/* token */}
                <div className="col-span-5 flex items-center">
                  {TokenIconComponent({ ite })}
                  <div className="ml-3">
                    <h4 className="text-base text-white font-medium">
                      {filterSpecialChar(item.token_symbols[ind])}
                    </h4>
                    <p
                      className="text-xs text-gray-60 underline cursor-pointer"
                      title={ite.tokenId}
                      onClick={() => toSwap(item.token_account_ids)}
                    >
                      {ite.tokenId.length > 30
                        ? ite.tokenId.substring(0, 30) + "..."
                        : ite.tokenId}
                    </p>
                  </div>
                </div>
                {/* amounts */}
                <div className="col-span-3 flex items-center text-sm text-white font-normal">
                  {+tokenAmount > 0 && +tokenAmount < 0.01
                    ? "< 0.01"
                    : toInternationalCurrencySystem(tokenAmount, 2)}
                </div>
                {/* price */}
                <div className="col-span-3 flex items-center text-sm text-white font-normal">
                  {!!price
                    ? `$${toInternationalCurrencySystem(
                        multiply(price, tokenAmount),
                        2
                      )}`
                    : null}
                </div>
              </div>
            );
          });
        })}
      </div>

      {/* pair */}
      <div className="lg:hidden">
        {updatedMapList.map((item: any, index: number) => {
          return item?.token_account_ids?.map((ite: any, ind: number) => {
            const tokenAmount = toReadableNumber(
              ite.decimals,
              item.supplies[ite.tokenId]
            );
            const price = tokenPriceList?.[ite.tokenId]?.price;

            return (
              <div
                className="flex my-3 hover:opacity-90"
                key={ite.tokenId + ind}
              >
                {/* token */}
                <div className="mt-1">{TokenIconComponent({ ite })}</div>

                <div
                  className={`${
                    ind < item?.token_account_ids.length - 1
                      ? "border border-b-gray-240 border-transparent"
                      : ""
                  } ml-3 flex-1 pb-3`}
                >
                  <div className="flex items-center">
                    <div>
                      <h4 className="text-base text-white font-medium">
                        {filterSpecialChar(item.token_symbols[ind])}
                      </h4>
                      <p
                        className="text-xs text-gray-60 underline cursor-pointer"
                        title={ite.tokenId}
                        onClick={() => toSwap(item.token_account_ids)}
                      >
                        {ite.tokenId.length > 30
                          ? ite.tokenId.substring(0, 30) + "..."
                          : ite.tokenId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 w-full flex justify-between items-center">
                    {/* amounts */}
                    <div className="flex items-center text-sm text-white font-normal w-1/2">
                      <span className="text-gray-50 mr-1"> Amount:</span>
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2)}
                    </div>
                    {/* price */}
                    <div className="flex items-center text-sm text-white font-normal w-1/2">
                      <span className="text-gray-50 mr-1"> Value:</span>
                      {!!price
                        ? `$${toInternationalCurrencySystem(
                            multiply(price, tokenAmount),
                            2
                          )}`
                        : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
export default React.memo(PoolComposition);
