import { TokenMetadata } from "@/services/ft-contract";
import { toRealSymbol } from "@/services/farm";
import { TknIcon, SelectArrowIcon } from "@/components/pools/icon";

export const Images = ({
  tokens,
  size,
  className,
  noverlap,
  borderStyle,
  isRewardDisplay,
  border,
  uId,
  allowSameToken,
  layout,
  layoutSize,
}: {
  tokens: TokenMetadata[];
  size?: string;
  className?: string;
  noverlap?: boolean;
  borderStyle?: string;
  isRewardDisplay?: boolean;
  border?: boolean;
  uId?: string;
  allowSameToken?: boolean;
  layout?: "vertical" | "horizontal";
  layoutSize?: string;
}) => {
  const displayTokens = allowSameToken
    ? tokens
    : [...new Set<string>(tokens?.map((t) => t?.id))].map((id) =>
        tokens.find((t) => t?.id === id)
      );
  const is_vertical = layout == "vertical" && displayTokens?.length == 4;
  return (
    <div
      className={`${className} flex items-center flex-shrink-0 ${
        is_vertical ? `w-${+(layoutSize || "")} flex-wrap` : ""
      }`}
    >
      {tokens &&
        displayTokens
          ?.slice(0, isRewardDisplay ? 5 : displayTokens.length)
          ?.map((token, index) => {
            const icon = token?.icon;
            const id = token?.id;
            if (icon)
              return (
                <img
                  key={
                    (id || 0) +
                    "-" +
                    index +
                    "-" +
                    token?.id +
                    "-" +
                    uId +
                    Date.now()
                  }
                  className={`inline-block flex-shrink-0 ${
                    is_vertical && index > 1 ? "-mt-3" : "relative z-10"
                  }  h-${size || 10} w-${size || 10} rounded-full border ${
                    border ? "border" : ""
                  } border-dark-90 ${
                    tokens?.length > 1 ? (noverlap ? "ml-0" : "-ml-1") : ""
                  } bg-cardBg`}
                  src={icon}
                  style={{
                    border: borderStyle || "none",
                  }}
                />
              );
            return (
              <div
                key={id || 0 + index}
                className={`inline-block h-${size || 10} flex-shrink-0 w-${
                  size || 10
                } rounded-full bg-cardBg border border-dark-90 -ml-1 `}
                style={{
                  border: borderStyle || "none",
                }}
              ></div>
            );
          })}

      {displayTokens.length > 5 && (
        <div
          key={5 + "-more-extra-tokens"}
          className={`inline-block h-${
            size || 10
          } flex-shrink-0 flex items-center justify-center text-gradientFrom w-${
            size || 10
          } rounded-full bg-darkBg border border-dark-90 -ml-1 `}
        >
          <span className={`relative bottom-1`}>...</span>
        </div>
      )}
    </div>
  );
};

export const Symbols = ({
  withArrow,
  tokens,
  size,
  separator,
  fontSize,
  className,
}: {
  withArrow?: boolean;
  tokens: TokenMetadata[];
  size?: string;
  separator?: string;
  fontSize?: string;
  className?: string;
}) => {
  return (
    <div
      className={`${className} flex items-center  text-white ${
        fontSize || "font-bold"
      }  ${withArrow ? "cursor-pointer" : null} ${size}`}
    >
      {tokens?.map((token, index) => (
        <span key={token?.id + "-" + index}>
          {index ? separator || "-" : ""}
          {toRealSymbol(token?.symbol || "")}
        </span>
      ))}
      {withArrow ? <span className="ml-1.5">{">"}</span> : null}
    </div>
  );
};

export function IconLeftV3({
  className = "",
  token,
  label = true,
  size = 11,
  showArrow = true,
  hover,
}: {
  className?: string;
  token: TokenMetadata;
  label?: boolean;
  size?: number | string;
  showArrow?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={`${className} flex max-w-p150 items-center bg-gray-60 text-white text-lg  rounded-full flex-shrink-0 pr-4 cursor-pointer  ${
        hover ? "bg-opacity-30" : "bg-opacity-10"
      }`}
      style={{ lineHeight: "unset" }}
    >
      <div className="relative flex-shrink-0">
        <img
          key={token.id}
          className={`mr-2 xs:ml-0 xs:mr-1 xs:relative xs:right-1 flex-shrink-0 h-${size} w-${size} xs:h-7 xs:w-7 border rounded-full border-black`}
          src={token.icon}
        />
        {token.isRisk && (
          <div className="absolute bottom-0 left-3.5 transform -translate-x-1/2 text-center xsm:left-2.5">
            <TknIcon />
          </div>
        )}
      </div>
      {label && (
        <p className="block text-base overflow-ellipsis overflow-hidden font-bold">
          {toRealSymbol(token.symbol)}
        </p>
      )}
      {showArrow && (
        <div className="pl-2 xs:pl-1 text-xs">
          <SelectArrowIcon
            className={`${hover ? "text-white" : "text-gray-60"}`}
          />
        </div>
      )}
    </div>
  );
}
