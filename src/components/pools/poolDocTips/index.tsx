import React from "react";
import styles from "./index.module.css";
import { ExclamationIcon } from "@/components/common/Icons";
function DocTips({ tips, src }: { tips: string; src: string }) {
  return (
    <div className={`${styles.dclTips}`}>
      <div className="flex lg:items-center lg:pl-4 xsm:pl-2">
        <span className="mx-1 flex">
          <ExclamationIcon className="flex-shrink-0 mt-1 mr-1" />
          <span>
            {tips} &nbsp;
            {src && (
              <span
                className={styles.learnMore}
                onClick={() => {
                  window.open(src, "_blank");
                }}
              >
                Learn more
              </span>
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

export default React.memo(DocTips);
