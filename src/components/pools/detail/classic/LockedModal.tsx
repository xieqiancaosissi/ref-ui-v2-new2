import React, { useState, useContext, useMemo, useEffect } from "react";
import Big from "big.js";
import { toNonDivisibleNumber, toReadableNumber } from "@/utils/numbers";
import { formatWithCommas_number } from "@/utils/uiNumber";
import { lock_lp } from "@/services/lplock";
import RangeSlider from "./RangeSlider";
import Modal from "react-modal";
import { LockLpTitleIcon, LpModalCloseIcon } from "@/components/pools/icon";
import { LockWithoutCircleBlack } from "@/components/pools/icon";
import LockedConfirmModal from "./LockedConfirmModal";
import tokenIcons from "@/utils/tokenIconConfig";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import styles from "./style.module.css";
import successToast from "@/components/common/toast/successToast";
import failToast from "@/components/common/toast/failToast";
import { TokenImgWithRiskTag } from "@/components/common/imgContainer";

function LockedModal(props: any) {
  const {
    isOpen,
    onRequestClose,
    is_mft_registered,
    userShares,
    lockedData,
    pool,
    tokens,
    setAddSuccess,
  } = props;
  const { pureIdList } = useRiskTokens();
  const [sliderAmount, setSliderAmount] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [months, setMonths] = useState<string | number>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const balance = toReadableNumber(24, userShares);
  const [new_unlock_time_sec, isInValidMonths] = useMemo(() => {
    const new_unlock_time_sec = Big(new Date().getTime() / 1000).plus(
      +(months || 0) * 30 * 24 * 3600
    );
    const old_unlock_time_sec = lockedData?.unlock_time_sec || 0;
    return [
      new_unlock_time_sec,
      Big(months || 0).gt(0) && new_unlock_time_sec.lte(old_unlock_time_sec),
    ];
  }, [lockedData, months]);
  function lock() {
    lock_lp({
      token_id: `:${pool.id}`,
      amount: Big(toNonDivisibleNumber(24, amount)).toFixed(0),
      unlock_time_sec: +new_unlock_time_sec.toFixed(0),
      is_mft_registered,
      // unlock_time_sec: 1715094000,
    })
      .then((res: any) => {
        if (!res) return;
        if (res.status == "success") {
          successToast();
          setAddSuccess((pre: number) => pre + 1);
        } else if (res.status == "error") {
          failToast(res.errorResult?.message);
        }
      })
      .finally(() => {
        onRequestClose();
        closeConfirmModal();
      });
  }
  function changeMonths(v: any) {
    if (v.indexOf(".") > -1) {
      setMonths(v.substring(0, v.indexOf(".")));
    } else if (+v > 1200) return;
    else {
      setMonths(v);
    }
  }
  function changeAmount(m: any) {
    setAmount(m);
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(months || 0).lte(0) ||
    isInValidMonths ||
    Big(amount || 0).gt(balance);
  function openConfirmModal() {
    setIsConfirmOpen(true);
  }
  function closeConfirmModal() {
    setIsConfirmOpen(false);
  }

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

  const cardWidth = isMobile ? "95vw" : "28vw";
  const cardHeight = isMobile ? "90vh" : "80vh";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: isMobile
          ? {
              transform: "translateX(-50%)",
              top: "auto",
              bottom: "32px",
              width: "100vw",
            }
          : {
              outline: "none",
              transform: "translate(-50%, -50%)",
            },
      }}
    >
      <div className="lg:w-108 xsm:w-full lg:min-h-110 rounded-lg bg-dark-10 px-4 py-5">
        {/* title */}
        <div className="flex items-center justify-between">
          <LockLpTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer"
            onClick={onRequestClose}
          />
        </div>

        <div className="flex items-center justify-between text-sm mt-7 text-gray-60">
          <span>Balance</span>
          <span>{formatWithCommas_number(balance)}</span>
        </div>
        {/*  */}
        <div
          className="flex items-center justify-between px-3 rounded-lg mt-4 "
          style={{ height: "65px", background: "rgba(0,0,0,.2)" }}
        >
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={({ target }) => changeAmount(target.value)}
            className="text-white text-xl focus:outline-none appearance-none leading-tight px-2.5 w-full"
          ></input>
          <div
            className={`flex items-center flex-shrink-0 bg-gray-60 bg-opacity-10 rounded-full p-1 ${styles.tokenImgContainer}`}
          >
            {tokens?.map((ite: any, ind: number) => (
              //   <TokenIconComponent
              //   key={ite.tokenId + ind}
              //   ite={ite}
              //   tokenIcons={tokenIcons}
              //   pureIdList={pureIdList}
              //   ind={ind}
              // />
              <TokenImgWithRiskTag
                token={ite}
                withoutRisk={true}
                key={ite.tokenId + ind}
              />
            ))}
          </div>
        </div>
        {/*  */}
        <div className="px-3">
          <RangeSlider
            setAmount={setAmount}
            balance={balance}
            sliderAmount={sliderAmount}
            setSliderAmount={setSliderAmount}
          />
        </div>
        {/* Lock Period */}
        <div className="mt-20">
          <div className="text-sm mt-7 text-gray-60">Lock Period</div>
          <div
            className="flex items-center justify-between px-3 rounded-lg mt-4 "
            style={{ height: "65px", background: "rgba(0,0,0,.2)" }}
          >
            <input
              type="number"
              placeholder="0"
              value={months}
              onChange={({ target }) => changeMonths(target.value)}
              className="text-white text-xl focus:outline-none appearance-none leading-tight px-2.5 w-full"
            ></input>
            <span className="text-base text-gray-60">Months</span>
          </div>
        </div>

        <div
          className={`flex items-start gap-2 mt-4 ${
            isInValidMonths ? "" : "hidden"
          }`}
        >
          <p className="text-xs text-gray-60">
            The new unlock time must be longer than the old unlock time
          </p>
        </div>

        <div
          onClick={disabled ? () => console.log("") : openConfirmModal}
          color="#fff"
          className={`flex-shrink-0 mt-6 h-12 text-center text-sm text-white focus:outline-none font-semibold ${
            disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="poolBtnStyle">
            <LockWithoutCircleBlack />
            <span className="ml-2">Lock</span>
          </div>
        </div>
        {isConfirmOpen && (
          <LockedConfirmModal
            isOpen={isConfirmOpen}
            onRequestClose={closeConfirmModal}
            months={months}
            onLock={lock}
          />
        )}
      </div>
    </Modal>
  );
}

export default React.memo(LockedModal);
