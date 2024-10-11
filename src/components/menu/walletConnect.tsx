import React, { useEffect, useState } from "react";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import "react-loading-skeleton/dist/skeleton.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  DownArrowIcon,
  CopyIcon,
  DisconnectIcon,
  ChangeIcon,
  KeyIcon,
} from "./icons";
import { useAccountStore } from "../../stores/account";
import { getCurrentWallet, getSelector } from "../../utils/wallet";
import type { Wallet } from "@near-wallet-selector/core";
import swapStyles from "../swap/swap.module.css";
import AccessKeyModal from "./AccessKeyModal";
import { showWalletSelectorModal } from "@/utils/wallet";
import { isMobile } from "@/utils/device";
import Guider from "./Guider";
import { LinkLine } from "./icons2";
import { useAppStore } from "@/stores/app";
import { walletIconConfig } from "./walletConfig";
import { getSelectedWalletId } from "@/utils/wallet";
import Overview from "../portfolio";
const is_mobile = isMobile();
function WalletConnect() {
  const [currentWallet, setCurrentWallet] = useState<Wallet>();
  const [tipVisible, setTipVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [personalVisited, setPersonalVisited] = useState<boolean>(false);
  const [keyModalShow, setKeyModalShow] = useState<boolean>(false);
  const appStore = useAppStore();
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const walletLoading = accountStore.getWalletLoading();
  const isInMemePage = window.location.pathname.includes("meme");
  const personalDataReloadSerialNumber =
    appStore.getPersonalDataReloadSerialNumber();
  const [showGuider, setShowGuider] = useState<boolean>(
    !!(
      localStorage.getItem("ACCESS_MODAL_GUIDER") !== "1" &&
      accountId &&
      !is_mobile &&
      !isInMemePage
    )
  );
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isKeyPomWallet = selectedWalletId == "keypom";

  const walletId = getSelectedWalletId();

  useEffect(() => {
    if (accountId) {
      const guiderCondition =
        localStorage.getItem("ACCESS_MODAL_GUIDER") !== "1" &&
        !is_mobile &&
        !isInMemePage;
      setShowGuider(guiderCondition);
    }
  }, [accountId]);

  useEffect(() => {
    get_current_wallet();
  }, [selectedWalletId]);

  useEffect(() => {
    if (
      !window?.sender?.near ||
      getSelector()?.store?.getState()?.selectedWalletId !== "sender"
    )
      return;
    window?.sender?.near?.on(
      "accountChanged",
      async (changedAccountId: string) => {
        if (accountId !== changedAccountId) {
          window.location.reload();
        }
      }
    );
  }, [window?.sender, accountId]);

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
    if (isOpen || showGuider) {
      setPersonalVisited(true);
    }
  }, [isOpen, showGuider]);
  useEffect(() => {
    if (personalDataReloadSerialNumber > 1) {
      setPersonalVisited(false);
    }
  }, [personalDataReloadSerialNumber]);
  useEffect(() => {
    if (accountId) {
      appStore.setPersonalDataReloadSerialNumber(
        personalDataReloadSerialNumber + 1
      );
    }
  }, [accountId]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  async function get_current_wallet() {
    const wallet = await getCurrentWallet();
    setCurrentWallet(wallet);
  }

  function showWalletSelector() {
    setIsOpen(false);
    showWalletSelectorModal(appStore.setShowRiskModal);
  }

  async function signOut() {
    setIsOpen(false);
    await currentWallet?.signOut();
  }

  const getAccountName = (accountId: string) => {
    const [account, network] = accountId.split(".");
    const niceAccountId = `${account.slice(0, 10)}...${network || ""}`;

    return account.length > 10 ? niceAccountId : accountId;
  };

  const handleBackdropClick = (e: any) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  function showkeyModal() {
    setIsOpen(false);
    setKeyModalShow(true);
    setShowGuider(false);
    localStorage.setItem("ACCESS_MODAL_GUIDER", "1");
  }

  function closeKeyModal() {
    setKeyModalShow(false);
  }

  function clearGuilder() {
    setShowGuider(false);
    localStorage.setItem("ACCESS_MODAL_GUIDER", "1");
  }
  function getWalletLogo() {
    const iconUrl = currentWallet?.metadata?.iconUrl;
    const wallet_id = currentWallet?.id;
    if (wallet_id && walletIconConfig[wallet_id]) {
      return walletIconConfig[wallet_id];
    } else if (iconUrl) {
      return (
        <Image
          src={iconUrl || ""}
          width={14}
          height={14}
          style={{
            width: "14px",
            height: "14px",
          }}
          alt=""
        />
      );
    }
    return null;
  }
  return (
    <div className="relative z-50">
      {!walletLoading ? (
        <>
          {accountId ? (
            <div onClick={() => setIsOpen(!isOpen)}>
              <div className="flex items-center justify-center rounded border border-gray-70 px-2.5 cursor-pointer gap-2 h-9 xsm:h-8">
                <div
                  className={`relative ${
                    walletId == "ledger" ? "top-0.5" : ""
                  }`}
                >
                  {getWalletLogo()}
                </div>

                <span className="text-sm text-lightWhite-10 font-semibold">
                  {getAccountName(accountId)}
                </span>
                <DownArrowIcon className="ml-1 relative top-0.5" />
              </div>
              {/* Click menu */}
              <div
                className={`fixed top-[45px] left-0 w-full h-[calc(100%-78px)] bg-black bg-opacity-50  ${
                  isOpen ? "block" : "hidden"
                }`}
                style={{
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                onClick={handleBackdropClick}
              ></div>
              {personalVisited || (showGuider && !isInMemePage) ? (
                <div
                  className={`fixed top-[45px] bottom-[35px] right-0 bg-dark-10 z-50 ${
                    isOpen || showGuider ? "block" : "hidden"
                  } ${is_mobile ? "w-full h-[300px]" : "w-[400px] h-auto"}`}
                  onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
                  style={{ zIndex: showGuider ? "1000" : "40" }}
                >
                  <div className="bg-dark-140 lg:border lg:border-gray-200 p-3.5 w-full h-full xsm:bg-dark-10">
                    <div className="frcb mb-3.5">
                      <div className="frcc gap-1">
                        {getWalletLogo()}
                        <p className="ml-0.5 text-base text-gray-80">
                          {currentWallet?.metadata?.name}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <KeyIcon
                          onClick={showkeyModal}
                          className={swapStyles.controlButton}
                        />
                        <ChangeIcon
                          onClick={() => {
                            if (!isKeyPomWallet) {
                              showWalletSelector();
                              setShowGuider(false);
                              localStorage.setItem("ACCESS_MODAL_GUIDER", "1");
                            }
                          }}
                          className={` text-gray-10  ${
                            isKeyPomWallet
                              ? " cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:text-lightWhite-10"
                          }`}
                        />
                        <DisconnectIcon
                          onClick={() => {
                            if (!isKeyPomWallet) {
                              signOut();
                            }
                          }}
                          className={` text-gray-10  ${
                            isKeyPomWallet
                              ? " cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:text-lightWhite-10"
                          }`}
                        />
                      </div>
                    </div>
                    <div className={showGuider ? "blur" : ""}>
                      <div className="frcc">
                        <span className="text-xl text-lightWhite-10 font-bold whitespace-nowrap mr-3">
                          {getAccountName(accountId)}
                        </span>
                        <div
                          data-tooltip-id="copy-tooltip"
                          data-tooltip-content={`${tipVisible ? "Copied" : ""}`}
                        >
                          <CopyToClipboard text={accountId}>
                            <CopyIcon
                              className={swapStyles.controlButton}
                              onClick={() => {
                                setTipVisible(true);
                              }}
                            />
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
                      </div>
                      <Overview isOpen={isOpen} setIsOpen={setIsOpen} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              onClick={showWalletSelector}
              className="flex items-center justify-end h-9 text-sm rounded border border-primaryGreen px-4 font-semibold text-primaryGreen cursor-pointer"
            >
              Connect Wallet
            </div>
          )}
        </>
      ) : (
        <SkeletonTheme baseColor="#1B242C" highlightColor="#9EFF00">
          <Skeleton height={36} width={138} />
        </SkeletonTheme>
      )}

      {accountId && keyModalShow ? (
        <AccessKeyModal isOpen={keyModalShow} onRequestClose={closeKeyModal} />
      ) : null}
      {/* Guider content */}
      {showGuider && !is_mobile && !isInMemePage ? (
        <div className="xsm:hidden">
          <Guider clearGuilder={clearGuilder} />
          <LinkLine
            className="absolute"
            style={{ zIndex: "1001", right: "76px", top: "82px" }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(WalletConnect);
