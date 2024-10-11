export const Checkbox = (props: any) => {
  return (
    <svg
      {...props}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="15" height="15" rx="4" fill="#304452" />
    </svg>
  );
};
export const CheckboxSelected = (props: any) => {
  return (
    <svg
      {...props}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="15"
        height="15"
        rx="4"
        // fill="url(#paint0_linear_9045_6031)"
        fill="#00C6A2"
      />
      <path
        d="M4 7.5L6.66667 10L12 5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_9045_6031"
          x1="7.5"
          y1="0"
          x2="7.5"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
};
