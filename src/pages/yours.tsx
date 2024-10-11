import React, { useState } from "react";
import dynamic from "next/dynamic";
const Yours = dynamic(() => import("@/components/yours"), { ssr: false });

export default function YoursPage() {
  return (
    <div>
      <Yours></Yours>
    </div>
  );
}
