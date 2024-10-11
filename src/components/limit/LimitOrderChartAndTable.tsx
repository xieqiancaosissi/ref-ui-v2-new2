import React from "react";
import Modal from "react-modal";
import RateChart from "@/components/limit/RateChart";
import LimitOrderTable from "./LimitOrderTable";
import { isMobile } from "@/utils/device";
import { useLimitOrderChartStore } from "@/stores/limitChart";

function LimitOrderChartAndTable() {
  const limitChartStore = useLimitOrderChartStore();
  const showViewOrder = limitChartStore.getShowViewAll();
  const mobile = isMobile();
  function closeOrderTable(e: any) {
    e.stopPropagation();
    limitChartStore.setShowViewAll(false);
  }
  return (
    <div className="flex items-stretch justify-between xsm:overflow-x-hidden">
      {/* chart area */}
      <RateChart />
      {/* table area */}
      {mobile ? (
        <Modal
          isOpen={true}
          onRequestClose={closeOrderTable}
          overlayClassName={showViewOrder ? "" : "hidden"}
          style={{
            overlay: {
              zIndex: 300,
            },
          }}
        >
          <LimitOrderTable />
        </Modal>
      ) : (
        <LimitOrderTable />
      )}
    </div>
  );
}

export default React.memo(LimitOrderChartAndTable);
