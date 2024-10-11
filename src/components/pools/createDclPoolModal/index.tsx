import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { CreateDclPoolTitle, CreatePoolClose } from "@/components/pools/icon";
import Fee from "./createPoolFee/index";
import TokenInput from "./createPoolInput/index";
import { addSimpleLiquidityPool, findSamePools } from "@/services/pool";
import InitData from "@/components/swap/InitData";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/router";
import { error } from "console";
import failToast from "@/components/common/toast/failToast";
import successToast from "@/components/common/toast/successToast";
import { checkTransactionStatus } from "@/utils/contract";
import { getURLInfo } from "@/utils/transactionsPopup";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import { REF_FI_CONTRACT_ID } from "@/utils/contract";
import { useAddLiquidityUrlHandle } from "@/services/commonV3";
import SetPriceRange from "./setPriceRange";
import { PoolInfo, list_pools } from "@/services/swapV3";
import { ftGetTokenMetadata } from "@/services/token";
import { getBoostTokenPrices } from "@/services/farm";
import { POINTDELTAMAP } from "./currentPrice";
import { getPointByPrice } from "@/services/commonV3";
import { create_pool } from "@/services/swapV3";
import BigNumber from "bignumber.js";
import { openUrlLocal } from "@/services/commonV3";

export default function CreatePoolModal({
  isOpen,
  onRequestClose,
  pureIdList,
  tokens,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  pureIdList?: any;
  tokens?: Array<any>;
}) {
  const router = useRouter();
  const [createFee, setCreateFee] = useState(0);
  const [token, setToken] = useState<any>([{}, {}]);
  const [isDisabled, setDisabled] = useState(false);
  const [isSame, setSame] = useState(false);
  const [showSke, setShowSke] = useState(false);
  const [sameId, setSameId] = useState("");
  const accountStore = useAccountStore();
  const [currentPrice, setCurrenPrice] = useState(0);
  const [validTips, setValidTips] = useState({
    active: false,
    tip: "",
  });
  const [hasSame, setHasSame] = useState(false);
  useAddLiquidityUrlHandle();
  const handleFee = (e: any) => {
    setCreateFee(e * 100);
    if (!e) {
      setValidTips({
        active: true,
        tip: "Please input valid number",
      });
    } else {
      if (e * 100 < 1) {
        setValidTips({
          active: true,
          tip: "Please input number that more than or equal to 0.01",
        });
      } else {
        setValidTips({
          active: false,
          tip: "",
        });
      }
    }
  };

  const handlePrice = (e: any) => {
    setCurrenPrice(e);
    if (!e) {
      setValidTips({
        active: true,
        tip: "Please input valid number",
      });
    } else {
      if (e < 0) {
        setValidTips({
          active: true,
          tip: "Please input number that more than or equal to 0.01",
        });
      } else {
        setValidTips({
          active: false,
          tip: "",
        });
      }
    }
  };

  const handleToken = (e: { index: number; token: any }) => {
    const newToken = [...token];
    newToken[e.index] = e.token;
    setToken(newToken);
    console.log(token);
  };

  const createPool = () => {
    setShowSke(true);
    const fee = createFee * 100;
    const pointDelta = POINTDELTAMAP[fee];
    let decimalRate =
      Math.pow(10, token[1].decimals) / Math.pow(10, token[0].decimals);
    let init_point = getPointByPrice(
      pointDelta,
      currentPrice.toString(),
      decimalRate,
      true
    );
    const arr = [token[0].id, token[1].id];
    arr.sort();
    if (arr[0] !== token[0].id) {
      decimalRate =
        Math.pow(10, token[0].decimals) / Math.pow(10, token[1].decimals);
      init_point = getPointByPrice(
        pointDelta,
        new BigNumber(1).dividedBy(currentPrice).toFixed(),
        decimalRate,
        true
      );

      create_pool({
        token_a: token[1].id,
        token_b: token[0].id,
        fee,
        init_point,
      })
        .then(async (res: any) => {
          if (!res) return;
          let status: any;
          if (res.status == "success") {
            const checkResult = await checkTransactionStatus(res.txHash);
            status = checkResult.status;
            if (
              checkResult.transaction?.actions?.[0]?.FunctionCall
                ?.method_name === "execute"
            ) {
              const receipt = checkResult?.receipts_outcome?.find(
                (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
              );

              if (receipt) {
                status = receipt?.outcome?.status;
              }
            }

            const data: string | undefined = status.SuccessValue;

            if (data) {
              const buff = Buffer.from(data, "base64");
              const pool_id = buff.toString("ascii");

              openUrlLocal(`/poolV2/${token[1].id}<>${token[0].id}@${fee}`);
            } else {
              router.replace(`/pools`);
            }
          } else if (res.status == "error") {
            failToast(res.errorResult?.message);
          }
        })
        .catch((error: any) => {
          console.log(error, "addSimpleLiquidityPool error");
        })
        .finally(() => {
          setShowSke(false);
        });
    } else {
      create_pool({
        token_a: token[0].id,
        token_b: token[1].id,
        fee,
        init_point,
      })
        .then(async (res: any) => {
          if (!res) return;
          let status: any;
          if (res.status == "success") {
            const checkResult = await checkTransactionStatus(res.txHash);
            status = checkResult.status;
            if (
              checkResult.transaction?.actions?.[0]?.FunctionCall
                ?.method_name === "execute"
            ) {
              const receipt = checkResult?.receipts_outcome?.find(
                (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
              );

              if (receipt) {
                status = receipt?.outcome?.status;
              }
            }

            const data: string | undefined = status.SuccessValue;

            if (data) {
              const buff = Buffer.from(data, "base64");
              const pool_id = buff.toString("ascii");

              openUrlLocal(`/poolV2/${token[0].id}<>${token[1].id}@${fee}`);
            } else {
              router.replace(`/pools`);
            }
          } else if (res.status == "error") {
            failToast(res.errorResult?.message);
          }
        })
        .catch((error: any) => {
          console.log(error, "addSimpleLiquidityPool error");
        })
        .finally(() => {
          setShowSke(false);
        });
    }

    // addSimpleLiquidityPool(token as any, Math.floor(createFee))
    //   .then(async (res: any) => {
    //     if (!res) return;
    //     let status: any;
    //     if (res.status == "success") {
    //       const checkResult = await checkTransactionStatus(res.txHash);
    //       status = checkResult.status;
    //       if (
    //         checkResult.transaction?.actions?.[0]?.FunctionCall?.method_name ===
    //         "execute"
    //       ) {
    //         const receipt = checkResult?.receipts_outcome?.find(
    //           (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
    //         );

    //         if (receipt) {
    //           status = receipt?.outcome?.status;
    //         }
    //       }

    //       const data: string | undefined = status.SuccessValue;

    //       if (data) {
    //         const buff = Buffer.from(data, "base64");
    //         const pool_id = buff.toString("ascii");

    //         router.push(`/pool/${pool_id}`);
    //       } else {
    //         router.replace(`/pools`);
    //       }
    //     } else if (res.status == "error") {
    //       failToast(res.errorResult?.message);
    //     }
    //   })
    //   .catch((error: any) => {
    //     console.log(error, "addSimpleLiquidityPool error");
    //   })
    //   .finally(() => {
    //     setShowSke(false);
    //   });
  };

  useEffect(() => {
    if (tokens && tokens[0] && tokens[1]) {
      setToken(tokens);
    }
  }, [JSON.stringify(tokens || {})]);

  useEffect(() => {
    if (hasSame) {
      setSame(true);
      setDisabled(true);
    } else {
      if (
        !token[0]?.id ||
        !token[1]?.id ||
        createFee < 0 ||
        !createFee ||
        validTips.active ||
        currentPrice <= 0 ||
        token[0]?.id == token[1]?.id
      ) {
        setDisabled(true);
        setSame(false);
      } else {
        setSame(false);
        setDisabled(false);
      }
    }
  }, [token[0], token[1], createFee, validTips, hasSame, currentPrice]);

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

  const toThisPool = () => {
    router.push(`/pool/${sameId}`);
  };

  const [listPool, setListPool] = useState<any>([]);
  useEffect(() => {
    get_list_pools();
  }, []);

  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();

    await Promise.all(
      list.map(async (p: PoolInfo) => {
        const token_x_metadata = await ftGetTokenMetadata(p.token_x);
        const token_y_metadata = await ftGetTokenMetadata(p.token_y);
        p.token_x_metadata = token_x_metadata;
        p.token_y_metadata = token_y_metadata;
        return p;
      })
    );

    if (list.length > 0) {
      setListPool(list);
    }
  }

  const [tokenPriceList, setTokenPriceList] = useState<any>({});

  useEffect(() => {
    getTokenPriceList();
  }, []);
  async function getTokenPriceList() {
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
        setToken([{}, {}]);
        setShowSke(false);
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
        content: {
          outline: "none",
          top: isMobile ? "auto" : "50%",
          left: isMobile ? "auto" : "50%",
          transform: isMobile ? "none" : "translate(-50%, -50%)",
          bottom: isMobile ? "32px" : "auto",
          width: isMobile ? "100%" : "auto",
        },
      }}
    >
      <div className="lg:w-108 xsm:w-full">
        {/* for select token modal */}
        <InitData />
        {/* create pool title */}
        <div className="h-13 px-4 flex items-center justify-between xsm:hidden">
          <CreateDclPoolTitle />
          <CreatePoolClose
            className="hover:scale-110 hover:cursor-pointer"
            onClick={() => {
              onRequestClose();
              setShowSke(false);
              setToken([{}, {}]);
            }}
          />
        </div>
        <div className="lg:min-h-[480px] xsm:max-h-[70vh] xsm:overflow-auto xsm:w-full lg:rounded-lg xsm:rounded-xl bg-dark-10 p-4 flex flex-col justify-between">
          <div className="text-white text-lg lg:hidden mb-7">
            Create DCL pool
          </div>
          <div>
            {/* select token */}
            {tokens && tokens[0] && tokens[1] ? (
              <div className="flex lg:justify-between xsm:flex-col">
                <TokenInput
                  title="Token"
                  index={0}
                  handleToken={handleToken}
                  pureIdList={pureIdList}
                  isMobile={isMobile}
                  selectTokens={tokens[0]}
                />
                <TokenInput
                  title="Pair"
                  index={1}
                  handleToken={handleToken}
                  pureIdList={pureIdList}
                  isMobile={isMobile}
                  selectTokens={tokens[1]}
                />
              </div>
            ) : (
              <div className="flex lg:justify-between xsm:flex-col">
                <TokenInput
                  title="Token"
                  index={0}
                  handleToken={handleToken}
                  pureIdList={pureIdList}
                  isMobile={isMobile}
                />
                <TokenInput
                  title="Pair"
                  index={1}
                  handleToken={handleToken}
                  pureIdList={pureIdList}
                  isMobile={isMobile}
                />
              </div>
            )}

            {/* fee */}
            <Fee
              setHasSame={setHasSame}
              getherFee={handleFee}
              listPool={listPool}
              token={token}
              tokenPriceList={tokenPriceList}
            />

            {/* SetPriceRange */}
            <SetPriceRange
              getherPrice={handlePrice}
              token={token}
              tokenPriceList={tokenPriceList}
            />

            {/* CurrentPrice */}

            {validTips.active && (
              <div
                className="text-yellow-10 text-xs border h-11 lg:w-100 xsm:w-full rounded flex px-1 py-1 items-center my-[6px]"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>{validTips.tip}</span>
              </div>
            )}
            {/* for tips */}
            {isSame && (
              <div
                className="text-yellow-10 text-xs border h-11 lg:w-100 xsm:w-full rounded flex px-1 py-1 items-center my-[6px]"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>
                  This Pool already exists, you can switch to other fees
                </span>
              </div>
            )}
          </div>

          {/* create pool and skeleton */}
          {showSke ? (
            <SkeletonTheme
              baseColor="rgba(33, 43, 53, 0.3)"
              highlightColor="#9EFF00"
            >
              <Skeleton width={400} height={40} count={1} className="mt-4" />
            </SkeletonTheme>
          ) : (
            <div
              onClick={() => {
                !isDisabled && createPool();
              }}
              className={`w-full shrink-0 text-base font-bold frcc h-10 rounded-lg xsm:my-4
                ${
                  isDisabled
                    ? "text-gray-50 bg-gray-40 cursor-not-allowed"
                    : "bg-createPoolLinear text-black hover:opacity-85 cursor-pointer"
                }
              `}
            >
              Create
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
