import React from "react";
import Modal from "react-modal";
import { isMobile } from "@/utils/device";
import { AnalysisTextItem } from "@/pages/xref";
import { QuestionMark } from "../farm/icon";
import CustomTooltip from "../customTooltip/customTooltip";

function XrefDetailsModal({
  isOpen,
  onRequestClose,
  analysisText,
  totalDataArray,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  analysisText: any;
  totalDataArray: any;
}) {
  const cardWidth = isMobile() ? "100vw" : "430px";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const is_mobile = isMobile();

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
        },
        content: {
          outline: "none",
          ...(is_mobile
            ? {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
              }
            : {
                transform: "translate(-50%, -50%)",
              }),
        },
      }}
    >
      <div
        className="text-white"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="bg-dark-10 px-6 pt-6 pb-2 lg:rounded-lg xs:rounded-t-2xl xs:border xs:border-modalGrayBg">
          <div className="flex justify-between mb-6">
            <div className="text-lg">Details</div>
          </div>
          <div>
            {Object.values(analysisText).map((value, index: number) => {
              const item = value as AnalysisTextItem;
              return (
                <div className="mb-4 text-sm" key={index}>
                  <p className="text-gray-50">
                    {item.title}
                    {item.tipContent ? (
                      <>
                        <span
                          className="relative top-0.5 inline-block ml-1"
                          data-type="info"
                          data-place="right"
                          data-multiline={true}
                          data-class="reactTip"
                          data-tooltip-html={item.tipContent}
                          data-tooltip-id="yourRewardsId"
                        >
                          <QuestionMark />
                        </span>
                        <CustomTooltip
                          style={{ width: "75%" }}
                          id="yourRewardsId"
                        />
                      </>
                    ) : null}
                  </p>
                  <div className="flex">
                    <p className="text-white">{totalDataArray[index]}</p>
                    <p className="ml-1.5 text-gray-50">{item.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(XrefDetailsModal);
