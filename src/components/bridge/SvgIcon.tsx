import dynamic from "next/dynamic";
import React from "react";

export type IconName = keyof typeof IconSets;

const IconSets = {
  IconArrowDown: dynamic(() => import("./assets/arrow-down.svg")),
  IconClose: dynamic(() => import("./assets/close.svg")),
  IconDisconnect: dynamic(() => import("./assets/disconnect.svg")),
  IconExchange: dynamic(() => import("./assets/exchange.svg")),
  IconExport: dynamic(() => import("./assets/export.svg")),
  IconInfo: dynamic(() => import("./assets/info.svg")),
  IconLine: dynamic(() => import("./assets/line.svg")),
  IconRefresh: dynamic(() => import("./assets/refresh.svg")),
  IconSearch: dynamic(() => import("./assets/search.svg")),
  IconSetting: dynamic(() => import("./assets/setting.svg")),
  IconSuccess: dynamic(() => import("./assets/success.svg")),
  IconSuccessCircle: dynamic(() => import("./assets/success-circle.svg")),
  IconWaiting: dynamic(() => import("./assets/waiting.svg")),
  IconWarning: dynamic(() => import("./assets/warning.svg")),
  IconDirection: dynamic(() => import("./assets/direction.svg")),
  IconLoading: dynamic(() => import("./assets/loading.svg")),
  IconEmpty: dynamic(() => import("./assets/empty.svg")),
  IconErrorCircleFill: dynamic(() => import("./assets/error-circle-fill.svg")),
  IconSuccessCircleFill: dynamic(
    () => import("./assets/success-circle-fill.svg")
  ),
};

export default function SvgIcon({
  name,
  className,
  ...props
}: {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = IconSets[name] as React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  return (
    <i className={`svg-icon-wrapper  ${className || ""}`} {...props}>
      <Icon className="svg-icon" />
    </i>
  );
}
