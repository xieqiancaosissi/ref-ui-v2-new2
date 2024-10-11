import React from "react";
import { TipIcon } from "../Icons";
import styles from "./tips.module.css";

export default function HoverTip({
  msg,
  extraStyles,
  OhterIcon,
  origin,
  msg1,
  msg2,
  mobileRight,
}: {
  msg?: string;
  extraStyles?: string;
  OhterIcon?: any;
  origin?: string;
  msg1?: string;
  msg2?: string;
  mobileRight?: boolean;
}) {
  return (
    <div className="w-4 h-4 relative mx-1">
      {
        <div className={styles.iconContainer}>
          {OhterIcon ? <OhterIcon></OhterIcon> : <TipIcon></TipIcon>}
        </div>
      }
      {origin == "createPool" ? (
        <div className={`${styles.tooltipForCreatePool}  ${extraStyles}`}>
          <div>{msg1}</div>
          <div>{msg2}</div>
        </div>
      ) : (
        <div
          className={`${
            mobileRight ? styles.tooltipMobileRight : styles.tooltip
          }  ${extraStyles}`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
