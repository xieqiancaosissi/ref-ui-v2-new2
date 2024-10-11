// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import pageStyle from "./index.module.css";
import { isMobile } from "@/utils/device";

const Pagination = ({
  totalItems,
  itemsPerPage,
  onChangePage,
  onPageSizeChange,
  toFirst,
}: {
  totalItems: number;
  itemsPerPage: number;
  onChangePage: any;
  onPageSizeChange: any;
  toFirst?: boolean;
}) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [pageCount]);
  const activePageStyle = { backgroundColor: "#566069" };
  const disableStyle = { color: "#7E8A93" };
  const activeLinkStyle = { color: "#fff" };

  const disableStyleMobile = {
    color: "#7E8A93",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "8px",
    fontSize: "12px",
    background: "#182833",
  };

  const activeLinkStyleMobile = {
    color: "white",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "8px",
    fontSize: "12px",
    background: "#182833",
  };

  const goToPage = (pageNumber: any) => {
    if (pageNumber >= 1 && pageNumber <= pageCount && pageNumber !== "...") {
      setCurrentPage(Number(pageNumber));
      onChangePage(pageNumber, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    onPageSizeChange(newPageSize);
    goToPage(1);
  };

  useEffect(() => {
    if (toFirst) {
      goToPage(1);
    }
  }, [toFirst]);

  const goPreOrNext = (index: number) => {
    if (index + 1 > 5) {
      onChangePage(currentPage + 5);
      setCurrentPage((pre) => pre + 5);
    } else {
      onChangePage(currentPage - 5);
      setCurrentPage((pre) => pre - 5);
    }
  };

  const pageNumbersList = useMemo(() => {
    const renderList = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        renderList.push(i);
      }
    } else {
      // Condition for current page
      if (currentPage < 5) {
        renderList.push(...[1, 2, 3, 4, 5, 6, "...", pageCount]);
      } else if (currentPage >= 5 && currentPage < pageCount - 4) {
        renderList.push(
          ...[
            1,
            "...",
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
            "...",
            pageCount,
          ]
        );
      } else if (currentPage >= pageCount - 4) {
        renderList.push(
          ...[
            1,
            "...",
            pageCount - 5,
            pageCount - 4,
            pageCount - 3,
            pageCount - 2,
            pageCount - 1,
            pageCount,
          ]
        );
      }
    }
    return renderList;
  }, [currentPage, pageCount]);

  const pageNumbersListForMobile = useMemo(() => {
    return (
      <div className="lg:hidden">
        <span className="text-green-10">{currentPage}</span>
        <span className="mx-1">/</span>
        <span className="text-gray-10">{pageCount}</span>
      </div>
    );
  }, [currentPage, pageCount]);

  // go to
  const [goToValue, setGoToValue] = useState(1);
  const gotoValueChange = (e: any) => {
    if (e.target.value) {
      setGoToValue(Number(e.target.value));
    } else {
      // @ts-ignore
      setGoToValue("");
    }
  };
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      if (goToValue > pageCount) {
        goToPage(pageCount);
      } else if (goToValue < 1) {
        goToPage(1);
      } else {
        goToPage(goToValue);
      }
    }
  };

  return (
    pageCount > 0 && (
      <div
        className={`flex justify-center items-center text-white text-sm font-bold cursor-pointer`}
      >
        <div className="flex mr-auto lg:hidden">
          <div
            className="flex items-center justify-center"
            style={
              currentPage == 1 ? disableStyleMobile : activeLinkStyleMobile
            }
            onClick={() => currentPage > 1 && goToPage(1)}
          >
            {`|<`}
          </div>
          <div
            className="mx-6 flex items-center justify-center"
            style={
              currentPage == 1 ? disableStyleMobile : activeLinkStyleMobile
            }
            onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
          >
            {`<<`}
          </div>
        </div>

        <div
          style={currentPage == 1 ? disableStyle : activeLinkStyle}
          onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
          className="mr-auto xsm:hidden"
        >
          {`<< Previous`}
        </div>

        {/* main page list */}

        <ul className="flex w-80 justify-center xsm:hidden">
          {pageNumbersList.map((item, index) => {
            if (item === "...") {
              return (
                <li key={`ellipsis-${index}`} className="w-6 h-6 frcc rounded">
                  <span
                    className="page-link"
                    onClick={() => goPreOrNext(index)}
                  >
                    {item}
                  </span>
                </li>
              );
            } else {
              return (
                <li
                  key={item}
                  className={`frcc w-6 h-6 rounded ${
                    index % 2 == 0 ? "mx-2" : ""
                  }`}
                  style={currentPage == item ? activePageStyle : undefined}
                >
                  <span className="page-link" onClick={() => goToPage(item)}>
                    {item}
                  </span>
                </li>
              );
            }
          })}
        </ul>

        {pageNumbersListForMobile}

        <div className="frcc ml-4 xsm:hidden">
          <span className="text-gray-50 text-sm">Go to</span>
          <div className={pageStyle.filterSeacrhInputContainer}>
            <input
              type="number"
              className={pageStyle.filterSearchInput}
              value={goToValue}
              onChange={(e) => gotoValueChange(e)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="flex ml-auto lg:hidden">
          <div
            className="mx-6 flex items-center justify-center"
            style={
              pageCount == 1 || currentPage == pageCount
                ? disableStyleMobile
                : activeLinkStyleMobile
            }
            onClick={() => currentPage < pageCount && goToPage(currentPage + 1)}
          >
            {`>>`}
          </div>
          <div
            className="flex items-center justify-center"
            style={
              pageCount == 1 || currentPage == pageCount
                ? disableStyleMobile
                : activeLinkStyleMobile
            }
            onClick={() => currentPage < pageCount && goToPage(pageCount)}
          >
            {`>|`}
          </div>
        </div>

        <div
          style={
            pageCount == 1 || currentPage == pageCount
              ? disableStyle
              : activeLinkStyle
          }
          onClick={() => currentPage < pageCount && goToPage(currentPage + 1)}
          className=" ml-auto xsm:hidden"
        >
          {`Next >>`}
        </div>
      </div>
    )
  );
};

export default Pagination;
