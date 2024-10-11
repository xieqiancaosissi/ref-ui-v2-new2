import React from "react";

function AddLiqTip(props: any) {
  const { tips } = props;
  return (
    <div
      className="max-h-13 w-full px-3 py-2 rounded  text-white text-xs my-2 items-start flex"
      style={{
        borderWidth: "0.5px",
        borderColor: "rgba(154, 249, 1, 0.6)",
        background: "rgba(158, 255, 0, 0.1)",
      }}
    >
      <span className="mr-2">👀</span>
      {tips}
    </div>
  );
}
export default React.memo(AddLiqTip);
