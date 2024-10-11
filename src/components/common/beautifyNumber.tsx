import Big from "big.js";
import { twMerge } from "tailwind-merge";
import { isInvalid } from "@/utils/uiNumber";
const efficientDigit = 5;
export function beautifyNumber({
  num,
  className,
  subClassName,
  isUsd,
}: {
  num: string | number;
  className?: string;
  subClassName?: string;
  isUsd?: boolean;
}) {
  if (isInvalid(num))
    return <Wrap className={className}>{isUsd ? "$-" : num}</Wrap>;
  const is_integer = !Big(num).toFixed().includes(".");
  if (is_integer)
    return <Wrap className={className}>{(isUsd ? "$" : "") + num}</Wrap>;
  const arr = num.toString().split(".");
  const interPart = arr[0];
  const floatPart = arr[1];
  if (+interPart == 0 && num.toString().length <= efficientDigit + 2)
    return <Wrap className={className}>{(isUsd ? "$" : "") + num}</Wrap>;
  if (+interPart !== 0 && num.toString().length <= efficientDigit + 1)
    return <Wrap className={className}>{(isUsd ? "$" : "") + num}</Wrap>;

  if (+interPart == 0) {
    const nonZeroIndex = floatPart.split("").findIndex((n) => +n !== 0);
    const pendingNum = Big(num).toFixed(nonZeroIndex + 5);
    if (nonZeroIndex <= 1)
      return (
        <Wrap className={className}>
          {(isUsd ? "$" : "") + "0." + removeFootZero(pendingNum.split(".")[1])}
        </Wrap>
      );
    const nonZeroPart = removeHeadAndFootZero(pendingNum.split(".")[1]);
    return (
      <Wrap className={className}>
        {isUsd ? "$" : ""}0.0
        <span className={twMerge("text-[8px] px-px", subClassName || "")}>
          {nonZeroIndex}
        </span>
        {nonZeroPart}
      </Wrap>
    );
  } else {
    const floatPartLength = Math.max(efficientDigit - interPart.length, 2);
    const pendingNum = Big(num).toFixed(floatPartLength);
    const [onePart, twoPart] = pendingNum.split(".");
    const twoPartRemoveZreo = removeFootZero(twoPart);
    if (twoPartRemoveZreo) {
      return (
        <Wrap className={className}>
          {isUsd ? "$" : ""}
          {onePart}.{twoPartRemoveZreo}
        </Wrap>
      );
    }
    return <Wrap className={className}>{(isUsd ? "$" : "") + onePart}</Wrap>;
  }
}

function removeHeadAndFootZero(str: string) {
  return str.replace(/^0+/, "").replace(/0+$/, "");
}
function removeFootZero(str: string) {
  return str.replace(/0+$/, "");
}
function Wrap({ children, className }: any) {
  return (
    <span className={twMerge("text-sm text-white", className || "")}>
      {children}
    </span>
  );
}
