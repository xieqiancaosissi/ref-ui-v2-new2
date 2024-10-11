import React, { useState } from "react";
import Modal from "react-modal";
import poolStyle from "../pool.module.css";
import { SearchIcon } from "../icon";
import _ from "lodash";

function SearchModalForMobile(props: any) {
  const { isOpen, onRequestClose, setMobilePros } = props;
  const [isActive, setActive] = useState("");
  const [keyWordsType, setKeyWordsType] = useState("token");
  const [searchValue, setSearchValue] = useState("");
  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 500);

  const sendSearchValue = (e: any) => {
    setSearchValue(e.target.value);
    debouncedSendSearchValue(e);
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflow: "auto",
        },
        content: {
          position: "absolute", //
          bottom: "0", //
          left: "50%", //
          transform: "translate(-50%, 0%)", //
          outline: "none",
        },
      }}
    >
      <div
        className="h-137 p-4"
        style={{
          background: "#1B242C",
          width: "100vw",
          position: "fixed",
          borderRadius: "24px 24px 0 0",
          bottom: "32px",
          border: "1px solid #2F3A39",
        }}
      >
        <div className="my-4 text-lg text-white font-medium">Search Pool</div>

        <div className={poolStyle.filterSeacrhInputContainerForMobile}>
          <div
            onClick={() => {
              keyWordsType == "token"
                ? setKeyWordsType("id")
                : setKeyWordsType("token");
              setSearchValue("");
            }}
            className={`${poolStyle.filterSearchInputBefore} ${
              keyWordsType == "token"
                ? "bg-gray-20 text-gray-50"
                : "bg-green-10 text-white"
            }`}
          >
            #
          </div>
          <input
            type="text"
            className={poolStyle.filterSearchInputForMobile}
            placeholder={`Search pool by ${keyWordsType}`}
            onChange={sendSearchValue}
            value={searchValue}
          />
          <span className="hover:scale-110">
            <SearchIcon />
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(SearchModalForMobile);
