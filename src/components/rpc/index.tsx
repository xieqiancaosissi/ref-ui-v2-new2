import React, { useEffect, useState } from "react";
import { FiChevronDown } from "../reactIcons";
import { MoreButtonIcon } from "./icon";
import { isMobile } from "@/utils/device";
import { switchPoint, displayCurrentRpc, ping, MAXELOADTIMES } from "./rpcUtil";
import ModalAddCustomNetWork from "./modalAddCustomNetWork";
import {
  updateAdaptiveRpcInStorage,
  getRPCList,
  getRpcKeyByUrl,
  getBusinessAdaptiveRpcInStorage,
} from "@/utils/rpc";
const RpcList = () => {
  const is_mobile = isMobile();
  const rpclist = getRPCList();
  const [hover, setHover] = useState(false);
  const [hoverSet, setHoverSet] = useState(false);
  const [responseTimeList, setResponseTimeList] = useState<{
    [key: string]: number;
  }>({});
  const [modalCustomVisible, setModalCustomVisible] = useState(false);
  const [currentEndPoint, setCurrentEndPoint] = useState("defaultRpc");
  useEffect(() => {
    let endPoint = localStorage.getItem("endPoint") || "defaultRpc";
    if (!(endPoint in rpclist)) {
      endPoint = "defaultRpc";
      localStorage.removeItem("endPoint");
    }
    setCurrentEndPoint(endPoint);
  }, [rpclist]);
  useEffect(() => {
    fetchPingTimes();
    // Manual storage modification is not allowed
    const handleStorageChange = (e: any) => {
      if (e.key === "customRpcList" || e.key == "adaptiveRPC") {
        localStorage.setItem(e.key, e.oldValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  useEffect(() => {
    // random avalible rpc into store
    if (
      Object.keys(responseTimeList).length ==
      Object.keys(rpclist || {}).length - 1
    ) {
      const list = getRPCList(true);
      const nodeKey = getRandomAvailableNode(responseTimeList);
      updateAdaptiveRpcInStorage(list[nodeKey]?.url);
      const current_used_url = window.adaptiveRPC || list[nodeKey]?.url;
      const current_used_key = getRpcKeyByUrl(current_used_url);
      const res = Object.assign(responseTimeList, {
        adaptiveRPC: responseTimeList[current_used_key || nodeKey],
      });

      setResponseTimeList(JSON.parse(JSON.stringify(res)));
    }
  }, [JSON.stringify(responseTimeList || {})]);
  function updateResponseTimeList(data: any) {
    const { key, responseTime, isDelete } = data;
    if (isDelete) {
      // delete
      delete responseTimeList[key];
      setResponseTimeList(Object.assign({}, responseTimeList));
    } else {
      // add
      responseTimeList[key] = responseTime;
      setResponseTimeList(Object.assign({}, responseTimeList));
    }
  }
  function addCustomNetwork() {
    setModalCustomVisible(true);
  }
  async function fetchPingTimes() {
    const list = getRPCList(true);
    Object.entries(list).forEach(([key, data]: any) => {
      ping(data.url, key).then((time) => {
        responseTimeList[key] = time;
        setResponseTimeList(Object.assign({}, responseTimeList));
        doSelfAdaptation(time, {
          key,
          url: data.url,
        });
      });
    });
  }
  function doSelfAdaptation(time, o) {
    const endPoint = localStorage.getItem("endPoint") || "defaultRpc";
    if (
      time == -1 &&
      endPoint == "adaptiveRPC" &&
      o.url == getBusinessAdaptiveRpcInStorage()
    ) {
      let reloadedTimes = Number(
        localStorage.getItem("rpc_reload_number") || 0
      );
      const list = getRPCList(true);
      const copy = JSON.parse(JSON.stringify(list));
      delete copy[o.key];
      const keys = Object.keys(copy);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      updateAdaptiveRpcInStorage(copy[randomKey]?.url);
      setTimeout(() => {
        reloadedTimes = reloadedTimes + 1;
        if (reloadedTimes > MAXELOADTIMES) {
          localStorage.setItem("rpc_reload_number", "");
        } else {
          localStorage.setItem("rpc_reload_number", reloadedTimes.toString());
          location.reload();
        }
      }, 1000);
    }
  }

  function getRandomAvailableNode(newResponseTimeList) {
    const keys = Object.keys(newResponseTimeList);
    const availableNodes = Object.entries(newResponseTimeList).filter(
      ([, time]) => time !== -1
    );
    if (availableNodes.length > 0) {
      const index = Math.floor(Math.random() * availableNodes.length);
      return availableNodes[index][0];
    } else {
      return keys[0];
    }
  }
  function getSimpleName() {
    return rpclist[currentEndPoint]?.simpleName;
  }
  const minWidth = "180px";
  const maxWith = "230px";
  const mobile = isMobile();
  return (
    <>
      {mobile ? (
        <div
          style={{
            zIndex: 999999,
            boxShadow: "0px 0px 10px 10px rgba(0, 0, 0, 0.15)",
          }}
          className="fixed bottom-0 left-0 w-full h-8 bg-dark-10 mt-3"
        >
          <div
            className="flex items-center w-full h-full justify-between"
            onClick={addCustomNetwork}
          >
            <div
              className={`flex items-center justify-between w-full flex-grow px-16`}
            >
              <div className="flex items-center w-3/4">
                <label className="text-xs text-gray-60 mr-5">RPC</label>
                <label className="text-xs text-gray-60 cursor-pointer pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {getSimpleName()}
                </label>
              </div>
              <div className="flex items-center">
                {displayCurrentRpc(responseTimeList, currentEndPoint)}
                <FiChevronDown
                  className={`text-gray-60 transform rotate-180 cursor-pointer`}
                ></FiChevronDown>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ zIndex: 88 }}
          className="flex items-end fixed right-6 bottom-9 text-white"
        >
          <div
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
            className="relative"
          >
            {/* current selected endpoint */}
            <div className="pt-3">
              <div
                className="frcb px-2  bg-dark-10 bg-opacity-80 rounded cursor-pointer"
                style={{
                  minWidth,
                  maxWidth: maxWith,
                  height: "22px",
                }}
              >
                <div className="flex items-center w-2/3">
                  <label className="text-xs w-full text-gray-10 cursor-pointer pr-2 whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {getSimpleName()}
                  </label>
                </div>
                <div className="flex items-center">
                  {displayCurrentRpc(responseTimeList, currentEndPoint)}
                  <FiChevronDown
                    className={`text-gray-10 transform rotate-180 cursor-pointer ${
                      hover ? "text-greenColor" : ""
                    }`}
                  ></FiChevronDown>
                </div>
              </div>
            </div>
            {/* hover list */}
            <div
              className={`absolute py-2 bottom-7 flex flex-col w-full bg-dark-10 bg-opacity-80 rounded ${
                hover ? "" : "hidden"
              }`}
            >
              {Object.entries(rpclist).map(([key, data]: any) => {
                return (
                  <div
                    key={key}
                    className={`frcb px-2 py-1 text-gray-10 hover:bg-navHighLightBg  hover:text-white ${
                      currentEndPoint == key ? "bg-navHighLightBg" : ""
                    }`}
                    style={{ minWidth, maxWidth: maxWith }}
                    onClick={() => {
                      switchPoint(key);
                    }}
                  >
                    <label
                      className={`text-xs pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis ${
                        responseTimeList[key] && responseTimeList[key] != -1
                          ? "cursor-pointer"
                          : "cursor-pointer"
                      }`}
                    >
                      {data.simpleName}
                    </label>
                    <div className={`flex items-center`}>
                      {displayCurrentRpc(responseTimeList, key)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* dot dot dot more */}
          <div
            onMouseEnter={() => {
              setHoverSet(true);
            }}
            onMouseLeave={() => {
              setHoverSet(false);
            }}
            onClick={addCustomNetwork}
            style={{ height: "22px" }}
            className="flex items-center bg-dark-10 bg-opacity-80 rounded  cursor-pointer ml-2 px-2 "
          >
            <MoreButtonIcon
              className={`text-gray-10 ${hoverSet ? "text-greenColor" : ""}`}
            ></MoreButtonIcon>
          </div>
        </div>
      )}
      {/* add custom rpc modal */}
      <ModalAddCustomNetWork
        isOpen={modalCustomVisible}
        onRequestClose={() => {
          setModalCustomVisible(false);
        }}
        updateResponseTimeList={updateResponseTimeList}
        currentEndPoint={currentEndPoint}
        responseTimeList={responseTimeList}
        rpclist={rpclist}
        style={{
          overlay: {
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: "101",
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
      ></ModalAddCustomNetWork>
    </>
  );
};
export default React.memo(RpcList);
