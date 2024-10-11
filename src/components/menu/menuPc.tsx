import React from "react";
// CSR,
const WalletConnect = dynamic(() => import("./walletConnect"), {
  ssr: false,
  loading: () => (
    <SkeletonTheme baseColor="#1B242C" highlightColor="#9EFF00">
      <Skeleton height={36} width={138} />
    </SkeletonTheme>
  ),
});
const BuyNearButton = dynamic(() => import("../buyNear/button"), {
  ssr: false,
});
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { MenuContainer } from "./icons";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import BridgeConfirmModal from "./bridgeConfirmModal";
import { menuData, IMenuChild, routeMapIds } from "./menuData";

function MenuPc() {
  const [oneLevelMenuId, setOneLevelMenuId] = useState("trade");
  const [twoLevelMenuId, setTwoLevelMenuId] = useState("swap");
  const [twoLevelMenuShow, setTwoLevelMenuShow] = useState<boolean>(true);
  const [isBridgeOpen, setIsBridgeOpen] = useState<boolean>(false);
  const [bridgeData, setBridgeData] = useState<any>({});
  const menuList = menuData();
  const router = useRouter();
  const oneLevelData = useMemo(() => {
    let oneLevel;
    if (oneLevelMenuId) {
      oneLevel = menuList.find((item) => item.id === oneLevelMenuId);
    }
    return oneLevel;
  }, [oneLevelMenuId, menuList]);
  useEffect(() => {
    chooseMenuByRoute(router.route);
  }, [router.route]);
  function chooseOneLevelMenu(id: string) {
    const choosedMenu = menuList.find((menu) => menu.id === id);
    if (!choosedMenu) {
      return;
    }
    if (oneLevelMenuId === id) {
      if (choosedMenu?.children) {
        setTwoLevelMenuShow(!twoLevelMenuShow);
      }
      return;
    }
    setOneLevelMenuId(id);
    if (choosedMenu?.children) {
      setTwoLevelMenuShow(true);
    } else if (choosedMenu?.path) {
      router.push(choosedMenu.path);
      setTwoLevelMenuId("");
    }
  }
  function chooseTwoLevelMenu(item: IMenuChild) {
    setTwoLevelMenuId(item.id);
    if (item.path) {
      router.push(item.path);
    } else if (item.externalLink) {
      if (item.bridgeConfirm) {
        setBridgeData(item);
        setIsBridgeOpen(true);
      } else {
        window.open(item.externalLink);
      }
    }
  }
  function chooseMenuByRoute(route: string) {
    const target = Object.entries(routeMapIds).find(([, value]) => {
      return value.includes(route);
    });
    if (target) {
      const arr = target[0].split("-");
      setOneLevelMenuId(arr[0]);
      if (arr[1]) {
        setTwoLevelMenuId(arr[1]);
      } else {
        setTwoLevelMenuId("");
      }
    }
  }
  function closeBridgeConfirmModal() {
    setIsBridgeOpen(false);
  }
  // for stable detail css style
  const [extraBack, setExtraBack] = useState("transparent");
  const [extraWidth, setExtraWidth] = useState("");
  useEffect(() => {
    setExtraBack("transparent");
    if (router.route.indexOf("/sauce") != -1) {
      setExtraBack("#0e1A23");
      setExtraWidth("100%");
    } else if (oneLevelData?.children && oneLevelData.children.length > 3) {
      setExtraWidth("680px");
    } else {
      setExtraWidth("510px");
    }
  }, [router.route, oneLevelData?.children?.length]);

  return (
    <div className="fixed w-full h-[46px]" style={{ zIndex: "99" }}>
      {/* one level menu */}
      <div
        className="grid grid-cols-3 items-center text-white px-5 border-b border-white border-opacity-10 bg-primaryDark"
        style={{ height: "46px" }}
      >
        <Image src="/images/logo.svg" width={127} height={17} alt="" />
        <div className="justify-self-center flex items-center gap-14">
          {menuList.map((menu) => {
            return (
              <div
                key={menu.id}
                className={`flex items-center gap-1.5 cursor-pointer font-bold text-base ${
                  oneLevelMenuId === menu.id ? "text-green-10" : "text-gray-10"
                }`}
                onClick={() => {
                  chooseOneLevelMenu(menu.id);
                }}
              >
                {menu.icon}
                {menu.label}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2.5 justify-self-end">
          <BuyNearButton />
          {/* <Bridge /> */}
          <WalletConnect />
        </div>
      </div>
      {/* two level menu */}
      {oneLevelData?.children ? (
        <div
          className={`flex items-center justify-center relative gap-6 z-40 ${
            twoLevelMenuShow ? "" : "hidden"
          }`}
          style={{
            height: "46px",
            background: extraBack,
            width: extraWidth,
            margin: "0 auto",
          }}
        >
          {oneLevelData.children.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => {
                  chooseTwoLevelMenu(item);
                }}
                className={`flex items-center h-9 rounded cursor-pointer text-base gap-2 px-5 ${
                  oneLevelData.children.length == 2 ? "px-[36px]" : ""
                } ${
                  twoLevelMenuId === item.id ? "text-white" : "text-gray-10"
                }`}
              >
                <span
                  className={`${
                    twoLevelMenuId === item.id ? "text-white" : ""
                  }`}
                >
                  {item.icon}
                </span>{" "}
                {item.label}
              </div>
            );
          })}
          <MenuContainer
            className={`absolute transform ${
              oneLevelData.children.length > 3
                ? "scale-x-100"
                : oneLevelData.children.length < 3
                ? "scale-x-[68%]"
                : "scale-x-75"
            }`}
            style={{ zIndex: "-1" }}
          />
        </div>
      ) : null}
      <BridgeConfirmModal
        isOpen={isBridgeOpen}
        onRequestClose={closeBridgeConfirmModal}
        bridgeData={bridgeData}
      />
    </div>
  );
}
export default React.memo(MenuPc);
