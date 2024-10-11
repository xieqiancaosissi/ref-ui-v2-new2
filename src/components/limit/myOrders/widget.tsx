import React from "react";
import { FormattedMessage } from "react-intl";
import { MyOrderCircle } from "../icons2";
const MobileInfoBannerPre = ({
  text,
  value,
}: {
  text: string | JSX.Element;
  value: string | JSX.Element;
}) => {
  return (
    <div className="flex mb-4 items-center justify-between whitespace-nowrap">
      <span className="text-[13px] text-gray-60">{text}</span>
      <span className="text-[13px] text-white">{value}</span>
    </div>
  );
};
function NoOrderCardPre({ text }: { text: "active" | "history" }) {
  return (
    <div className="w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center">
      <div className="flex items-center flex-col relative text-center z-50 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span>
          <FormattedMessage
            id={`your_${text}_orders_will_appear_here`}
            defaultMessage={"Your orders will appear here"}
          />
          .
        </span>
      </div>
    </div>
  );
}
export const MobileInfoBanner = React.memo(MobileInfoBannerPre);
export const NoOrderCard = React.memo(NoOrderCardPre);
