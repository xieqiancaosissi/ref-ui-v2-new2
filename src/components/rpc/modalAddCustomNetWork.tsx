import React, { useEffect, useState } from "react";
import {
  SelectedButtonIcon,
  SetButtonIcon,
  ReturnArrowButtonIcon,
  DeleteButtonIcon,
} from "./icon";
import { getCustomAddRpcSelectorList, getRPCList } from "@/utils/rpc";
import { isMobile } from "@/utils/device";
import Modal from "react-modal";
import { ModalClose } from "../farm/icon";
import { ButtonTextWrapper } from "../common/Button";
import {
  trimStr,
  specialRpcs,
  pingChain,
  ping_gas,
  switchPoint,
  displayCurrentRpc,
} from "./rpcUtil";

const ModalAddCustomNetWork = (props: any) => {
  const { rpclist, currentEndPoint, responseTimeList, onRequestClose, isOpen } =
    props;
  const [customLoading, setCustomLoading] = useState(false);
  const [customRpcName, setCustomRpcName] = useState("");
  const [customRpUrl, setCustomRpUrl] = useState("");
  const [customShow, setCustomShow] = useState(false);
  const [unavailableError, setUnavailableError] = useState(false);
  const [testnetError, setTestnetError] = useState(false);
  const [notSupportTestnetError, setNotSupportTestnetError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isInEditStatus, setIsInEditStatus] = useState(false);
  const cardWidth = isMobile() ? "100vw" : "350px";
  const cardHeight = isMobile() ? "40vh" : "336px";
  useEffect(() => {
    hideCustomNetWork();
  }, [isOpen]);
  async function addCustomNetWork() {
    setCustomLoading(true);
    const rpcMap = getRPCList();
    // check if has same url and same name
    const fondItem = Object.values(rpcMap).find((item: any) => {
      if (trimStr(item.simpleName) == trimStr(customRpcName)) {
        return true;
      }
    });
    if (fondItem) {
      setNameError(true);
      setCustomLoading(false);
      return;
    }
    // check network
    let responseTime;
    // special check
    if (checkContain(customRpUrl)) {
      const { status, responseTime: responseTime_gas } = await ping_gas(
        customRpUrl
      );
      if (!status) {
        setUnavailableError(true);
        setCustomLoading(false);
        return;
      }
      responseTime = responseTime_gas;
    } else {
      // common check
      const {
        status,
        responseTime: responseTime_status,
        chain_id,
      } = await pingChain(customRpUrl);
      responseTime = responseTime_status;
      if (!status) {
        setUnavailableError(true);
        setCustomLoading(false);
        return;
      }
      if (status && chain_id == "testnet") {
        setTestnetError(true);
        setCustomLoading(false);
        return;
      }
    }
    // do not support testnet
    const env = process.env.NEXT_PUBLIC_NEAR_ENV;
    if (env == "testnet" || env == "pub-testnet") {
      setNotSupportTestnetError(true);
      setCustomLoading(false);
      return;
    }
    const customRpcMap = getCustomAddRpcSelectorList();
    const key = "custom" + Object.keys(customRpcMap).length + 1;
    customRpcMap[key] = {
      url: customRpUrl,
      simpleName: trimStr(customRpcName),
      custom: true,
    };

    localStorage.setItem("customRpcList", JSON.stringify(customRpcMap));
    setCustomLoading(false);
    props.updateResponseTimeList({
      key,
      responseTime,
    });
    setCustomShow(false);
  }
  function checkContain(url: string) {
    const res = specialRpcs.find((rpc: string) => {
      if (url.indexOf(rpc) > -1) return true;
    });
    return !!res;
  }
  function changeNetName(v: string) {
    setNameError(false);
    setCustomRpcName(v);
  }
  function changeNetUrl(v: string) {
    setUnavailableError(false);
    setTestnetError(false);
    setCustomRpUrl(v);
  }
  function showCustomNetWork() {
    setCustomShow(true);
    initData();
  }
  function hideCustomNetWork() {
    setCustomShow(false);
    initData();
  }
  function closeModal() {
    setCustomShow(false);
    initData();
    onRequestClose();
  }
  function switchEditStatus() {
    setIsInEditStatus(!isInEditStatus);
  }
  function deleteCustomNetwork(key: string) {
    const customMap = getCustomAddRpcSelectorList();
    delete customMap[key];
    localStorage.setItem("customRpcList", JSON.stringify(customMap));
    if (key == currentEndPoint) {
      window.location.reload();
    } else {
      props.updateResponseTimeList({
        key,
        isDelete: true,
      });
      if (Object.keys(customMap).length == 0) {
        setIsInEditStatus(false);
      }
    }
  }
  function initData() {
    setCustomRpcName("");
    setCustomRpUrl("");
    setTestnetError(false);
    setNameError(false);
    setUnavailableError(false);
    setIsInEditStatus(false);
    setNotSupportTestnetError(false);
  }
  const submitStatus =
    trimStr(customRpcName) &&
    trimStr(customRpUrl) &&
    !unavailableError &&
    !nameError &&
    !testnetError;
  return (
    <Modal {...props}>
      <div className="relative frcc">
        <div
          className="absolute top-0 bottom-0"
          style={{
            filter: "blur(50px)",
            width: cardWidth,
          }}
        ></div>
        <div
          className="relative z-10 p-6 text-white bg-dark-10 lg:rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg"
          style={{
            width: cardWidth,
          }}
        >
          {customShow ? (
            <div>
              <div className="frcb text-lg text-white">
                <div className="flex items-center">
                  <ReturnArrowButtonIcon
                    className="mr-3 cursor-pointer"
                    onClick={hideCustomNetWork}
                  ></ReturnArrowButtonIcon>
                  Add Custom Network
                </div>
                <span onClick={closeModal} className="cursor-pointer">
                  <ModalClose></ModalClose>
                </span>
              </div>
              <div className="flex flex-col  mt-6">
                <span className="text-gray-10 text-sm mb-2.5">
                  Network Name
                </span>
                <div
                  className={`overflow-hidden rounded-md ${
                    nameError ? "border border-warnRedColor" : ""
                  }`}
                >
                  <input
                    className="px-3 h-10 bg-black bg-opacity-20"
                    onChange={({ target }) => changeNetName(target.value)}
                  ></input>
                </div>
                <span
                  className={`errorTip text-redwarningColor text-sm mt-2 ${
                    nameError ? "" : "hidden"
                  }`}
                >
                  The network name was already taken
                </span>
              </div>
              <div className="flex flex-col mt-6">
                <span className="text-gray-10 text-sm mb-2.5">RPC URL</span>
                <div
                  className={`overflow-hidden rounded-md ${
                    unavailableError ? "border border-warnRedColor" : ""
                  }`}
                >
                  <input
                    className="px-3 h-10 rounded-md bg-black bg-opacity-20"
                    onChange={({ target }) => changeNetUrl(target.value)}
                  ></input>
                </div>
                <span
                  className={`errorTip text-warn text-sm mt-2 ${
                    unavailableError ? "" : "hidden"
                  }`}
                >
                  The network was invalid
                </span>
                <span
                  className={`errorTip text-warn text-sm mt-2 ${
                    testnetError ? "" : "hidden"
                  }`}
                >
                  RPC server&apos;s network (testnet) is different with this
                  network (mainnet)
                </span>
                <span
                  className={`errorTip text-warn text-sm mt-2 ${
                    notSupportTestnetError ? "" : "hidden"
                  }`}
                >
                  Testnet does not support adding custom RPC
                </span>
              </div>
              <div
                color="#fff"
                className={`w-full h-10 text-center text-base rounded text-black mt-6 focus:outline-none font-semibold bg-greenGradient frcc ${
                  submitStatus
                    ? "cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                onClick={addCustomNetWork}
                // disabled={!submitStatus}
                // loading={customLoading}
              >
                <div className={`${isInEditStatus ? "hidden" : ""}`}>
                  <ButtonTextWrapper
                    loading={customLoading}
                    Text={() => {
                      return <>Add</>;
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="frcb text-lg text-white mb-5">
                RPC
                <span onClick={closeModal} className="cursor-pointer">
                  <ModalClose></ModalClose>
                </span>
              </div>
              <div
                style={{ maxHeight: cardHeight }}
                className="overflow-y-auto overflow-x-hidden"
              >
                {Object.entries(rpclist).map(
                  ([key, data]: any, index: number) => {
                    return (
                      <div className="flex items-center" key={data.simpleName}>
                        <div
                          className={`relative flex items-center rounded h-9 px-4 border border-dark-50 ${
                            isInEditStatus && data.custom ? "w-4/5" : "w-full"
                          } ${
                            index != Object.entries(rpclist).length - 1
                              ? "mb-3"
                              : ""
                          } ${isInEditStatus ? "" : "cursor-pointer"} ${
                            isInEditStatus && !data.custom
                              ? ""
                              : "bg-black bg-opacity-20 hover:bg-dark-180 hover:bg-opacity-80"
                          } justify-between text-gray-10 ${
                            currentEndPoint == key && !isInEditStatus
                              ? "bg-opacity-30"
                              : ""
                          }`}
                          onClick={() => {
                            if (!isInEditStatus) {
                              switchPoint(key);
                            }
                          }}
                        >
                          <label
                            className={`text-sm pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis w-3/5`}
                          >
                            {data.simpleName}
                          </label>
                          <div className={`flex items-center text-sm w-1/5`}>
                            {displayCurrentRpc(responseTimeList, key, true)}
                          </div>
                          <div className="w-1/5 flex justify-end">
                            {currentEndPoint == key && !isInEditStatus ? (
                              <SelectedButtonIcon className=""></SelectedButtonIcon>
                            ) : null}
                          </div>
                        </div>
                        {isInEditStatus && data.custom ? (
                          <div>
                            <DeleteButtonIcon
                              className="cursor-pointer ml-4"
                              onClick={() => {
                                deleteCustomNetwork(key);
                              }}
                            ></DeleteButtonIcon>
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </div>
              <div
                className={`flex items-center mt-8 ${
                  isInEditStatus ? "justify-end" : "justify-between"
                }`}
              >
                <div
                  color="#fff"
                  className={`pt-2 h-10 px-4 text-center text-base text-black focus:outline-none font-semibold bg-greenGradient rounded ${
                    isInEditStatus ? "hidden" : ""
                  }`}
                  onClick={showCustomNetWork}
                >
                  <div className={"flex items-center cursor-pointer"}>
                    {/* <AddButtonIcon
                      style={{ zoom: 1.35 }}
                      className="mr-1 text-white"
                    ></AddButtonIcon> */}
                    Add
                  </div>
                </div>
                {Object.keys(rpclist).length > 2 ? (
                  <div className="flex items-center">
                    {isInEditStatus ? (
                      <span
                        className="text-sm text-white cursor-pointer mr-2"
                        onClick={switchEditStatus}
                      >
                        Finish
                      </span>
                    ) : null}
                    <SetButtonIcon
                      className="cursor-pointer text-gray-10 hover:text-white"
                      onClick={switchEditStatus}
                    ></SetButtonIcon>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalAddCustomNetWork;
