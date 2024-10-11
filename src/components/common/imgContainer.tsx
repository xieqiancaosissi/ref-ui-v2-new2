import { TokenMetadata } from "@/services/ft-contract";
import {
  getRiskTagByToken,
  getRiskTagByTokenWhithOutRisk,
} from "@/utils/commonUtil";
import { RiskIcon } from "./SelectTokenModal/Icons";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { isMobile } from "@/utils/device";
import { Tooltip } from "@nextui-org/react";
export function TokenImgWithRiskTag({
  token,
  size,
  withoutRisk,
}: {
  token: TokenMetadata;
  size?: string;
  withoutRisk?: boolean;
}) {
  const riskTag = withoutRisk
    ? getRiskTagByTokenWhithOutRisk(token)
    : getRiskTagByToken(token);
  return (
    <div
      className="flex items-center justify-center relative overflow-hidden rounded-full border border-gray-110"
      style={{
        width: `${size || 28}px`,
        height: `${size || 28}px`,
      }}
    >
      <img
        className="flex-shrink-0"
        src={token.icon || "/images/placeholder.svg"}
        alt=""
      />
      {riskTag ? (
        <span
          className="flex items-center justify-center italic text-white bg-black bg-opacity-70 absolute bottom-0"
          style={{ width: `${size || 28}px`, height: "10px" }}
        >
          <label
            className="text-sm block transform scale-50 relative font-extrabold"
            style={{ left: "-1px" }}
          >
            {riskTag}
          </label>
        </span>
      ) : null}
    </div>
  );
}
export function RiskTipIcon() {
  const mobile = isMobile();
  if (mobile) return <RiskIcon />;
  return (
    <Tooltip
      classNames={{
        content: [
          "border border-gray-110 border-opacity-20 rounded bg-gray-100 text-gray-110 text-xs text-left px-2 py-1",
        ],
      }}
      content={<span>Uncertified token, higher risk.</span>}
      closeDelay={0}
    >
      <div>
        <RiskIcon />
      </div>
    </Tooltip>
  );
}
