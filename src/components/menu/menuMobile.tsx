import React from "react";
// CSR,
const WalletConnect = dynamic(() => import("./walletConnect"), {
  ssr: false,
});
const BuyNearButton = dynamic(() => import("../buyNear/button"), {
  ssr: false,
});
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/router";
import { LogoMobileIcon, MoreMobileIcon, LogoSmallMobileIcon } from "./icons2";
import BridgeConfirmModal from "./bridgeConfirmModal";
import { useRefPrice } from "../../hooks/useRefPrice";
import { menuData, IMenuChild, routeMapIds } from "./menuData";
import { RefAnalyticsIcon } from "@/components/footer/icons";
import { DownArrowIcon } from "./icons";
function MenuMobile() {
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [oneLevelMenuId, setOneLevelMenuId] = useState("trade");
  const [twoLevelMenuId, setTwoLevelMenuId] = useState("swap");
  const [oneLevelHoverId, setOneLevelHoverId] = useState<string>();
  const [isBridgeOpen, setIsBridgeOpen] = useState<boolean>(false);
  const [bridgeData, setBridgeData] = useState<any>({});
  const menuList = menuData();
  const router = useRouter();
  const { refPrice, priceLoading } = useRefPrice();
  useEffect(() => {
    const clickEvent = (e: any) => {
      const path = e.composedPath();
      const el = path.find(
        (el: any) => el.id == "menuContent" || el.id == "menuButton"
      );
      if (!el) {
        hideMoreEvent();
      }
    };
    document.addEventListener("click", clickEvent);
    return () => {
      document.removeEventListener("click", clickEvent);
    };
  }, [oneLevelMenuId]);
  useEffect(() => {
    chooseMenuByRoute(router.route);
  }, [router.route]);

  function chooseMenuByRoute(route: string) {
    const target = Object.entries(routeMapIds).find(([, value]) => {
      return value.includes(route);
    });
    if (target) {
      const arr = target[0].split("-");
      setOneLevelMenuId(arr[0]);
      setOneLevelHoverId(arr[0]);
      if (arr[1]) {
        setTwoLevelMenuId(arr[1]);
      } else {
        setTwoLevelMenuId("");
      }
    }
  }
  function showMoreEvent() {
    setShowMoreMenu(true);
  }
  function hideMoreEvent() {
    setShowMoreMenu(false);
    setOneLevelHoverId(oneLevelMenuId);
  }
  function jump(menu: any) {
    if (menu.path) {
      hideMoreEvent();
      router.push(menu.path!);
    } else if (menu.externalLink) {
      if (menu.bridgeConfirm) {
        setBridgeData(menu);
        setIsBridgeOpen(true);
      } else {
        hideMoreEvent();
        window.open(menu.externalLink);
      }
    }
  }
  function closeBridgeConfirmModal() {
    setIsBridgeOpen(false);
  }
  return (
    <div className="h-[45px]">
      <div className="flex items-center fixed top-0 left-0 right-0 px-4 h-[45px] bg-dark-240 z-[100]">
        <div className="flexBetween w-full">
          <LogoMobileIcon
            onClick={() => {
              window.open("https://www.ref.finance/");
            }}
          />
          <div className="flex items-center gap-4 text-white">
            <WalletConnect />
            <MoreMobileIcon onClick={showMoreEvent} id="menuButton" />
          </div>
        </div>
        <div
          className={showMoreMenu ? "" : "hidden"}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 100,
            outline: "none",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            id="menuContent"
            className="absolute right-0 bottom-8 top-0 min-w-[280px] w-3/4 bg-dark-140 py-3"
          >
            {/* top bar */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center h-[26px] rounded-full pl-0.5 pr-2 bg-modalGrayBg gap-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full px-0.5 border border-dark-100 bg-black">
                  <LogoSmallMobileIcon />
                </span>
                {!priceLoading ? (
                  <span className="text-white text-sm font-bold">
                    {refPrice && !isNaN(parseFloat(refPrice))
                      ? "$" + Big(refPrice).toFixed(2)
                      : "-"}
                  </span>
                ) : (
                  <SkeletonTheme
                    baseColor="rgba(106, 114, 121, 0.3)"
                    highlightColor="rgba(255, 255, 255, 0.3)"
                  >
                    <Skeleton width={42} height={16} />
                  </SkeletonTheme>
                )}
              </div>
              <div className="flex items-center gap-2">
                <BuyNearButton />
                {/* <Bridge /> */}
              </div>
            </div>
            {/* menu list */}
            <div className="mt-4 border-b border-gray-240">
              {menuList.map((menu) => {
                const hasChildren = !!menu.children;
                const selected = oneLevelMenuId == menu.id;
                const showChildren = oneLevelHoverId == menu.id;
                return (
                  <div key={menu.id} className="border-t border-gray-240">
                    <div
                      className={`flex items-center justify-between px-8 text-gray-10 text-base h-[50px] ${
                        selected ? "bg-gray-20 text-white" : ""
                      }`}
                      onClick={() => {
                        if (hasChildren) {
                          if (showChildren) {
                            setOneLevelHoverId("");
                          } else {
                            setOneLevelHoverId(menu.id);
                          }
                        } else {
                          jump(menu);
                        }
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        {menu.icon}
                        {menu.label}
                      </span>
                      <DownArrowIcon
                        className={`${
                          !hasChildren
                            ? `transform -rotate-90 ${
                                selected ? "text-white" : ""
                              }`
                            : showChildren
                            ? "transform rotate-180 text-white"
                            : ""
                        }`}
                      />
                    </div>
                    {hasChildren && showChildren ? (
                      <div className="">
                        {menu?.children?.map((child: IMenuChild, index) => {
                          const selectedChild = child.id == twoLevelMenuId;
                          return (
                            <div
                              onClick={() => {
                                jump(child);
                              }}
                              className={`flex items-center gap-2.5 text-gray-10 h-[48px] pl-12 ${
                                selectedChild ? "text-primaryGreen" : ""
                              } ${
                                index == (menu.children?.length ?? 0) - 1
                                  ? "mb-1.5"
                                  : ""
                              }`}
                              key={child.id}
                            >
                              {child.icon}
                              {child.label}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {/* footer */}
            <div className="flex items-center justify-between absolute bottom-0 h-[50px] bg-gray-20 w-full left-0 px-4 text-gray-50 text-sm">
              <div className="flex items-center gap-2">
                <RefAnalyticsIcon />
                <span
                  className="text-sm"
                  onClick={() => {
                    window.open("https://stats.ref.finance/");
                  }}
                >
                  <span className="text-white">Ref.</span> analytics
                </span>
              </div>
              <div
                onClick={() =>
                  window.open("https://guide.ref.finance/developers/audits")
                }
                className="underline"
              >
                Security
              </div>
            </div>
          </div>
        </div>
      </div>
      <BridgeConfirmModal
        isOpen={isBridgeOpen}
        onRequestClose={closeBridgeConfirmModal}
        bridgeData={bridgeData}
      />
    </div>
  );
}
export default React.memo(MenuMobile);
