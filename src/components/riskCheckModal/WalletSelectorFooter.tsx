import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
const WalletSelectorFooter = () => {
  const intl = useIntl();

  return (
    <div className="flex items-center pt-5 justify-center text-xs">
      <span className="text-xs">
        <FormattedMessage
          id="first_time_using_ref"
          defaultMessage="First time using Ref"
        />
        ?
      </span>
      <div
        className="ml-2 cursor-pointer hover:underline font-bold"
        onClick={() => {
          window.open("https://ref.finance");
        }}
        style={{
          textDecorationThickness: "0.5px",
        }}
      >
        {intl.formatMessage({
          id: "learn_more",
          defaultMessage: "Learn more",
        })}
      </div>
    </div>
  );
};
export default WalletSelectorFooter;
