import React, { useState, useMemo, useEffect } from "react";
import Modal from "react-modal";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { isMobile } from "../../utils/device";
import { toReadableNumber, toPrecision } from "../../utils/numbers";
import { batchDeleteKeys } from "../../services/portfolioData";
import { ModalClose, QuestionMark } from "../farm/icon";
import { getAccountId } from "@/utils/wallet";
import CustomTooltip from "../customTooltip/customTooltip";
import { getAccount } from "@/utils/near";
import { CheckedIcon } from "./icons";
import { ButtonTextWrapper } from "../common/Button";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import successToast from "../common/toast/successToast";
import failToast from "../common/toast/failToast";
import { getUsedKey } from "@/utils/wallet";
const maxLength = 10;
function AccessKeyModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? "100vw" : "550px";
  const cardHeight = isMobile() ? "90vh" : "auto";
  const is_mobile = isMobile();
  const [currentUsedKeys, setCurrentUsedKeys] = useState<string[]>([]);
  const accountId = getAccountId();
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const appStore = useAppStore();
  const [addSuccess, setAddSuccess] = useState<number>(0);

  useEffect(() => {
    getUsedKeys();
  }, [accountId]);
  useEffect(() => {
    async function fetchKeys() {
      try {
        const account = await getAccount();
        const keys = await account.getAccessKeys();
        setAllKeys(keys);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch keys:", error);
        setLoading(false);
      }
    }

    fetchKeys();
  }, [addSuccess]);
  async function getUsedKeys() {
    const keyUsed = getUsedKey();
    setCurrentUsedKeys([keyUsed]);
  }
  function getApprovedTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48">
        Authorize one Gas fee key per Dapp. Clean up if there are multiples.
    </div>
    `;
  }
  function switchWallet() {
    showWalletSelectorModal(appStore.setShowRiskModal);
    onRequestClose();
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
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
        className="bg-dark-10 lg:rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="frcb pt-6 pl-6 pb-5 border-b border-white border-opacity-10 xsm:pt-0 xsm:pb-0 xsm:pr-6">
          <div className="flex items-center w-full">
            <div
              className={`flex items-center gap-1.5 text-base pr-4 cursor-pointer xsm:w-1/2 xsm:justify-center xsm:pt-5 xsm:pb-2.5 text-white xsm:border-b-2 xsm:border-white xsm:border-r-0`}
            >
              <span className="paceGrotesk-Bold "> Approved</span>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-tooltip-id={"approved"}
                data-place="top"
                data-tooltip-html={getApprovedTip()}
              >
                <QuestionMark />
                <CustomTooltip id={"approved"} />
              </div>
            </div>
          </div>
          <ModalClose
            className="cursor-pointer mr-6 xsm:hidden"
            onClick={onRequestClose}
          />
        </div>
        <AuthorizedApps
          currentUsedKeys={currentUsedKeys}
          switchWallet={switchWallet}
          allKeys={allKeys}
          setAddSuccess={setAddSuccess}
          onRequestClose={onRequestClose}
        />
      </div>
    </Modal>
  );
}
function AuthorizedApps({
  currentUsedKeys,
  allKeys,
  switchWallet,
  onRequestClose,
}: {
  currentUsedKeys: string[];
  allKeys: any[];
  switchWallet: any;
  setAddSuccess: any;
  onRequestClose: any;
}) {
  const [clear_loading, set_clear_loading] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [loading, setLoading] = useState<boolean>(true);
  const disbaledWallet = ["sender", "neth", "keypom", "okx-wallet"];
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  useEffect(() => {
    if (allKeys.length > 0) {
      setLoading(false);
    }
  }, [allKeys]);
  const functionCallKeys = useMemo(() => {
    return allKeys.filter((key) => key.access_key.permission !== "FullAccess");
  }, [allKeys]);
  const allCheckdLength = useMemo(() => {
    if (functionCallKeys?.length) {
      const m = functionCallKeys.filter(
        (item) => !currentUsedKeys.includes(item.public_key)
      );
      return Math.min(m.length, maxLength);
    }
    return 0;
  }, [functionCallKeys, currentUsedKeys.length]);
  const sortedFunctionCallKeys = useMemo(() => {
    return functionCallKeys.sort((a, b) => {
      const aIsUsed = currentUsedKeys.includes(a.public_key);
      const bIsUsed = currentUsedKeys.includes(b.public_key);
      return Number(bIsUsed) - Number(aIsUsed);
    });
  }, [functionCallKeys, currentUsedKeys]);
  function getAllowance(b: string) {
    if (b) {
      return toPrecision(toReadableNumber(24, b), maxLength) + " NEAR";
    }
    return "Unlimited";
  }
  function onCheck(public_key: string) {
    if (selectedKeys.has(public_key)) {
      selectedKeys.delete(public_key);
    } else {
      if (selectedKeys.size == maxLength) return;
      selectedKeys.add(public_key);
    }
    setSelectedKeys(new Set(selectedKeys));
  }
  function onCheckAll() {
    if (selectedKeys.size == allCheckdLength) {
      setSelectedKeys(new Set([]));
    } else {
      const checkedAll = functionCallKeys
        .filter((key) => !currentUsedKeys.includes(key.public_key))
        .slice(0, maxLength)
        .reduce((acc, cur) => {
          acc.push(cur.public_key);
          return acc;
        }, []);
      setSelectedKeys(new Set(checkedAll));
    }
  }
  function batchClear() {
    set_clear_loading(true);
    batchDeleteKeys(Array.from(selectedKeys), (result) => {
      if (result[0]?.final_execution_status == "EXECUTED_OPTIMISTIC") {
        successToast();
        // setAddSuccess((pre) => pre + 1);
        onRequestClose();
      } else {
        failToast(result.message);
      }
      set_clear_loading(false);
    });
  }
  const disabled = selectedKeys.size === 0;
  const isEmpty = functionCallKeys.length == 0;
  const isDisabledAction =
    selectedWalletId && disbaledWallet.includes(selectedWalletId);
  return (
    <div className={`py-2.5`}>
      <div className="frcb px-6 mb-3 xsm:px-4">
        <div className="flex items-center gap-1">
          <span className="text-sm text-white lg:paceGrotesk-Bold xsm:text-gray-50">
            Approved Keys
            <span className="lg:hidden">:</span>
          </span>
          <span className="frcc text-xs text-white lg:px-1 py-2 rounded-md lg:bg-gray-60 lg:bg-opacity-20 lg:ml-2.5 lg:paceGrotesk-Bold ">
            {functionCallKeys.length}
          </span>
        </div>
        {allCheckdLength > 0 && !isDisabledAction ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-60">
            <Checkbox
              onClick={onCheckAll}
              checked={selectedKeys.size == allCheckdLength}
            />{" "}
            Remove-10
          </div>
        ) : null}
      </div>
      <div
        className="overflow-auto hide-scrollbar px-6 border-b border-gray1s xsm:px-4"
        style={{ maxHeight: "290px" }}
      >
        {loading ? (
          <SkeletonTheme
            baseColor="rgba(33, 43, 53, 0.3)"
            highlightColor="#2A3643"
          >
            <Skeleton width="100%" height={120} count={2} className="mt-4" />
          </SkeletonTheme>
        ) : isEmpty ? (
          <div className="flex justify-center my-20 text-xs text-gray-60">
            No Data
          </div>
        ) : (
          <>
            {sortedFunctionCallKeys.map((item) => {
              const isUsed = currentUsedKeys.includes(item.public_key);
              return (
                <div
                  key={item.public_key}
                  className="bg-gray-60 bg-opacity-10 rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      <p className="text-base paceGrotesk-Bold text-white break-all">
                        {
                          (item?.access_key?.permission as Ipermission)
                            ?.FunctionCall?.receiver_id
                        }
                      </p>
                      {isUsed ? (
                        <span className="ml-0.5 flex items-center justify-center bg-primaryGreen text-xs paceGrotesk-Bold italic whitespace-nowrap rounded w-12 text-black">
                          In use
                        </span>
                      ) : null}
                    </div>
                    {!isUsed && (
                      <Checkbox
                        appearance="b"
                        checked={selectedKeys.has(item.public_key)}
                        hidden={!!isDisabledAction}
                        onClick={() => {
                          onCheck(item.public_key);
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center  bg-dark-60 bg-opacity-70 rounded-md text-xs text-gray-60 p-2.5 my-3 break-all">
                    {/* TX  */}
                    <span className="ml-1">{item.public_key}</span>
                  </div>
                  <div className="flex items-center text-sm gap-1.5">
                    <span className="text-gray-60">Fee Allowance</span>
                    <span className="text-white">
                      {getAllowance(
                        (item?.access_key?.permission as Ipermission)
                          ?.FunctionCall?.allowance
                      )}{" "}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      {isDisabledAction ? (
        <div className="border-opacity-30 px-4 py-2.5 text-yellow-10 text-sm bg-yellow-10 bg-opacity-10 mx-6 rounded my-4">
          This wallet doesn&apos;t support Delete Key. Consider switching to
          another wallet if necessary.
        </div>
      ) : null}
      {!isDisabledAction ? (
        <div className="px-6">
          <div
            onClick={() => {
              if (!disabled && !clear_loading) {
                batchClear();
              }
            }}
            className={`frcc bg-greenGradient mt-4 rounded h-12 text-base text-black paceGrotesk-Bold focus:outline-none ${
              disabled || clear_loading
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer "
            }`}
          >
            <ButtonTextWrapper
              loading={clear_loading}
              Text={() => <div className="flex items-center gap-2">Clear</div>}
            />
          </div>
        </div>
      ) : (
        <div className="px-6">
          <div
            onClick={switchWallet}
            className={`frcc border mt-4 border-primaryGreen text-primaryGreen gotham_font rounded h-12 text-base focus:outline-none cursor-pointer`}
          >
            Switch Wallet
          </div>
        </div>
      )}
    </div>
  );
}
function Checkbox({
  checked,
  appearance,
  onClick,
  hidden,
}: {
  checked?: boolean;
  appearance?: "" | "b";
  onClick: any;
  hidden?: boolean;
}) {
  if (hidden) return null;
  if (checked) {
    return (
      <div onClick={onClick}>
        <CheckedIcon />
      </div>
    );
  }
  return (
    <span
      onClick={onClick}
      className={`inline-block w-4 h-4 rounded cursor-pointer flex-shrink-0 border border-gray-10 ${
        appearance == "b" ? "border border-gray-10" : ""
      }`}
    ></span>
  );
}

export default React.memo(AccessKeyModal);

export interface Ipermission {
  FunctionCall: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
}
