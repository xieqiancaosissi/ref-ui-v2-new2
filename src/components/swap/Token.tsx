import React from "react";
function Token({ icon, size }: { icon: string; size: string }) {
  return (
    <img
      src={icon}
      className="rounded-full border border-dark-110 flex-shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
export default React.memo(Token);
