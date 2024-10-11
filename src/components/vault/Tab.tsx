import React, { useEffect, useMemo, useState, useContext, useRef } from "react";
import styles from "./index.module.css";
import { vaultTabList, vaultTabListMobile } from "./vaultConfig";

export default function Tab(props: any) {
  const { setCurrentTag } = props;
  const [activeTab, setTabActive] = useState("All");

  const [isMobile, setIsMobile] = useState(false);

  const [showDropDown, setShowDropDown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropDown(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // ipad pro
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className="frcc lg:fixed w-full h-17 xsm:px-[12px]"
      style={{
        top: "130px",
        zIndex: "51",
        background: !isMobile ? "#0C171F" : "",
      }}
    >
      <div className="flex items-center lg:w-[1104px] xsm:w-full">
        {/* min-width:768px */}
        <div className={`${styles.filterPoolType}`}>
          {vaultTabList().map((item, index) => {
            return (
              <div
                key={`${item.key}_${index}`}
                className={`
                ${
                  item.key == activeTab
                    ? "text-white bg-poolsTypelinearGrayBg rounded"
                    : "text-gray-60"
                }
                 w-29 lg:h-8 frcc text-base
              `}
                onClick={() => {
                  setTabActive(item.key);
                  setCurrentTag(item.value);
                }}
              >
                <div className="flex flex-col items-start">
                  <div className={`flex items-center`}>
                    <span
                      className={`text-sm  ${
                        item.key == activeTab ? "text-white " : "text-gray-10"
                      }`}
                    >
                      {item.value}
                      <span>({item.count})</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* max-width: 767px */}
        <div className={`${styles.filterPoolTypeMobile}`}>
          {vaultTabListMobile().map((item, index) => {
            return (
              <div
                key={`${item.key}_${index}`}
                className={`
                ${
                  item.key == activeTab
                    ? "text-white bg-poolsTypelinearGrayBg rounded"
                    : "text-gray-60"
                }
               w-1/4 h-9 frcc text-base
              `}
                onClick={() => {
                  setTabActive(item.key);
                  setCurrentTag(item.value);
                }}
              >
                <div className="flex flex-col items-start">
                  <div className={`flex items-center`}>
                    <span
                      className={`${
                        item.key == activeTab ? "text-white " : "text-gray-10"
                      }`}
                    >
                      {item.value}
                      <span>({item.count})</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div
            className="w-1/4 h-9 frcc text-base relative hover:text-green-10"
            onClick={() => setShowDropDown((pre) => !pre)}
            ref={dropdownRef}
          >
            <DotIcon />

            {showDropDown && (
              <div className="w-[166px] h-[236px] border border-gray-70 flex flex-col justify-around p-[20px] absolute top-[40px] right-0 bg-dark-70 rounded-lg">
                {vaultTabList().map((item: any, index: any) => {
                  return (
                    <div
                      key={item.key + index + "mobile"}
                      onClick={() => {
                        setTabActive(item.key);
                        setCurrentTag(item.value);
                      }}
                      className={`
                      ${item.key == activeTab ? "text-white" : "text-gray-60"}`}
                    >
                      {item.value}
                      <span> ({item.count}) </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DotIcon() {
  return (
    <svg
      width="18"
      height="4"
      viewBox="0 0 18 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 2C4 3.10458 3.10458 4 2 4C0.895416 4 0 3.10458 0 2C0 0.895416 0.895416 0 2 0C3.10458 0 4 0.895416 4 2ZM11 2C11 3.10458 10.1046 4 9 4C7.89542 4 7 3.10458 7 2C7 0.895416 7.89542 0 9 0C10.1046 0 11 0.895416 11 2ZM16 4C17.1046 4 18 3.10458 18 2C18 0.895416 17.1046 0 16 0C14.8954 0 14 0.895416 14 2C14 3.10458 14.8954 4 16 4Z"
        fill="currentColor"
      />
    </svg>
  );
}
