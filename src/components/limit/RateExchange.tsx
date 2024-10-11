import React, { useState, useRef } from "react";
import { LimitArrowTop, LimitArrowBottom } from "./icons";
function SwapRateExchange({ onChange }: { onChange: (e?: any) => void }) {
  const [hover, setHover] = useState<boolean>(false);
  const upRow = useRef(null) as any;
  const downRow = useRef(null) as any;

  const mobileDevice = false;

  const runSwapAnimation = function () {
    upRow.current.style.animation = "arrowRight 0.5s 0s ease-out 1";
    downRow.current.style.animation = "arrowLeft 0.5s 0s ease-out 1";

    upRow.current.addEventListener("animationend", function () {
      upRow.current.style.animation = "";
    });
    downRow.current.addEventListener("animationend", function () {
      downRow.current.style.animation = "";
    });
  };

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center w-5 h-5 border border-gray-10 border-opacity-20 rounded cursor-pointer"
      onClick={() => {
        onChange();
        mobileDevice && runSwapAnimation();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`transition-transform transform ${
            hover ? "lg:-translate-x-0.5" : ""
          }`}
          ref={upRow}
        >
          <LimitArrowTop width="5" light={mobileDevice ? false : hover} />
        </span>
        <span
          className={`transition-transform transform ${
            hover ? "lg:translate-x-0.5 " : ""
          }`}
          ref={downRow}
        >
          <LimitArrowBottom width="5" light={mobileDevice ? false : hover} />
        </span>
      </div>
    </div>
  );
}

export default React.memo(SwapRateExchange);
