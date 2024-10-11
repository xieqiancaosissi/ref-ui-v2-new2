import React, { useState } from "react";
import styles from "./index.module.css";

const HoverTooltip = ({
  children,
  tooltipText,
  isOverlocking,
  position,
}: {
  children: any;
  tooltipText: string;
  isOverlocking?: boolean;
  position?: string;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  return (
    <div
      className={styles.hoverTooltipContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && !isOverlocking && (
        <div
          className={`${
            position != "right" ? styles.hoverTooltip : styles.hoverTooltipRight
          }`}
        >
          {tooltipText}
        </div>
      )}

      {showTooltip && isOverlocking && (
        <div className={styles.hoverTooltipOverlocking}>
          <p className="leading-4">
            {`·  LP locking is not investment advice and doesn't ensure total fund
            safety. Significant risks remain if the project team holds many
            tokens.`}
          </p>
          <p className="leading-4 mt-4">
            · Locking LP yields no returns; ordinary users need not participate.
          </p>
        </div>
      )}
    </div>
  );
};

export default HoverTooltip;
