import React from "react";
function SwitchTabItem(props: any) {
  const { active, clickEvent } = props;
  return (
    <div
      className="flex items-center text-gray-60 cursor-pointer"
      onClick={clickEvent}
      style={{
        fontSize: "13px",
      }}
    >
      <span
        className={`flex items-center justify-center rounded-full w-3.5 h-3.5 mr-1 border ${
          active ? "border-green-10" : "border-gray-10"
        }`}
      >
        <label
          className={`w-2 h-2 rounded-full bg-green-10 ${
            active ? "" : "hidden"
          }`}
        ></label>
      </span>
      {props.children}
    </div>
  );
}
export default React.memo(SwitchTabItem);
