import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
export function ArrowDown() {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L6 5.44444L11 1"
        stroke="#91A2AE"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpWithYellow() {
  return (
    <svg
      width="12"
      height="6"
      viewBox="0 0 12 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 5.70703H2.91667L5.70711 2.82835L8.53304 5.70703L11.4142 5.70703L5.70711 -7.58171e-05L0 5.70703Z"
        fill="#9EFF00"
      />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 8.6H3.4L6.48571 3L10.4286 13L13.4286 8.6H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowTopRightIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 1H10V9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <path
        d="M9 2L2 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
