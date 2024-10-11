import React from "react";
import { useIntl } from "react-intl";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { TipIcon } from "../icons2";
function ExclamationTip({
  id,
  color,
  width,
  defaultMessage,
  dataPlace,
  uniquenessId,
  colorhex,
  className,
}: {
  id: string;
  color?: "bright" | "dark";
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
  uniquenessId?: string;
  colorhex?: string;
  className?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    const result: string = `<div class="text-white  border-black border-opacity-20 xsm:w-36 whitespace-normal text-xs text-left ${
      width ? width : ""
    }"
      style="max-width: 200px; ">${tip}</div>`;
    return result;
  };

  const [light, setLight] = React.useState(false);

  return (
    <div
      className={`${className} pl-1 text-white text-base`}
      data-tooltip-id={uniquenessId || "exclaimaton_tip" + "id"}
      data-class="reactTip"
      data-tooltip-html={getValue()}
      data-multiline={true}
    >
      <div
        style={{
          color: light ? "white" : colorhex,
        }}
        onMouseOver={() => {
          setLight(true);
        }}
        onMouseLeave={() => {
          setLight(false);
        }}
      >
        <TipIcon />
      </div>
      <CustomTooltip
        id={uniquenessId || "exclaimaton_tip" + "id"}
        // @ts-ignore
        place={dataPlace || "bottom"}
      />
    </div>
  );
}
export default React.memo(ExclamationTip);
