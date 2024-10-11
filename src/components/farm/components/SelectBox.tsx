import React from "react";
// import { FormattedMessage, useIntl } from "react-intl";

function SelectBox(props: any) {
  const { list, selectedId, setSelectedId, type, disabled } = props;
  function switchOption(id: string) {
    if (disabled) return;
    setSelectedId(id);
  }
  const selectList =
    list?.filter((item: any) => {
      return !item.hidden;
    }) || [];

  const getClassName = (item: any) => {
    if (type === "filter") {
      return `rounded-2xl border border-dark-40 py-1 px-3.5 text-sm mr-1 mb-1 xs:text-xs xs:px-2 xsm:mb-2  ${
        item.id === selectedId ? "bg-gray-100 text-white" : "text-gray-10"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`;
    } else if (type === "farm_type") {
      return `${
        item.id === selectedId
          ? "bg-poolsTypelinearGrayBg rounded"
          : "text-gray-10"
      } ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } h-8 frcc text-sm w-25 xs:flex-1 `;
    } else {
      return "";
    }
  };

  return (
    <div
      className={`lg:frcb w-full xsm:flex xsm:flex-wrap ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } `}
      tabIndex={Math.random()}
    >
      {selectList.map((item: any) => {
        const { id, label, name } = item;
        return (
          <div
            onClick={() => {
              switchOption(id);
            }}
            key={id}
            className={getClassName(item)}
          >
            <div className="flex items-center">
              <span className="text-sm">{name || label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(SelectBox);
