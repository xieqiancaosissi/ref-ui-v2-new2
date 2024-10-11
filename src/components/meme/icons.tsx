import React from "react";

export function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3536 4.35355C12.5488 4.15829 12.5488 3.84171 12.3536 3.64645L9.17157 0.464466C8.97631 0.269204 8.65973 0.269204 8.46447 0.464466C8.2692 0.659728 8.2692 0.976311 8.46447 1.17157L11.2929 4L8.46447 6.82843C8.2692 7.02369 8.2692 7.34027 8.46447 7.53553C8.65973 7.7308 8.97631 7.7308 9.17157 7.53553L12.3536 4.35355ZM0 4.5H12V3.5H0V4.5Z"
        fill="white"
      />
    </svg>
  );
}
export function ModalCloseIcon(props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.73284 5.99997L11.7359 1.99698C12.0368 1.69598 12.0882 1.25928 11.8507 1.02188L10.9779 0.149088C10.7404 -0.0884114 10.3043 -0.0363117 10.0028 0.264487L6.00013 4.26737L1.99719 0.264587C1.69619 -0.0367116 1.25948 -0.0884115 1.02198 0.149388L0.149174 1.02228C-0.0882276 1.25938 -0.0368271 1.69608 0.264576 1.99708L4.26761 5.99997L0.264576 10.0032C-0.0363271 10.304 -0.0884276 10.7404 0.149174 10.9779L1.02198 11.8507C1.25948 12.0882 1.69619 12.0367 1.99719 11.7358L6.00033 7.73266L10.0029 11.7352C10.3044 12.0368 10.7405 12.0882 10.978 11.8507L11.8508 10.9779C12.0882 10.7404 12.0368 10.304 11.736 10.0028L7.73284 5.99997Z"
        fill={props?.color || "white"}
      />
    </svg>
  );
}

export function BannerCoreBtnIconBg(props: any) {
  return (
    <svg
      {...props}
      width="9"
      height="28"
      viewBox="0 0 9 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.12903 4.14815C8.12903 6.43935 6.30953 8.2963 4.06452 8.2963C2.9436 8.2963 1.92747 7.83287 1.19078 7.08102C0.454083 6.32917 0 5.29213 0 4.14815C0 3.00417 0.454083 1.96713 1.19078 1.21528C1.92747 0.463426 2.9436 0 4.06452 0C5.18543 0 6.20156 0.463426 6.93826 1.21528C7.67495 1.96713 8.12903 3.00417 8.12903 4.14815ZM8.12903 12.4444V25.9259C8.12903 27.0699 7.21769 28 6.09678 28H2.03226C0.911341 28 0 27.0699 0 25.9259V12.4444C0 11.2972 0.911341 10.3704 2.03226 10.3704H6.09678C7.21769 10.3704 8.12903 11.2972 8.12903 12.4444Z"
        fill="black"
      />
    </svg>
  );
}
export function TipIcon(props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="5.5" stroke="#9EFF00" />
      <path
        d="M6 6L6 9"
        stroke="#9EFF00"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="3.75" r="0.75" fill="#9EFF00" />
    </svg>
  );
}
export function FireIcon(props: any) {
  return (
    <svg
      {...props}
      width="51"
      height="64"
      viewBox="0 0 51 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_572)">
        <g filter="url(#filter0_i_786_572)">
          <path
            d="M13.8305 30.5C13.8305 24.9 16.8305 17.8333 18.3305 15C21.3304 16 22.8306 14.5 23.8306 13C24.6306 11.8 24.1639 4.5 23.8306 1C27.3306 3 30.3306 5.5 36.8306 11.5C42.0306 16.3 41.9972 23.8333 41.3306 27C40.8306 28.6667 40.5306 32 43.3306 32C46.1306 32 46.4972 29 46.3306 27.5C47.8306 29 50.8306 36.5 50.3306 42.5C49.8306 48.5 45.3306 52.5 44.3306 53.5C43.3306 54.5 42.8306 55 42.8306 56C42.8306 56.8 44.8306 56.3333 45.8306 56C42.6639 59 33.6306 64.8 22.8306 64C12.0306 63.2 5.6639 57 3.83057 54C4.49723 54.6667 6.13057 56 7.33057 56C8.93057 55.6 8.33057 54.5 7.83057 54C6.33048 52.8333 2.93031 49 1.33031 43C-0.269686 37 4.33044 30.1667 6.83051 27.5C6.33051 33 7.83051 34.5 8.83051 35C9.83051 35.5 13.8305 37.5 13.8305 30.5Z"
            fill="#FF6344"
          />
        </g>
        <path
          d="M13.8305 30.5C13.8305 24.9 16.8305 17.8333 18.3305 15C21.3304 16 22.8306 14.5 23.8306 13C24.6306 11.8 24.1639 4.5 23.8306 1C27.3306 3 30.3306 5.5 36.8306 11.5C42.0306 16.3 41.9972 23.8333 41.3306 27C40.8306 28.6667 40.5306 32 43.3306 32C46.1306 32 46.4972 29 46.3306 27.5C47.8306 29 50.8306 36.5 50.3306 42.5C49.8306 48.5 45.3306 52.5 44.3306 53.5C43.3306 54.5 42.8306 55 42.8306 56C42.8306 56.8 44.8306 56.3333 45.8306 56C42.6639 59 33.6306 64.8 22.8306 64C12.0306 63.2 5.6639 57 3.83057 54C4.49723 54.6667 6.13057 56 7.33057 56C8.93057 55.6 8.33057 54.5 7.83057 54C6.33048 52.8333 2.93031 49 1.33031 43C-0.269686 37 4.33044 30.1667 6.83051 27.5C6.33051 33 7.83051 34.5 8.83051 35C9.83051 35.5 13.8305 37.5 13.8305 30.5Z"
          stroke="#FF1111"
          strokeWidth="0.5"
        />
        <path
          d="M26.8305 12C28.9972 13.3333 33.6305 17.7 34.8305 24.5C35.2305 28.5 34.6639 32.8333 34.3305 34.5C33.9972 36 34.3305 39.1 38.3305 39.5C40.3305 39.5 41.4972 38.1667 41.8305 37.5C42.1639 38.5 42.6305 41 41.8305 43C40.8305 45.5 40.3305 46.5 40.8305 48C41.3149 49.453 44.145 49.0294 44.3219 48.0925C44.3253 48.0609 44.3282 48.0301 44.3305 48C44.3305 48.0313 44.3276 48.0622 44.3219 48.0925C44.0754 50.3371 40.8751 56.3999 29.8305 63.5C28.5 64.5 23 64.5 21.3305 63.5C19.9972 62.3333 17.1305 59.9 16.3305 59.5C15.3305 59 8.83053 54 7.83053 48C7.03053 43.2 7.16387 40.3333 7.33053 39.5C7.99721 41.1667 10.1306 44.2 13.3306 43C17.3306 41.5 17.3306 38.5 17.3306 36.5C17.3306 34.5 16.8306 30.5 19.8306 26C22.2306 22.4 24.4972 19.8333 25.3306 19C26.1639 18.1667 27.6305 15.6 26.8305 12Z"
          fill="#FF9D44"
        />
        <g filter="url(#filter1_f_786_572)">
          <path
            d="M21.1628 36C22.6698 30.9091 28.0698 24.5455 30.5814 22C29.9535 24.9697 28.9488 31.9273 29.9535 36C30.9581 40.0727 35.3953 41.0909 37.4884 41.0909C36.986 45.1636 38.9535 46.6061 40 46.8182C40 47.6667 39.8744 49.7455 39.3721 51.2727C37.8651 54.3273 32.4651 60.6061 29.9535 63.3636L23.6744 64C20.1581 61.9636 15.093 51.697 13 46.8182H16.1395C18.6512 46.8182 19.2791 42.3636 21.1628 36Z"
            fill="#FFD34B"
          />
        </g>
        <path
          d="M21.3306 42C22.5306 38 26.8306 33 28.8306 31C28.3306 33.3333 27.5306 38.8 28.3306 42C29.1306 45.2 32.6639 46 34.3306 46C33.9306 49.2 35.4972 50.3333 36.3306 50.5C36.3306 51.1667 36.2306 52.8 35.8306 54C34.6306 56.4 30 61.8333 28 64H23.3306C20.5306 62.4 16.4972 54.3333 14.8306 50.5H17.3306C19.3306 50.5 19.8306 47 21.3306 42Z"
          fill="#FFE24B"
        />
        <g filter="url(#filter2_f_786_572)">
          <path
            d="M22.1395 46.6667C23.0884 43.5152 26.4884 39.5758 28.0698 38C27.6744 39.8384 27.0419 44.1455 27.6744 46.6667C28.307 49.1879 31.1008 49.8182 32.4186 49.8182C32.1023 52.3394 33.3411 53.2323 34 53.3636C34 53.8889 33.9209 55.1758 33.6047 56.1212C32.6558 58.0121 29.2558 61.899 27.6744 63.6061L23.7209 64C21.507 62.7394 18.3178 56.3838 17 53.3636H18.9767C20.5581 53.3636 20.9535 50.6061 22.1395 46.6667Z"
            fill="#FFFFE6"
          />
        </g>
        <path
          d="M5.3305 20C6.9305 18.4 7.99716 16 8.3305 15C8.49719 15.6667 8.73055 17.6 8.3305 20C7.93044 22.4 5.49714 25.3333 4.3305 26.5C3.99716 25 3.7305 21.6 5.3305 20Z"
          fill="#FF643F"
          stroke="#FF1111"
          strokeWidth="0.5"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_786_572"
          x="0.75"
          y="-1.4563"
          width="49.8862"
          height="65.7815"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_572"
          />
        </filter>
        <filter
          id="filter1_f_786_572"
          x="8"
          y="17"
          width="37"
          height="52"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="2.5"
            result="effect1_foregroundBlur_786_572"
          />
        </filter>
        <filter
          id="filter2_f_786_572"
          x="14"
          y="35"
          width="23"
          height="32"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_572"
          />
        </filter>
        <clipPath id="clip0_786_572">
          <rect width="51" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function MoneyIcon(props: any) {
  return (
    <svg
      {...props}
      width="45"
      height="59"
      viewBox="0 0 45 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_583)">
        <g filter="url(#filter0_ii_786_583)">
          <path
            d="M36.5 2L6 2.5C8 4.33333 12.2 8.7 13 11.5C13.8 14.3 15 16.3333 15.5 17H28L31 10C32.2 7.2 35.1667 3.5 36.5 2Z"
            fill="url(#paint0_linear_786_583)"
          />
        </g>
        <g filter="url(#filter1_iii_786_583)">
          <path
            d="M3 27C3.8 22.2 11.6667 18.3333 15.5 17H28C36 19 41 25.5 41 27C41 28.5 41.5 32 42 34C42.5 36 43 42 42.5 44.5C42.1 46.5 43 48.3333 43.5 49C44 49.6667 44.8 51.2 44 52C41 55 39.5 59 22 59C3 57.5 1 52.5 0 51C-1 49.5 0.5 49 0.5 48.5C0.5 48 1 43.5 1 40C1 36.5 2 33 2.5 31.5C3 30 2.5 28.5 3 27Z"
            fill="url(#paint1_linear_786_583)"
          />
        </g>
        <g filter="url(#filter2_f_786_583)">
          <path
            d="M13 28.5C14.2 22.9 16.5 18.5 17.5 17H19C17 19.8 14.1667 25.8333 13 28.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter3_f_786_583)">
          <path
            d="M25 32.5C25 25 21.5 18.5 20.5 17H19C21 19.8 23.926 25 25 32.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter4_f_786_583)">
          <path
            d="M25.0002 32.5C26.5 25.5 23.5002 18.5 22.5002 17H19.0002C21.0002 19.8 23.9261 25 25.0002 32.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter5_i_786_583)">
          <path
            d="M11.0002 1.5H21.5002C21.5002 0.5 24.5 0 26.5 0C28.5 0 32 1 31.5 2C28.7 6.4 28 13.5 28 16.5H17.5C16 13.5 11.5002 3.5 11.0002 3C10.6002 2.6 10.8335 1.83333 11.0002 1.5Z"
            fill="url(#paint2_linear_786_583)"
          />
        </g>
        <g filter="url(#filter6_i_786_583)">
          <path
            d="M10 1.5H16.5C16.5 1.5 20.5 5 22 16.5H17.5C16 13.5 11.3165 3.6324 11.0002 3C10.5 2 10 1.5 10 1.5Z"
            fill="url(#paint3_linear_786_583)"
          />
        </g>
        <g filter="url(#filter7_f_786_583)">
          <path
            d="M17 2H22H23C23.1667 2.83333 23.4 5.2 23 8C21.5 17.5 21 16 21 15.5C20.6 7.9 18.1667 3.33333 17 2Z"
            fill="#9C7C36"
          />
        </g>
        <g filter="url(#filter8_i_786_583)">
          <path
            d="M22 5C22 2 21.5001 1.5 21.5001 1.5C21.5001 0.5 24.4999 0 26.4999 0C28.4999 0 31.9999 1 31.4999 2C28.6999 6.4 27.9999 13.5 27.9999 16.5H21C21 16.5 22 8 22 5Z"
            fill="url(#paint4_linear_786_583)"
          />
        </g>
        <g filter="url(#filter9_f_786_583)">
          <path
            d="M7.00983 39.8766C6.96063 28.0763 12.6099 19.8459 15.7554 17H16.7556C9.25487 24.8133 7.16689 33.9492 7.00983 39.8766C7.01537 41.2066 7.09331 42.5819 7.25538 44C7.07317 42.9431 6.96587 41.5355 7.00983 39.8766Z"
            fill="#946621"
          />
        </g>
        <g filter="url(#filter10_f_786_583)">
          <path
            d="M7.07431 41.9161C6.3123 29.0261 12.4315 20.0071 15.7551 17H17.7554C9.32891 25.7776 6.96325 36.2245 7.07431 41.9161C7.11474 42.5999 7.17454 43.2947 7.25514 44C7.15328 43.4092 7.08978 42.7087 7.07431 41.9161Z"
            fill="#946621"
          />
        </g>
        <g filter="url(#filter11_f_786_583)">
          <path
            d="M38.6811 43.9161C39.4431 31.0261 33.3239 22.0071 30.0002 19H28C36.4265 27.7776 38.7921 38.2245 38.6811 43.9161C38.6406 44.5999 38.5808 45.2947 38.5002 46C38.6021 45.4092 38.6656 44.7087 38.6811 43.9161Z"
            fill="#946621"
          />
        </g>
        <rect x="15" y="16" width="13" height="1" fill="#4C4244" />
        <path
          d="M21.8801 49.9659C20.3388 49.9659 18.9448 49.7732 17.6981 49.3879C16.4741 48.9799 15.3975 48.4359 14.4681 47.7559C13.5615 47.0759 12.8135 46.2939 12.2241 45.4099C11.6348 44.5259 11.5 43.5 11.5 43.5H15C15.476 44.2933 15.7148 44.4579 16.4401 45.0699C17.1655 45.6592 18.0041 46.1239 18.9561 46.4639C19.9081 46.8039 20.9508 46.9739 22.0841 46.9739C23.6255 46.9739 24.8381 46.7132 25.7221 46.1919C26.6288 45.6479 27.0821 44.8432 27.0821 43.7779C27.0821 43.1659 26.8555 42.6219 26.4021 42.1459C25.9488 41.6472 25.1328 41.2619 23.9541 40.9899L18.9901 39.8339C17.6755 39.5392 16.5875 39.1312 15.7261 38.6099C14.8875 38.0886 14.2641 37.4539 13.8561 36.7059C13.4481 35.9352 13.2441 35.0966 13.2441 34.1899C13.2441 32.9432 13.5728 31.8212 14.2301 30.8239C14.9101 29.8266 15.8848 29.0332 17.1541 28.4439C18.4235 27.8319 19.9535 27.5259 21.7441 27.5259C23.6708 27.5259 25.3595 27.8886 26.8101 28.6139C28.2608 29.3392 29.4621 30.4272 30.4141 31.8779C31.2273 33.1171 31.5 35 31.5 35H28.2423C28.2423 35 28.3134 34.4474 28.1021 34.1219C27.2635 32.8299 26.3115 31.9006 25.2461 31.3339C24.1808 30.7672 22.9115 30.4839 21.4381 30.4839C20.3501 30.4839 19.4548 30.6312 18.7521 30.9259C18.0721 31.1979 17.5621 31.5832 17.2221 32.0819C16.8821 32.5579 16.7121 33.0906 16.7121 33.6799C16.7121 34.1559 16.8028 34.5866 16.9841 34.9719C17.1881 35.3572 17.5508 35.6972 18.0721 35.9919C18.5935 36.2866 19.3301 36.5359 20.2821 36.7399L24.7021 37.7259C26.8101 38.2019 28.3061 38.9046 29.1901 39.8339C30.0741 40.7632 30.5161 41.9532 30.5161 43.4039C30.5161 44.7412 30.1535 45.9086 29.4281 46.9059C28.7028 47.8806 27.6941 48.6399 26.4021 49.1839C25.1101 49.7052 23.6028 49.9659 21.8801 49.9659ZM20.4521 52.2639V25.2959H23.1721V52.2639H20.4521Z"
          fill="#4C4244"
        />
      </g>
      <defs>
        <filter
          id="filter0_ii_786_583"
          x="6"
          y="2"
          width="30.5"
          height="15"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.588235 0 0 0 0 0.462745 0 0 0 0 0.262745 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.529412 0 0 0 0 0.341176 0 0 0 0 0.141176 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_583"
            result="effect2_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter1_iii_786_583"
          x="-0.34375"
          y="13"
          width="44.6831"
          height="50"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.560335 0 0 0 0 0.370033 0 0 0 0 0 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.282829 0 0 0 0 0.186667 0 0 0 0 0 0 0 0 0.4 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_583"
            result="effect2_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.384314 0 0 0 0 0.262745 0 0 0 0 0.113725 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_583"
            result="effect3_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter2_f_786_583"
          x="12"
          y="16"
          width="8"
          height="13.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter3_f_786_583"
          x="18"
          y="16"
          width="8"
          height="17.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter4_f_786_583"
          x="16"
          y="14"
          width="12.4126"
          height="21.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter5_i_786_583"
          x="10.7793"
          y="0"
          width="20.769"
          height="16.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter6_i_786_583"
          x="10"
          y="1.5"
          width="12"
          height="15"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter7_f_786_583"
          x="15"
          y="0"
          width="10.2207"
          height="17.896"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter8_i_786_583"
          x="21"
          y="0"
          width="10.5483"
          height="16.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter9_f_786_583"
          x="6"
          y="16"
          width="11.7554"
          height="29"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter10_f_786_583"
          x="5.00928"
          y="15"
          width="14.7461"
          height="31"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter11_f_786_583"
          x="26"
          y="17"
          width="14.7461"
          height="31"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <linearGradient
          id="paint0_linear_786_583"
          x1="21.25"
          y1="2"
          x2="21.25"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B9A382" />
          <stop offset="0.495" stopColor="#DDA529" />
          <stop offset="1" stopColor="#D6AD3C" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_786_583"
          x1="21.9978"
          y1="17"
          x2="21.9978"
          y2="59"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFDA57" />
          <stop offset="1" stopColor="#FFE68F" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_786_583"
          x1="21.1638"
          y1="0"
          x2="21.1638"
          y2="16.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CDAB" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_786_583"
          x1="24"
          y1="9"
          x2="16"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CDAB" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_786_583"
          x1="18"
          y1="8"
          x2="33"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A2833E" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <clipPath id="clip0_786_583">
          <rect width="45" height="59" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function DrumstickIcon(props: any) {
  return (
    <svg
      {...props}
      width="60"
      height="64"
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_581)">
        <g filter="url(#filter0_iii_786_581)">
          <path
            d="M8.47049 4.6312C9.28405 2.19052 10.8434 1.24137 11.5213 1.07188C14.0639 0.563404 16.0974 1.58035 17.1143 4.6312C18.1313 7.68205 17.1143 10.7329 17.1143 12.7668C17.1143 14.3939 18.1313 15.8176 18.6398 16.3261L27.2838 25.4787L21.1821 30.0549L16.6059 24.4617L12.5381 19.377C12.3686 19.2075 11.6228 18.8685 9.9957 18.8685C6.33468 19.682 3.72465 18.5295 2.87727 17.8515C1.52134 16.6651 -0.885444 13.5804 0.334895 10.7329C1.86032 7.17357 4.91117 8.19052 6.43659 7.68205C7.96201 7.17357 7.45354 7.68205 8.47049 4.6312Z"
            fill="url(#paint0_linear_786_581)"
          />
        </g>
        <g filter="url(#filter1_f_786_581)">
          <path
            d="M14.3023 15.1842L7.11865 8.59276C8.55538 8.59276 8.55538 6.7951 9.27375 4.99743C9.99211 3.19976 12.1472 0.802874 14.3023 2.60054C16.0264 4.03867 15.0207 11.5889 14.3023 15.1842Z"
            fill="url(#paint1_linear_786_581)"
          />
        </g>
        <g filter="url(#filter2_i_786_581)">
          <path
            d="M25.758 20.9024C26.9783 22.5295 30.3851 22.8168 33.3851 23.9532C35.5587 24.7766 34.9107 24.4618 38.9785 25.9872C43.0463 27.5126 53.2158 31.0719 57.7921 40.2245C62.3684 49.377 58.8091 57.5126 56.2667 59.5465C53.7243 61.5804 46.0972 66.1567 36.9446 63.1058C27.7921 60.055 24.2328 50.9024 22.7071 46.8347C21.1815 42.7669 19.148 33.1058 18.6396 31.5804C18.1311 30.055 17.1139 29.038 16.097 27.0041C15.2834 25.377 16.7749 24.2923 17.6224 23.9533C17.9614 23.9533 18.6393 23.8516 18.6393 23.4448C18.6393 22.4279 19.1478 21.4109 20.1648 21.4109C21.1817 21.4109 21.1817 21.4109 21.6902 20.9024C22.1987 20.394 21.6902 19.8854 22.7071 19.377C23.7241 18.8685 24.2326 18.8685 25.758 20.9024Z"
            fill="url(#paint2_radial_786_581)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_iii_786_581"
          x="-1"
          y="0.947021"
          width="28.2837"
          height="31.1079"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.986328 0 0 0 0 0.951438 0 0 0 0 0.910732 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_581"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_581"
            result="effect2_innerShadow_786_581"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_581"
            result="effect3_innerShadow_786_581"
          />
        </filter>
        <filter
          id="filter1_f_786_581"
          x="6.11865"
          y="0.963867"
          width="10.1357"
          height="15.2205"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_786_581"
          />
        </filter>
        <filter
          id="filter2_i_786_581"
          x="15.8618"
          y="15.0945"
          width="44.1382"
          height="49.0305"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-5" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.552631 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_581"
          />
        </filter>
        <linearGradient
          id="paint0_linear_786_581"
          x1="16.2712"
          y1="12.6419"
          x2="10.1695"
          y2="21.7945"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDE3D5" />
          <stop offset="1" stopColor="#897C69" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_786_581"
          x1="11.1864"
          y1="9.59099"
          x2="16.2638"
          y2="9.01703"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B0A699" />
          <stop offset="1" stopColor="#AA9E90" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id="paint2_radial_786_581"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(50.3388 36.0318) rotate(125.311) scale(29.9094 29.3164)"
        >
          <stop stopColor="#EBC493" />
          <stop offset="0.245" stopColor="#E6AC64" />
          <stop offset="0.56" stopColor="#B8743B" />
          <stop offset="0.975" stopColor="#6F2B0F" />
        </radialGradient>
        <clipPath id="clip0_786_581">
          <rect width="60" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function BoneIcon(props: any) {
  return (
    <svg
      {...props}
      width="60"
      height="64"
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_585)">
        <g filter="url(#filter0_iii_786_585)">
          <path
            d="M45 1.00002C49 0.60002 50 4.16669 50 6.00002C50 9.00004 53 9 55.5 10.5C60 13.5 60 18 57 21.5C54 25 48.5 26 47 26C45.8 26 44.1667 27.3333 43.5 28L25.5 45C25.3333 45.1667 25 46 25 48C25 56 21 62 17 63.5C12.9999 65 9.99997 61.5 9.99997 59C9.99997 57 8.33332 55.8333 7.5 55.5C5.66666 55.3333 1.69997 54 0.49997 50C-1.00003 45 4.49997 39.5 9.99997 38.5C14.4 37.7 16.5 36.5 17 36C22.3333 31 33.2 20.8 34 20C35 19 35 19 35.5 12.5C36 6 40 1.50002 45 1.00002Z"
            fill="#CACCCE"
          />
        </g>
        <g filter="url(#filter1_f_786_585)">
          <ellipse
            cx="16.1879"
            cy="54.1477"
            rx="4.00953"
            ry="6.01282"
            transform="rotate(25.2005 16.1879 54.1477)"
            fill="#F6F6F6"
          />
        </g>
        <g filter="url(#filter2_f_786_585)">
          <ellipse
            cx="7.99994"
            cy="47.2995"
            rx="4.03745"
            ry="4.92086"
            transform="rotate(31.13 7.99994 47.2995)"
            fill="#F6F6F6"
          />
        </g>
        <g filter="url(#filter3_f_786_585)">
          <path
            d="M47.2842 7.51703C45.8244 9.01363 43.6346 11.5703 42.7223 12.6616C41.8099 13.7529 40.865 16.5 40.5001 16.5C40.0439 16.5 38.6165 12.1939 39.0727 9.38776C39.2977 8.00379 39.9851 4.71091 43.6346 3.30785C47.2842 1.90479 49.109 5.64629 47.2842 7.51703Z"
            fill="#F5F5F5"
          />
        </g>
        <g filter="url(#filter4_f_786_585)">
          <path
            d="M52 12.0194C47.6 11.6194 44.1667 17.5194 43 20.5194C45.1667 20.5194 50 20.2193 52 19.0193C54.5 17.5192 57.5 12.5194 52 12.0194Z"
            fill="#F6F6F6"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_iii_786_585"
          x="-1.75049"
          y="-1.03101"
          width="61.8413"
          height="64.8921"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2" />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.431373 0 0 0 0 0.431373 0 0 0 0 0.431373 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2" dy="-2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_585"
            result="effect2_innerShadow_786_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" />
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_585"
            result="effect3_innerShadow_786_585"
          />
        </filter>
        <filter
          id="filter1_f_786_585"
          x="7.74707"
          y="44.4441"
          width="16.8813"
          height="19.4072"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="2"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter2_f_786_585"
          x="-0.291992"
          y="38.5974"
          width="16.5835"
          height="17.4043"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="2"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter3_f_786_585"
          x="35.9839"
          y="0"
          width="15.0161"
          height="19.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter4_f_786_585"
          x="40"
          y="9"
          width="18.0991"
          height="14.5193"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <clipPath id="clip0_786_585">
          <rect width="60" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ArrowRightTopIcon(props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 9L9 1M9 1H3.66667M9 1V6.33333" stroke="currentColor" />
    </svg>
  );
}

export function ArrowTopIcon(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 6.40039L6.5 2.00039L1 6.40039"
        stroke="white"
        strokeWidth="1.58"
      />
    </svg>
  );
}

export function SelectsDown(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="7"
      viewBox="0 0 13 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 1L6.5 5.4L1 1" stroke="white" strokeWidth="1.58" />
    </svg>
  );
}

export function SelectsSpecialDown(props: any) {
  return (
    <svg
      {...props}
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 5.22267C4.83426 5.64372 4.16574 5.64372 3.77072 5.22267L0.45095 1.68421C-0.148156 1.04564 0.30462 0 1.18024 0H7.81976C8.69538 0 9.14815 1.04564 8.54905 1.68421L5.22929 5.22267Z"
        fill="white"
      />
    </svg>
  );
}

export function QuestionMarkFeedForMeme(props: any) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_2477_1255"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="26"
        height="26"
      >
        <circle cx="13" cy="13" r="13" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_2477_1255)">
        <rect
          x="-0.220703"
          y="-0.330078"
          width="26.5439"
          height="26.5439"
          fill="#2F3B4C"
        />
      </g>
      <circle cx="13" cy="13" r="12.5" stroke="#636B77" />
      <g opacity="0.3">
        <mask
          id="path-4-outside-1_2477_1255"
          maskUnits="userSpaceOnUse"
          x="8"
          y="6"
          width="12"
          height="15"
          fill="black"
        >
          <rect fill="white" x="8" y="6" width="12" height="15" />
          <path d="M11.046 16.076L11.316 12.944L11.55 12.746C13.53 12.548 14.484 12.134 14.484 11.432C14.484 11.036 14.196 10.766 13.584 10.766C12.936 10.766 12.216 10.982 11.28 11.648L9.91202 8.606C11.118 7.724 12.666 7.202 14.394 7.202C16.914 7.202 18.534 8.552 18.534 10.496C18.534 12.44 17.292 14.132 14.088 14.654L13.53 16.076H11.046ZM9.03002 20L9.91202 16.76H14.088L13.206 20H9.03002Z" />
        </mask>
        <path
          d="M11.046 16.076L11.316 12.944L11.55 12.746C13.53 12.548 14.484 12.134 14.484 11.432C14.484 11.036 14.196 10.766 13.584 10.766C12.936 10.766 12.216 10.982 11.28 11.648L9.91202 8.606C11.118 7.724 12.666 7.202 14.394 7.202C16.914 7.202 18.534 8.552 18.534 10.496C18.534 12.44 17.292 14.132 14.088 14.654L13.53 16.076H11.046ZM9.03002 20L9.91202 16.76H14.088L13.206 20H9.03002Z"
          fill="#3D3D4F"
        />
        <path
          d="M11.046 16.076L10.0497 15.9901C10.0256 16.2692 10.1198 16.5456 10.3092 16.7521C10.4986 16.9585 10.7659 17.076 11.046 17.076V16.076ZM11.316 12.944L10.6701 12.1806C10.4684 12.3513 10.3424 12.5949 10.3197 12.8581L11.316 12.944ZM11.55 12.746L11.4505 11.751C11.2491 11.7711 11.0586 11.8519 10.9041 11.9826L11.55 12.746ZM11.28 11.648L10.368 12.0581C10.4908 12.3311 10.7293 12.5348 11.0182 12.6131C11.3071 12.6915 11.6159 12.6363 11.8598 12.4628L11.28 11.648ZM9.91202 8.606L9.3217 7.79883C8.94041 8.07768 8.80625 8.58532 8.99999 9.01614L9.91202 8.606ZM14.088 14.654L13.9272 13.667C13.5788 13.7238 13.2861 13.9601 13.1571 14.2887L14.088 14.654ZM13.53 16.076V17.076C13.9413 17.076 14.3107 16.8242 14.4609 16.4413L13.53 16.076ZM9.03002 20L8.06513 19.7373C7.98328 20.038 8.04626 20.3596 8.23545 20.6072C8.42464 20.8548 8.71843 21 9.03002 21V20ZM9.91202 16.76V15.76C9.46089 15.76 9.06562 16.0621 8.94713 16.4973L9.91202 16.76ZM14.088 16.76L15.0529 17.0227C15.1347 16.722 15.0718 16.4004 14.8826 16.1528C14.6934 15.9052 14.3996 15.76 14.088 15.76V16.76ZM13.206 20V21C13.6571 21 14.0524 20.6979 14.1709 20.2627L13.206 20ZM12.0423 16.1619L12.3123 13.0299L10.3197 12.8581L10.0497 15.9901L12.0423 16.1619ZM11.962 13.7074L12.196 13.5094L10.9041 11.9826L10.6701 12.1806L11.962 13.7074ZM11.6495 13.741C12.666 13.6394 13.5295 13.4745 14.1657 13.1918C14.8026 12.9087 15.484 12.3658 15.484 11.432H13.484C13.484 11.2002 13.6884 11.2153 13.3534 11.3642C13.0175 11.5135 12.414 11.6546 11.4505 11.751L11.6495 13.741ZM15.484 11.432C15.484 10.9699 15.3029 10.4963 14.8824 10.165C14.495 9.85983 14.0194 9.766 13.584 9.766V11.766C13.7606 11.766 13.735 11.8072 13.6446 11.736C13.5953 11.6971 13.5489 11.6407 13.518 11.5723C13.4884 11.5068 13.484 11.4547 13.484 11.432H15.484ZM13.584 9.766C12.6769 9.766 11.7583 10.0804 10.7003 10.8332L11.8598 12.4628C12.6737 11.8836 13.1952 11.766 13.584 11.766V9.766ZM12.192 11.2379L10.824 8.19586L8.99999 9.01614L10.368 12.0581L12.192 11.2379ZM10.5023 9.41317C11.5297 8.66185 12.869 8.202 14.394 8.202V6.202C12.4631 6.202 10.7064 6.78615 9.3217 7.79883L10.5023 9.41317ZM14.394 8.202C15.4833 8.202 16.2794 8.49376 16.7814 8.89849C17.2658 9.28909 17.534 9.82634 17.534 10.496H19.534C19.534 9.22165 18.9922 8.11191 18.0367 7.34151C17.0987 6.58524 15.8247 6.202 14.394 6.202V8.202ZM17.534 10.496C17.534 11.2433 17.3017 11.8906 16.7956 12.4111C16.2768 12.9447 15.3873 13.4291 13.9272 13.667L14.2488 15.641C15.9927 15.3569 17.3262 14.7343 18.2295 13.8054C19.1454 12.8634 19.534 11.6927 19.534 10.496H17.534ZM13.1571 14.2887L12.5991 15.7107L14.4609 16.4413L15.0189 15.0193L13.1571 14.2887ZM13.53 15.076H11.046V17.076H13.53V15.076ZM9.9949 20.2627L10.8769 17.0227L8.94713 16.4973L8.06513 19.7373L9.9949 20.2627ZM9.91202 17.76H14.088V15.76H9.91202V17.76ZM13.1231 16.4973L12.2411 19.7373L14.1709 20.2627L15.0529 17.0227L13.1231 16.4973ZM13.206 19H9.03002V21H13.206V19Z"
          fill="#DBDBDB"
          mask="url(#path-4-outside-1_2477_1255)"
        />
      </g>
    </svg>
  );
}

export function FeedForMemeFinalist(props: any) {
  return (
    <svg
      {...props}
      width="18"
      height="7"
      viewBox="0 0 18 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.316451 1.89551C0.233685 1.68859 0.401019 1.46801 0.622581 1.49197L5.51168 2.02052C5.56974 2.02679 5.62836 2.01573 5.68013 1.98871L8.86234 0.328437C8.94798 0.28375 9.05007 0.28375 9.13572 0.328437L12.3179 1.98871C12.3697 2.01573 12.4283 2.02679 12.4864 2.02052L17.3755 1.49197C17.597 1.46801 17.7644 1.68859 17.6816 1.89551L16.1654 5.68594C16.1205 5.79813 16.0119 5.8717 15.8911 5.8717H2.10699C1.98616 5.8717 1.8775 5.79813 1.83262 5.68594L0.316451 1.89551Z"
        fill="url(#paint0_linear_2483_1416)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9569 2.00584L16.4408 5.79627C16.351 6.02065 16.1337 6.16778 15.892 6.16778H2.10797C1.8663 6.16778 1.64898 6.02065 1.55923 5.79627L0.0430581 2.00584C-0.122473 1.59201 0.212193 1.15085 0.655318 1.19876L5.54442 1.72731L8.72662 0.0670293C8.89792 -0.0223431 9.10208 -0.0223431 9.27338 0.0670293L12.4556 1.72731L17.3447 1.19876C17.7878 1.15085 18.1225 1.59201 17.9569 2.00584ZM0.623557 1.49255C0.401994 1.4686 0.234661 1.68917 0.317427 1.89609L1.8336 5.68652C1.87848 5.79871 1.98714 5.87228 2.10797 5.87228H15.892C16.0129 5.87228 16.1215 5.79871 16.1664 5.68652L17.6826 1.89609C17.7653 1.68917 17.598 1.4686 17.3764 1.49255L12.4873 2.0211C12.4293 2.02738 12.3707 2.01631 12.3189 1.9893L9.13669 0.329019C9.05104 0.284333 8.94896 0.284333 8.86331 0.329019L5.68111 1.9893C5.62933 2.01631 5.57072 2.02738 5.51266 2.0211L0.623557 1.49255Z"
        fill="black"
      />
      <path
        d="M15.9325 3.47635C15.9325 3.48521 15.9259 3.49319 15.9126 3.50028C15.8993 3.50737 15.8838 3.51092 15.866 3.51092C15.8589 3.51092 15.8492 3.50959 15.8368 3.50693C15.8244 3.50427 15.8173 3.50117 15.8155 3.49762C15.7907 3.40011 15.7317 3.29239 15.6386 3.17449C15.5456 3.05658 15.4582 2.99763 15.3767 2.99763H15.3368C15.296 2.99763 15.2668 3.00605 15.249 3.02289C15.2313 3.03974 15.2224 3.06589 15.2224 3.10135V4.36197C15.2224 4.43289 15.2393 4.4852 15.273 4.51888C15.3067 4.55257 15.3749 4.57473 15.4777 4.58537C15.4831 4.58537 15.4879 4.59291 15.4924 4.60798C15.4968 4.62305 15.499 4.63502 15.499 4.64388C15.499 4.65452 15.4968 4.66693 15.4924 4.68112C15.4879 4.6953 15.4831 4.70239 15.4777 4.70239C15.3926 4.70239 15.3053 4.70018 15.2158 4.69574C15.1262 4.69131 15.0416 4.68909 14.9618 4.68909C14.8802 4.68909 14.7951 4.69131 14.7065 4.69574C14.6178 4.70018 14.5301 4.70239 14.4432 4.70239C14.4379 4.70239 14.433 4.6953 14.4286 4.68112C14.4241 4.66693 14.4219 4.65452 14.4219 4.64388C14.4219 4.63502 14.4241 4.62349 14.4286 4.60931C14.433 4.59512 14.4379 4.58715 14.4432 4.58537C14.5478 4.57296 14.6165 4.5508 14.6493 4.51888C14.6821 4.48697 14.6985 4.43467 14.6985 4.36197V3.10135C14.6985 3.06234 14.6905 3.03531 14.6746 3.02024C14.6586 3.00516 14.6285 2.99763 14.5841 2.99763H14.5629C14.4902 2.99763 14.4006 3.05215 14.2943 3.16119C14.1879 3.27023 14.1125 3.38238 14.0682 3.49762C14.0664 3.50294 14.0598 3.50649 14.0482 3.50826C14.0367 3.51003 14.0274 3.51092 14.0203 3.51092C14.0044 3.51092 13.9888 3.50737 13.9738 3.50028C13.9587 3.49319 13.9512 3.48521 13.9512 3.47635C13.9689 3.38769 13.988 3.2791 14.0084 3.15055C14.0287 3.02201 14.0434 2.91518 14.0522 2.83008C14.1143 2.84072 14.2109 2.84958 14.3421 2.85667C14.4733 2.86377 14.6799 2.86731 14.9618 2.86731C15.2029 2.86731 15.4037 2.86377 15.5642 2.85667C15.7246 2.84958 15.8306 2.84072 15.882 2.83008C15.8873 2.91518 15.8944 3.01625 15.9033 3.13327C15.9121 3.25028 15.9219 3.36465 15.9325 3.47635Z"
        fill="black"
      />
      <path
        d="M13.4131 3.5944C13.5177 3.65646 13.6161 3.73048 13.7083 3.81648C13.8005 3.90247 13.8466 4.01106 13.8466 4.14227C13.8466 4.33021 13.7788 4.47781 13.6431 4.58508C13.5075 4.69235 13.3369 4.74598 13.1312 4.74598C13.0053 4.74598 12.8976 4.7287 12.808 4.69412C12.7185 4.65955 12.6161 4.63162 12.5009 4.61035C12.4991 4.54652 12.4982 4.46141 12.4982 4.35503C12.4982 4.24865 12.4956 4.15468 12.4902 4.07312C12.4902 4.0678 12.4978 4.06293 12.5128 4.05849C12.5279 4.05406 12.5408 4.05184 12.5514 4.05184C12.5638 4.05184 12.5758 4.05362 12.5873 4.05716C12.5988 4.06071 12.6055 4.06603 12.6073 4.07312C12.6409 4.23092 12.7114 4.36124 12.8187 4.46407C12.926 4.56691 13.0301 4.61833 13.1312 4.61833C13.234 4.61833 13.308 4.59572 13.3533 4.55051C13.3985 4.50529 13.4211 4.44368 13.4211 4.36567C13.4211 4.26993 13.375 4.18925 13.2828 4.12365C13.1906 4.05805 13.0913 3.99422 12.9849 3.93216C12.8768 3.87011 12.7766 3.79653 12.6844 3.71142C12.5922 3.62632 12.5461 3.52171 12.5461 3.3976C12.5461 3.23271 12.6086 3.09397 12.7336 2.98138C12.8586 2.86879 13.0301 2.8125 13.2482 2.8125C13.3457 2.8125 13.4299 2.82447 13.5009 2.8484C13.5718 2.87234 13.648 2.89229 13.7296 2.90824C13.7314 2.97207 13.7345 3.05186 13.7389 3.1476C13.7433 3.24334 13.7491 3.32224 13.7562 3.3843C13.7562 3.38962 13.7486 3.3945 13.7336 3.39893C13.7185 3.40336 13.7065 3.40558 13.6977 3.40558C13.6853 3.40558 13.6728 3.4038 13.6604 3.40026C13.648 3.39671 13.64 3.39139 13.6365 3.3843C13.6028 3.246 13.5532 3.13741 13.4876 3.05851C13.422 2.97961 13.3413 2.94016 13.2455 2.94016C13.1622 2.94016 13.0966 2.96232 13.0487 3.00665C13.0009 3.05097 12.9769 3.10682 12.9769 3.1742C12.9769 3.26285 13.0217 3.33864 13.1112 3.40159C13.2008 3.46453 13.3014 3.5288 13.4131 3.5944Z"
        fill="black"
      />
      <path
        d="M12.2158 4.64534C12.2158 4.65775 12.2136 4.6706 12.2091 4.6839C12.2047 4.6972 12.1998 4.70385 12.1945 4.70385C12.1076 4.70385 12.0203 4.70163 11.9325 4.6972C11.8448 4.69277 11.7601 4.69055 11.6786 4.69055C11.597 4.69055 11.5119 4.69277 11.4232 4.6972C11.3346 4.70163 11.2468 4.70385 11.1599 4.70385C11.1546 4.70385 11.1498 4.69675 11.1453 4.68257C11.1409 4.66839 11.1387 4.65598 11.1387 4.64534C11.1387 4.63647 11.1409 4.62495 11.1453 4.61076C11.1498 4.59658 11.1546 4.5886 11.1599 4.58683C11.2646 4.57442 11.3333 4.55225 11.3661 4.52034C11.3989 4.48842 11.4153 4.43612 11.4153 4.36343V3.19589C11.4153 3.1232 11.3989 3.07089 11.3661 3.03898C11.3333 3.00706 11.2646 2.9849 11.1599 2.97249C11.1546 2.97072 11.1498 2.96274 11.1453 2.94855C11.1409 2.93437 11.1387 2.92284 11.1387 2.91398C11.1387 2.90334 11.1409 2.89093 11.1453 2.87675C11.1498 2.86256 11.1546 2.85547 11.1599 2.85547C11.2468 2.85547 11.3346 2.85769 11.4232 2.86212C11.5119 2.86655 11.597 2.86877 11.6786 2.86877C11.7601 2.86877 11.8448 2.86655 11.9325 2.86212C12.0203 2.85769 12.1076 2.85547 12.1945 2.85547C12.1998 2.85547 12.2047 2.86212 12.2091 2.87542C12.2136 2.88871 12.2158 2.90157 12.2158 2.91398C12.2158 2.92284 12.2136 2.93481 12.2091 2.94988C12.2047 2.96495 12.1998 2.97249 12.1945 2.97249C12.0934 2.98313 12.0261 3.00529 11.9924 3.03898C11.9587 3.07266 11.9419 3.12497 11.9419 3.19589V4.36343C11.9419 4.43435 11.9587 4.48665 11.9924 4.52034C12.0261 4.55403 12.0934 4.57619 12.1945 4.58683C12.1998 4.58683 12.2047 4.59436 12.2091 4.60943C12.2136 4.6245 12.2158 4.63647 12.2158 4.64534Z"
        fill="black"
      />
      <path
        d="M11.063 4.01769C11.0506 4.11698 11.0386 4.23843 11.0271 4.38204C11.0156 4.52566 11.0081 4.63293 11.0045 4.70385C10.8928 4.7003 10.7536 4.6972 10.587 4.69454C10.4203 4.69188 10.2847 4.69055 10.18 4.69055C10.0666 4.69055 9.9203 4.69232 9.74123 4.69587C9.56215 4.69941 9.42829 4.70207 9.33964 4.70385C9.33432 4.70385 9.32944 4.6972 9.32501 4.6839C9.32058 4.6706 9.31836 4.65775 9.31836 4.64534C9.31836 4.63647 9.32058 4.62495 9.32501 4.61076C9.32944 4.59658 9.33432 4.5886 9.33964 4.58683C9.44247 4.57442 9.51029 4.55225 9.54309 4.52034C9.57589 4.48842 9.59229 4.43612 9.59229 4.36343V3.19589C9.59229 3.1232 9.57589 3.07089 9.54309 3.03898C9.51029 3.00706 9.44247 2.9849 9.33964 2.97249C9.33432 2.97072 9.32944 2.96274 9.32501 2.94855C9.32058 2.93437 9.31836 2.92284 9.31836 2.91398C9.31836 2.90157 9.32058 2.88871 9.32501 2.87542C9.32944 2.86212 9.33432 2.85547 9.33964 2.85547C9.42474 2.85547 9.51206 2.85769 9.6016 2.86212C9.69114 2.86655 9.7758 2.86877 9.85559 2.86877C9.93715 2.86877 10.0223 2.86655 10.1109 2.86212C10.1996 2.85769 10.2873 2.85547 10.3742 2.85547C10.3795 2.85547 10.3844 2.86256 10.3888 2.87675C10.3933 2.89093 10.3955 2.90334 10.3955 2.91398C10.3955 2.92284 10.3933 2.93481 10.3888 2.94988C10.3844 2.96495 10.3795 2.97249 10.3742 2.97249C10.2714 2.98313 10.2031 3.00529 10.1694 3.03898C10.1357 3.07266 10.1189 3.12497 10.1189 3.19589V4.40332C10.1189 4.46715 10.1362 4.50926 10.1707 4.52965C10.2053 4.55004 10.2403 4.56023 10.2758 4.56023H10.4274C10.5515 4.56023 10.6619 4.50172 10.7585 4.3847C10.8551 4.26768 10.9167 4.13648 10.9433 3.99109C10.9433 3.98754 10.9464 3.98489 10.9526 3.98311C10.9589 3.98134 10.9682 3.98045 10.9806 3.98045C11.0001 3.98045 11.0191 3.984 11.0377 3.99109C11.0564 3.99818 11.0648 4.00705 11.063 4.01769Z"
        fill="black"
      />
      <path
        d="M9.29157 4.64492C9.29157 4.65556 9.28935 4.66797 9.28492 4.68215C9.28049 4.69634 9.27561 4.70343 9.27029 4.70343C9.18519 4.70343 9.09919 4.70121 9.01232 4.69678C8.92544 4.69235 8.84565 4.69013 8.77296 4.69013C8.6914 4.69013 8.60408 4.69235 8.51099 4.69678C8.41791 4.70121 8.32793 4.70343 8.24105 4.70343C8.23573 4.70343 8.23086 4.69678 8.22642 4.68348C8.22199 4.67019 8.21977 4.65733 8.21977 4.64492C8.21977 4.63606 8.2211 4.62453 8.22376 4.61035C8.22642 4.59616 8.23041 4.58818 8.23573 4.58641C8.32084 4.58109 8.37713 4.57001 8.40461 4.55317C8.43209 4.53632 8.44583 4.51017 8.44583 4.47471C8.44583 4.46053 8.44273 4.4428 8.43653 4.42152C8.43032 4.40024 8.42367 4.38074 8.41658 4.36301L8.34477 4.17684H7.78627L7.72244 4.3311C7.7118 4.35592 7.70338 4.37941 7.69718 4.40157C7.69097 4.42374 7.68787 4.4428 7.68787 4.45875C7.68787 4.49599 7.69806 4.52568 7.71845 4.54785C7.73884 4.57001 7.79514 4.58286 7.88733 4.58641C7.89265 4.58641 7.8962 4.59395 7.89797 4.60902C7.89974 4.62409 7.90063 4.63606 7.90063 4.64492C7.90063 4.65733 7.89841 4.67019 7.89398 4.68348C7.88955 4.69678 7.88467 4.70343 7.87935 4.70343C7.80311 4.70343 7.74372 4.70121 7.70116 4.69678C7.65861 4.69235 7.60188 4.69013 7.53095 4.69013C7.47244 4.69013 7.42103 4.69235 7.3767 4.69678C7.33238 4.70121 7.28007 4.70343 7.21979 4.70343C7.21447 4.70343 7.21004 4.6959 7.20649 4.68082C7.20294 4.66575 7.20117 4.65379 7.20117 4.64492C7.20117 4.63606 7.20516 4.62453 7.21314 4.61035C7.22112 4.59616 7.22777 4.58818 7.23309 4.58641C7.30933 4.57932 7.36872 4.55627 7.41128 4.51726C7.45383 4.47826 7.49727 4.41265 7.54159 4.32046L8.20116 2.83378C8.20293 2.82846 8.21268 2.82358 8.23041 2.81915C8.24814 2.81472 8.26499 2.8125 8.28094 2.8125C8.2969 2.8125 8.31374 2.81472 8.33148 2.81915C8.34921 2.82358 8.35896 2.82846 8.36073 2.83378L8.95115 4.32046C8.98306 4.40911 9.02118 4.47338 9.06551 4.51327C9.10983 4.55317 9.17632 4.57755 9.26497 4.58641C9.27029 4.58641 9.27605 4.59395 9.28226 4.60902C9.28846 4.62409 9.29157 4.63606 9.29157 4.64492ZM8.29424 4.04918L8.07084 3.46409L7.8368 4.04918H8.29424Z"
        fill="black"
      />
      <path
        d="M7.33395 2.91398C7.33395 2.92284 7.33174 2.93481 7.3273 2.94988C7.32287 2.96495 7.318 2.97249 7.31268 2.97249C7.21339 2.98313 7.1438 3.00485 7.1039 3.03765C7.06401 3.07045 7.04318 3.1232 7.0414 3.19589L7.01215 4.71448C7.01215 4.7198 7.00639 4.72557 6.99486 4.73177C6.98334 4.73798 6.96428 4.74108 6.93768 4.74108C6.91818 4.74108 6.90133 4.73975 6.88715 4.73709C6.87297 4.73443 6.86233 4.72867 6.85524 4.7198L5.5627 3.41397L5.54674 4.36343C5.5432 4.43257 5.56181 4.48443 5.60259 4.51901C5.64337 4.55358 5.71518 4.57619 5.81802 4.58683C5.82334 4.58683 5.82821 4.59348 5.83264 4.60677C5.83708 4.62007 5.83929 4.63293 5.83929 4.64534C5.83929 4.65597 5.83708 4.66839 5.83264 4.68257C5.82821 4.69675 5.82334 4.70385 5.81802 4.70385C5.75064 4.70385 5.68859 4.70163 5.63185 4.6972C5.57511 4.69277 5.51572 4.69055 5.45366 4.69055C5.38983 4.69055 5.33088 4.69277 5.2768 4.6972C5.22272 4.70163 5.16554 4.70385 5.10526 4.70385C5.09994 4.70385 5.09507 4.69675 5.09063 4.68257C5.0862 4.66839 5.08398 4.65597 5.08398 4.64534C5.08398 4.63293 5.08664 4.62051 5.09196 4.6081C5.09728 4.59569 5.1026 4.5886 5.10792 4.58683C5.20898 4.57619 5.27902 4.55403 5.31802 4.52034C5.35703 4.48665 5.37653 4.43435 5.37653 4.36343L5.41909 3.28099C5.42086 3.18525 5.40136 3.113 5.36058 3.06424C5.3198 3.01548 5.24267 2.9849 5.1292 2.97249C5.12388 2.97072 5.11944 2.96274 5.1159 2.94855C5.11235 2.93437 5.11058 2.92284 5.11058 2.91398C5.11058 2.90157 5.1128 2.88871 5.11723 2.87542C5.12166 2.86212 5.12654 2.85547 5.13186 2.85547C5.17441 2.85547 5.22494 2.85769 5.28345 2.86212C5.34196 2.86655 5.38983 2.86877 5.42706 2.86877C5.47494 2.86877 5.52015 2.86655 5.5627 2.86212C5.60525 2.85769 5.66022 2.85547 5.72759 2.85547L6.88183 4.05758V3.19589C6.88183 3.1232 6.86055 3.07089 6.818 3.03898C6.77545 3.00706 6.70276 2.9849 6.59992 2.97249C6.5946 2.97072 6.58973 2.96362 6.58529 2.95121C6.58086 2.9388 6.57864 2.92639 6.57864 2.91398C6.57864 2.90334 6.58086 2.89093 6.58529 2.87675C6.58973 2.86256 6.5946 2.85547 6.59992 2.85547C6.66907 2.85547 6.72802 2.85813 6.77678 2.86345C6.82554 2.86877 6.88094 2.87143 6.943 2.87143C7.00683 2.87143 7.06977 2.86877 7.13183 2.86345C7.19388 2.85813 7.25417 2.85547 7.31268 2.85547C7.318 2.85547 7.32287 2.86212 7.3273 2.87542C7.33174 2.88871 7.33395 2.90157 7.33395 2.91398Z"
        fill="black"
      />
      <path
        d="M4.9736 4.64534C4.9736 4.65775 4.97138 4.6706 4.96695 4.6839C4.96252 4.6972 4.95764 4.70385 4.95232 4.70385C4.86544 4.70385 4.77812 4.70163 4.69036 4.6972C4.60259 4.69277 4.51793 4.69055 4.43637 4.69055C4.35481 4.69055 4.26971 4.69277 4.18105 4.6972C4.0924 4.70163 4.00464 4.70385 3.91776 4.70385C3.91244 4.70385 3.90757 4.69675 3.90313 4.68257C3.8987 4.66839 3.89648 4.65598 3.89648 4.64534C3.89648 4.63647 3.8987 4.62495 3.90313 4.61076C3.90757 4.59658 3.91244 4.5886 3.91776 4.58683C4.02237 4.57442 4.09107 4.55225 4.12387 4.52034C4.15668 4.48842 4.17308 4.43612 4.17308 4.36343V3.19589C4.17308 3.1232 4.15668 3.07089 4.12387 3.03898C4.09107 3.00706 4.02237 2.9849 3.91776 2.97249C3.91244 2.97072 3.90757 2.96274 3.90313 2.94855C3.8987 2.93437 3.89648 2.92284 3.89648 2.91398C3.89648 2.90334 3.8987 2.89093 3.90313 2.87675C3.90757 2.86256 3.91244 2.85547 3.91776 2.85547C4.00464 2.85547 4.0924 2.85769 4.18105 2.86212C4.26971 2.86655 4.35481 2.86877 4.43637 2.86877C4.51793 2.86877 4.60259 2.86655 4.69036 2.86212C4.77812 2.85769 4.86544 2.85547 4.95232 2.85547C4.95764 2.85547 4.96252 2.86212 4.96695 2.87542C4.97138 2.88871 4.9736 2.90157 4.9736 2.91398C4.9736 2.92284 4.97138 2.93481 4.96695 2.94988C4.96252 2.96495 4.95764 2.97249 4.95232 2.97249C4.85126 2.98313 4.78388 3.00529 4.7502 3.03898C4.71651 3.07266 4.69966 3.12497 4.69966 3.19589V4.36343C4.69966 4.43435 4.71651 4.48665 4.7502 4.52034C4.78388 4.55403 4.85126 4.57619 4.95232 4.58683C4.95764 4.58683 4.96252 4.59436 4.96695 4.60943C4.97138 4.6245 4.9736 4.63647 4.9736 4.64534Z"
        fill="black"
      />
      <path
        d="M3.76668 3.46982C3.76668 3.47691 3.7587 3.48445 3.74274 3.49243C3.72679 3.50041 3.71083 3.5044 3.69487 3.5044C3.68778 3.5044 3.67847 3.50262 3.66695 3.49908C3.65542 3.49553 3.64966 3.49198 3.64966 3.48844C3.6337 3.36965 3.5845 3.25839 3.50206 3.15467C3.41961 3.05094 3.30038 2.99908 3.14435 2.99908H2.98478C2.94754 2.99908 2.91208 3.00795 2.8784 3.02568C2.84471 3.04341 2.82786 3.08685 2.82786 3.156V3.71716H2.96084C3.05127 3.71716 3.12307 3.69056 3.17626 3.63737C3.22945 3.58418 3.26137 3.51415 3.27201 3.42727C3.27201 3.42195 3.27866 3.41707 3.29195 3.41264C3.30525 3.40821 3.31811 3.40599 3.33052 3.40599C3.34293 3.40599 3.35578 3.40821 3.36908 3.41264C3.38238 3.41707 3.38903 3.42195 3.38903 3.42727C3.38903 3.49287 3.38637 3.55404 3.38105 3.61078C3.37573 3.66751 3.37307 3.72602 3.37307 3.78631C3.37307 3.84836 3.37573 3.90643 3.38105 3.96051C3.38637 4.01458 3.38903 4.07354 3.38903 4.13737C3.38903 4.14268 3.38238 4.14756 3.36908 4.15199C3.35578 4.15643 3.34293 4.15864 3.33052 4.15864C3.31811 4.15864 3.30525 4.15643 3.29195 4.15199C3.27866 4.14756 3.27201 4.14268 3.27201 4.13737C3.2596 4.04517 3.22901 3.9738 3.18025 3.92327C3.13149 3.87274 3.05836 3.84748 2.96084 3.84748H2.82786V4.36343C2.82786 4.43435 2.84825 4.48665 2.88903 4.52034C2.92981 4.55403 3.00162 4.57619 3.10446 4.58683C3.10978 4.58683 3.11465 4.59436 3.11908 4.60943C3.12352 4.6245 3.12573 4.63647 3.12573 4.64534C3.12573 4.65598 3.12352 4.66839 3.11908 4.68257C3.11465 4.69675 3.10978 4.70385 3.10446 4.70385C3.01758 4.70385 2.92627 4.70163 2.83052 4.6972C2.73478 4.69277 2.64613 4.69055 2.56457 4.69055C2.48301 4.69055 2.39835 4.69277 2.31058 4.6972C2.22282 4.70163 2.1355 4.70385 2.04862 4.70385C2.0433 4.70385 2.03843 4.6972 2.03399 4.6839C2.02956 4.6706 2.02734 4.65775 2.02734 4.64534C2.02734 4.63647 2.02956 4.62495 2.03399 4.61076C2.03843 4.59658 2.0433 4.5886 2.04862 4.58683C2.15146 4.57442 2.21927 4.55225 2.25207 4.52034C2.28488 4.48842 2.30128 4.43612 2.30128 4.36343V3.19589C2.30128 3.1232 2.28488 3.07089 2.25207 3.03898C2.21927 3.00706 2.15146 2.9849 2.04862 2.97249C2.0433 2.97072 2.03843 2.96274 2.03399 2.94855C2.02956 2.93437 2.02734 2.92284 2.02734 2.91398C2.02734 2.90157 2.02956 2.88871 2.03399 2.87542C2.03843 2.86212 2.0433 2.85547 2.04862 2.85547C2.14436 2.85724 2.28089 2.8599 2.45819 2.86345C2.63549 2.86699 2.78088 2.86877 2.89435 2.86877C2.99541 2.86877 3.1346 2.86744 3.3119 2.86478C3.4892 2.86212 3.63193 2.85901 3.74009 2.85547C3.74009 2.93171 3.74319 3.03233 3.74939 3.15733C3.7556 3.28232 3.76136 3.38649 3.76668 3.46982Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2483_1416"
          x1="8.99902"
          y1="1.73464"
          x2="8.99902"
          y2="5.8717"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFEB33" />
          <stop offset="1" stopColor="#C6FC2D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CountdownRightBottomBg(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownRightBottomBg.png"
      alt=""
    />
  );
}
export function CountdownRightBottomMobileBg(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownRightBottomMobileBg.png"
      alt=""
    />
  );
}

export function CountdownLeftBg(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownLeftBg.png"
      alt=""
    />
  );
}

export function CountdownLeftMobileBg(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownLeftMobileBg.png"
      alt=""
    />
  );
}

export function CountdownTitle(props: any) {
  return (
    <svg
      {...props}
      width="360"
      height="20"
      viewBox="0 0 360 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="path-1-outside-1_2142_6472"
        maskUnits="userSpaceOnUse"
        x="-2"
        y="-2"
        width="364"
        height="24"
        fill="black"
      >
        <rect fill="white" x="-2" y="-2" width="364" height="24" />
        <path d="M8.89652 19.39C3.80052 19.39 0.264523 16.296 0.264523 11.408C0.264523 6.442 4.08652 0.409999 11.9385 0.409999C15.8645 0.409999 18.6465 2.49 19.4005 5.714L13.9665 8.08C13.5765 6.598 12.5105 5.87 11.1325 5.87C8.40252 5.87 6.63452 8.366 6.63452 10.862C6.63452 12.864 7.88252 13.982 9.49452 13.982C10.8985 13.982 12.0425 13.306 13.0305 12.084L17.2425 15.412C15.4225 17.804 12.7705 19.39 8.89652 19.39ZM31.4072 19.364C26.0512 19.364 22.3592 15.776 22.3592 11.122C22.3592 5.48 26.9612 0.435999 33.0712 0.435999C38.4272 0.435999 42.1192 4.024 42.1192 8.678C42.1192 14.32 37.5172 19.364 31.4072 19.364ZM31.8232 14.008C34.3712 14.008 36.0092 11.512 36.0092 9.224C36.0092 7.3 34.8392 5.792 32.6552 5.792C30.1072 5.792 28.4692 8.288 28.4692 10.576C28.4692 12.5 29.6392 14.008 31.8232 14.008ZM54.2852 19.364C49.1632 19.364 46.4072 16.92 46.4072 12.812C46.4072 11.876 46.5372 10.862 46.7972 9.874L49.2412 0.799999H55.4292L52.8812 10.264C52.7512 10.784 52.6732 11.278 52.6732 11.694C52.6732 13.202 53.5572 13.982 55.1692 13.982C55.9232 13.982 56.6252 13.722 57.1192 13.228C57.6652 12.682 58.0292 11.98 58.4192 10.576L61.0452 0.799999H67.2332L64.3472 11.512C63.6972 13.93 62.7612 15.698 61.4872 16.972C59.7712 18.688 57.1712 19.364 54.2852 19.364ZM67.5416 19L72.4296 0.799999H78.1236L82.2576 9.484L84.5976 0.799999H90.6296L85.7416 19H80.3336L76.0176 9.952L73.5736 19H67.5416ZM95.7611 19L99.2711 5.948H93.9151L95.2931 0.799999H112.089L110.711 5.948H105.355L101.845 19H95.7611ZM111.905 19L116.793 0.799999H123.241C126.777 0.799999 128.987 1.762 130.365 3.14C131.717 4.492 132.341 6.26 132.341 8.47C132.341 11.2 131.301 13.696 129.351 15.646C127.167 17.83 124.021 19 119.809 19H111.905ZM119.419 13.696H120.485C122.331 13.696 123.917 13.15 124.853 12.214C125.607 11.46 126.153 10.238 126.153 9.12C126.153 8.132 125.867 7.482 125.399 7.014C124.827 6.442 123.917 6.104 122.461 6.104H121.447L119.419 13.696ZM145.63 19.364C140.274 19.364 136.582 15.776 136.582 11.122C136.582 5.48 141.184 0.435999 147.294 0.435999C152.65 0.435999 156.342 4.024 156.342 8.678C156.342 14.32 151.74 19.364 145.63 19.364ZM146.046 14.008C148.594 14.008 150.232 11.512 150.232 9.224C150.232 7.3 149.062 5.792 146.878 5.792C144.33 5.792 142.692 8.288 142.692 10.576C142.692 12.5 143.862 14.008 146.046 14.008ZM161.99 19.13L160.95 0.799999H167.19L167.424 9.536L172.702 0.747999H177.954L178.552 9.536L183.466 0.799999H189.862L178.994 19.13H173.69L172.91 10.082L167.294 19.13H161.99ZM189.178 19L194.066 0.799999H199.76L203.894 9.484L206.234 0.799999H212.266L207.378 19H201.97L197.654 9.952L195.21 19H189.178ZM227.379 19L230.889 5.948H225.533L226.911 0.799999H243.707L242.329 5.948H236.973L233.463 19H227.379ZM254.469 19.364C249.113 19.364 245.421 15.776 245.421 11.122C245.421 5.48 250.023 0.435999 256.133 0.435999C261.489 0.435999 265.181 4.024 265.181 8.678C265.181 14.32 260.579 19.364 254.469 19.364ZM254.885 14.008C257.433 14.008 259.071 11.512 259.071 9.224C259.071 7.3 257.901 5.792 255.717 5.792C253.169 5.792 251.531 8.288 251.531 10.576C251.531 12.5 252.701 14.008 254.885 14.008ZM277.552 19L282.44 0.799999H297.676L296.272 6H287.12L286.496 8.314H294.998L293.724 13.046H285.222L283.636 19H277.552ZM297.589 19L302.477 0.799999H317.999L316.647 5.792H307.105L306.611 7.638H315.503L314.333 12.032H305.441L304.895 14.008H314.567L313.241 19H297.589ZM318.463 19L323.351 0.799999H338.873L337.521 5.792H327.979L327.485 7.638H336.377L335.207 12.032H326.315L325.769 14.008H335.441L334.115 19H318.463ZM339.337 19L344.225 0.799999H350.673C354.209 0.799999 356.419 1.762 357.797 3.14C359.149 4.492 359.773 6.26 359.773 8.47C359.773 11.2 358.733 13.696 356.783 15.646C354.599 17.83 351.453 19 347.241 19H339.337ZM346.851 13.696H347.917C349.763 13.696 351.349 13.15 352.285 12.214C353.039 11.46 353.585 10.238 353.585 9.12C353.585 8.132 353.299 7.482 352.831 7.014C352.259 6.442 351.349 6.104 349.893 6.104H348.879L346.851 13.696Z" />
      </mask>
      <path
        d="M8.89652 19.39C3.80052 19.39 0.264523 16.296 0.264523 11.408C0.264523 6.442 4.08652 0.409999 11.9385 0.409999C15.8645 0.409999 18.6465 2.49 19.4005 5.714L13.9665 8.08C13.5765 6.598 12.5105 5.87 11.1325 5.87C8.40252 5.87 6.63452 8.366 6.63452 10.862C6.63452 12.864 7.88252 13.982 9.49452 13.982C10.8985 13.982 12.0425 13.306 13.0305 12.084L17.2425 15.412C15.4225 17.804 12.7705 19.39 8.89652 19.39ZM31.4072 19.364C26.0512 19.364 22.3592 15.776 22.3592 11.122C22.3592 5.48 26.9612 0.435999 33.0712 0.435999C38.4272 0.435999 42.1192 4.024 42.1192 8.678C42.1192 14.32 37.5172 19.364 31.4072 19.364ZM31.8232 14.008C34.3712 14.008 36.0092 11.512 36.0092 9.224C36.0092 7.3 34.8392 5.792 32.6552 5.792C30.1072 5.792 28.4692 8.288 28.4692 10.576C28.4692 12.5 29.6392 14.008 31.8232 14.008ZM54.2852 19.364C49.1632 19.364 46.4072 16.92 46.4072 12.812C46.4072 11.876 46.5372 10.862 46.7972 9.874L49.2412 0.799999H55.4292L52.8812 10.264C52.7512 10.784 52.6732 11.278 52.6732 11.694C52.6732 13.202 53.5572 13.982 55.1692 13.982C55.9232 13.982 56.6252 13.722 57.1192 13.228C57.6652 12.682 58.0292 11.98 58.4192 10.576L61.0452 0.799999H67.2332L64.3472 11.512C63.6972 13.93 62.7612 15.698 61.4872 16.972C59.7712 18.688 57.1712 19.364 54.2852 19.364ZM67.5416 19L72.4296 0.799999H78.1236L82.2576 9.484L84.5976 0.799999H90.6296L85.7416 19H80.3336L76.0176 9.952L73.5736 19H67.5416ZM95.7611 19L99.2711 5.948H93.9151L95.2931 0.799999H112.089L110.711 5.948H105.355L101.845 19H95.7611ZM111.905 19L116.793 0.799999H123.241C126.777 0.799999 128.987 1.762 130.365 3.14C131.717 4.492 132.341 6.26 132.341 8.47C132.341 11.2 131.301 13.696 129.351 15.646C127.167 17.83 124.021 19 119.809 19H111.905ZM119.419 13.696H120.485C122.331 13.696 123.917 13.15 124.853 12.214C125.607 11.46 126.153 10.238 126.153 9.12C126.153 8.132 125.867 7.482 125.399 7.014C124.827 6.442 123.917 6.104 122.461 6.104H121.447L119.419 13.696ZM145.63 19.364C140.274 19.364 136.582 15.776 136.582 11.122C136.582 5.48 141.184 0.435999 147.294 0.435999C152.65 0.435999 156.342 4.024 156.342 8.678C156.342 14.32 151.74 19.364 145.63 19.364ZM146.046 14.008C148.594 14.008 150.232 11.512 150.232 9.224C150.232 7.3 149.062 5.792 146.878 5.792C144.33 5.792 142.692 8.288 142.692 10.576C142.692 12.5 143.862 14.008 146.046 14.008ZM161.99 19.13L160.95 0.799999H167.19L167.424 9.536L172.702 0.747999H177.954L178.552 9.536L183.466 0.799999H189.862L178.994 19.13H173.69L172.91 10.082L167.294 19.13H161.99ZM189.178 19L194.066 0.799999H199.76L203.894 9.484L206.234 0.799999H212.266L207.378 19H201.97L197.654 9.952L195.21 19H189.178ZM227.379 19L230.889 5.948H225.533L226.911 0.799999H243.707L242.329 5.948H236.973L233.463 19H227.379ZM254.469 19.364C249.113 19.364 245.421 15.776 245.421 11.122C245.421 5.48 250.023 0.435999 256.133 0.435999C261.489 0.435999 265.181 4.024 265.181 8.678C265.181 14.32 260.579 19.364 254.469 19.364ZM254.885 14.008C257.433 14.008 259.071 11.512 259.071 9.224C259.071 7.3 257.901 5.792 255.717 5.792C253.169 5.792 251.531 8.288 251.531 10.576C251.531 12.5 252.701 14.008 254.885 14.008ZM277.552 19L282.44 0.799999H297.676L296.272 6H287.12L286.496 8.314H294.998L293.724 13.046H285.222L283.636 19H277.552ZM297.589 19L302.477 0.799999H317.999L316.647 5.792H307.105L306.611 7.638H315.503L314.333 12.032H305.441L304.895 14.008H314.567L313.241 19H297.589ZM318.463 19L323.351 0.799999H338.873L337.521 5.792H327.979L327.485 7.638H336.377L335.207 12.032H326.315L325.769 14.008H335.441L334.115 19H318.463ZM339.337 19L344.225 0.799999H350.673C354.209 0.799999 356.419 1.762 357.797 3.14C359.149 4.492 359.773 6.26 359.773 8.47C359.773 11.2 358.733 13.696 356.783 15.646C354.599 17.83 351.453 19 347.241 19H339.337ZM346.851 13.696H347.917C349.763 13.696 351.349 13.15 352.285 12.214C353.039 11.46 353.585 10.238 353.585 9.12C353.585 8.132 353.299 7.482 352.831 7.014C352.259 6.442 351.349 6.104 349.893 6.104H348.879L346.851 13.696Z"
        fill="white"
      />
      <path
        d="M19.4005 5.714L20.1989 7.54772C21.0844 7.16218 21.5679 6.19895 21.348 5.25855L19.4005 5.714ZM13.9665 8.08L12.0324 8.58899C12.1809 9.15354 12.5688 9.625 13.0941 9.87967C13.6194 10.1343 14.2297 10.1468 14.7649 9.91372L13.9665 8.08ZM13.0305 12.084L14.2704 10.5147C13.4106 9.83537 12.1642 9.97442 11.4753 10.8266L13.0305 12.084ZM17.2425 15.412L18.8342 16.623C19.4944 15.7553 19.3379 14.5187 18.4824 13.8427L17.2425 15.412ZM8.89652 17.39C6.74845 17.39 5.10196 16.7417 4.01581 15.753C2.94925 14.7821 2.26452 13.3426 2.26452 11.408H-1.73548C-1.73548 14.3614 -0.652205 16.9129 1.32323 18.711C3.27908 20.4913 5.9486 21.39 8.89652 21.39V17.39ZM2.26452 11.408C2.26452 7.36472 5.36457 2.41 11.9385 2.41V-1.59C2.80848 -1.59 -1.73548 5.51928 -1.73548 11.408H2.26452ZM11.9385 2.41C15.0964 2.41 16.9452 3.99803 17.4531 6.16945L21.348 5.25855C20.3478 0.981966 16.6327 -1.59 11.9385 -1.59V2.41ZM18.6021 3.88028L13.1681 6.24628L14.7649 9.91372L20.1989 7.54772L18.6021 3.88028ZM15.9007 7.57101C15.609 6.46273 15.0218 5.49858 14.1234 4.82181C13.2312 4.14964 12.1771 3.87 11.1325 3.87V7.87C11.466 7.87 11.6339 7.95436 11.7166 8.01669C11.7932 8.07442 11.934 8.21527 12.0324 8.58899L15.9007 7.57101ZM11.1325 3.87C6.979 3.87 4.63452 7.60997 4.63452 10.862H8.63452C8.63452 9.12202 9.82604 7.87 11.1325 7.87V3.87ZM4.63452 10.862C4.63452 12.2861 5.08675 13.5979 6.02396 14.5648C6.96011 15.5305 8.21707 15.982 9.49452 15.982V11.982C9.15998 11.982 8.98694 11.8745 8.89609 11.7807C8.80629 11.6881 8.63452 11.4399 8.63452 10.862H4.63452ZM9.49452 15.982C11.6618 15.982 13.3311 14.8933 14.5858 13.3414L11.4753 10.8266C10.754 11.7187 10.1352 11.982 9.49452 11.982V15.982ZM11.7906 13.6533L16.0026 16.9813L18.4824 13.8427L14.2704 10.5147L11.7906 13.6533ZM15.6509 14.201C14.1942 16.1154 12.1217 17.39 8.89652 17.39V21.39C13.4193 21.39 16.6508 19.4926 18.8342 16.623L15.6509 14.201ZM31.4072 17.364C27.0136 17.364 24.3592 14.5344 24.3592 11.122H20.3592C20.3592 17.0176 25.0888 21.364 31.4072 21.364V17.364ZM24.3592 11.122C24.3592 6.5337 28.116 2.436 33.0712 2.436V-1.564C25.8065 -1.564 20.3592 4.4263 20.3592 11.122H24.3592ZM33.0712 2.436C37.4648 2.436 40.1192 5.26556 40.1192 8.678H44.1192C44.1192 2.78243 39.3896 -1.564 33.0712 -1.564V2.436ZM40.1192 8.678C40.1192 13.2663 36.3625 17.364 31.4072 17.364V21.364C38.672 21.364 44.1192 15.3737 44.1192 8.678H40.1192ZM31.8232 16.008C33.81 16.008 35.3969 15.0191 36.4335 13.7234C37.4496 12.4532 38.0092 10.815 38.0092 9.224H34.0092C34.0092 9.921 33.7499 10.6748 33.31 11.2246C32.8906 11.7489 32.3845 12.008 31.8232 12.008V16.008ZM38.0092 9.224C38.0092 7.86611 37.5937 6.49226 36.6262 5.43575C35.6351 4.3535 34.235 3.792 32.6552 3.792V7.792C33.2595 7.792 33.5364 7.9845 33.6763 8.13725C33.8398 8.31574 34.0092 8.65789 34.0092 9.224H38.0092ZM32.6552 3.792C30.6685 3.792 29.0816 4.78087 28.045 6.07661C27.0289 7.34678 26.4692 8.985 26.4692 10.576H30.4692C30.4692 9.87899 30.7286 9.12522 31.1685 8.57539C31.5879 8.05113 32.094 7.792 32.6552 7.792V3.792ZM26.4692 10.576C26.4692 11.9339 26.8848 13.3077 27.8523 14.3642C28.8434 15.4465 30.2435 16.008 31.8232 16.008V12.008C31.219 12.008 30.9421 11.8155 30.8022 11.6628C30.6387 11.4843 30.4692 11.1421 30.4692 10.576H26.4692ZM46.7972 9.874L44.866 9.35385L44.8631 9.36501L46.7972 9.874ZM49.2412 0.799999V-1.2C48.337 -1.2 47.5452 -0.593277 47.31 0.279853L49.2412 0.799999ZM55.4292 0.799999L57.3604 1.31995C57.5222 0.71914 57.3951 0.0772748 57.0166 -0.416575C56.6382 -0.910426 56.0514 -1.2 55.4292 -1.2V0.799999ZM52.8812 10.264L50.95 9.74405C50.9469 9.75565 50.9438 9.76728 50.9409 9.77893L52.8812 10.264ZM57.1192 13.228L55.705 11.8138V11.8138L57.1192 13.228ZM58.4192 10.576L60.3462 11.1113C60.3478 11.1058 60.3493 11.1003 60.3507 11.0948L58.4192 10.576ZM61.0452 0.799999V-1.2C60.1405 -1.2 59.3484 -0.592617 59.1137 0.281157L61.0452 0.799999ZM67.2332 0.799999L69.1644 1.32028C69.3262 0.719445 69.1992 0.0774946 68.8208 -0.416438C68.4423 -0.910369 67.8555 -1.2 67.2332 -1.2V0.799999ZM64.3472 11.512L62.4161 10.9917L62.4158 10.9928L64.3472 11.512ZM61.4872 16.972L60.073 15.5578L61.4872 16.972ZM54.2852 17.364C52.0133 17.364 50.5662 16.8198 49.7172 16.1016C48.9172 15.4248 48.4072 14.3913 48.4072 12.812H44.4072C44.4072 15.3407 45.2752 17.5832 47.1337 19.1554C48.9432 20.6862 51.4351 21.364 54.2852 21.364V17.364ZM48.4072 12.812C48.4072 12.0536 48.5136 11.2105 48.7314 10.383L44.8631 9.36501C44.5608 10.5135 44.4072 11.6984 44.4072 12.812H48.4072ZM48.7284 10.3941L51.1724 1.32014L47.31 0.279853L44.866 9.35385L48.7284 10.3941ZM49.2412 2.8H55.4292V-1.2H49.2412V2.8ZM53.498 0.280052L50.95 9.74405L54.8124 10.7839L57.3604 1.31995L53.498 0.280052ZM50.9409 9.77893C50.7893 10.3855 50.6732 11.054 50.6732 11.694H54.6732C54.6732 11.502 54.7132 11.1824 54.8215 10.7491L50.9409 9.77893ZM50.6732 11.694C50.6732 12.8428 51.0216 14.0213 51.9725 14.8844C52.8903 15.7175 54.0702 15.982 55.1692 15.982V11.982C54.6563 11.982 54.5881 11.8565 54.6609 11.9226C54.6968 11.9552 54.7095 11.9861 54.7068 11.979C54.7006 11.9628 54.6732 11.879 54.6732 11.694H50.6732ZM55.1692 15.982C56.3717 15.982 57.6101 15.5655 58.5334 14.6422L55.705 11.8138C55.6403 11.8785 55.4748 11.982 55.1692 11.982V15.982ZM58.5334 14.6422C59.4381 13.7375 59.9202 12.6449 60.3462 11.1113L56.4922 10.0407C56.1382 11.3151 55.8923 11.6265 55.705 11.8138L58.5334 14.6422ZM60.3507 11.0948L62.9767 1.31884L59.1137 0.281157L56.4877 10.0572L60.3507 11.0948ZM61.0452 2.8H67.2332V-1.2H61.0452V2.8ZM65.3021 0.279716L62.4161 10.9917L66.2784 12.0323L69.1644 1.32028L65.3021 0.279716ZM62.4158 10.9928C61.8256 13.1881 61.0262 14.6046 60.073 15.5578L62.9014 18.3862C64.4962 16.7914 65.5688 14.6719 66.2786 12.0312L62.4158 10.9928ZM60.073 15.5578C58.8946 16.7362 56.9262 17.364 54.2852 17.364V21.364C57.4163 21.364 60.6479 20.6398 62.9014 18.3862L60.073 15.5578ZM67.5415 19L65.61 18.4812C65.4487 19.0819 65.576 19.7235 65.9545 20.2171C66.333 20.7106 66.9196 21 67.5415 21V19ZM72.4296 0.799999V-1.2C71.5248 -1.2 70.7327 -0.592575 70.498 0.28124L72.4296 0.799999ZM78.1236 0.799999L79.9294 -0.0596585C79.5978 -0.756255 78.8951 -1.2 78.1236 -1.2V0.799999ZM82.2576 9.484L80.4517 10.3437C80.8117 11.0997 81.6045 11.5515 82.4384 11.4758C83.2723 11.4001 83.9708 10.8129 84.1887 10.0044L82.2576 9.484ZM84.5976 0.799999V-1.2C83.6934 -1.2 82.9017 -0.593387 82.6664 0.279637L84.5976 0.799999ZM90.6296 0.799999L92.5611 1.31876C92.7224 0.718062 92.5951 0.076499 92.2166 -0.417064C91.8381 -0.910626 91.2515 -1.2 90.6296 -1.2V0.799999ZM85.7416 19V21C86.6463 21 87.4384 20.3926 87.6731 19.5188L85.7416 19ZM80.3336 19L78.5284 19.8611C78.8603 20.5569 79.5626 21 80.3336 21V19ZM76.0176 9.952L77.8227 9.09092C77.4624 8.33561 76.6699 7.88446 75.8365 7.96021C75.0031 8.03595 74.305 8.62257 74.0868 9.43046L76.0176 9.952ZM73.5736 19V21C74.4773 21 75.2687 20.394 75.5044 19.5215L73.5736 19ZM69.4731 19.5188L74.3611 1.31876L70.498 0.28124L65.61 18.4812L69.4731 19.5188ZM72.4296 2.8H78.1236V-1.2H72.4296V2.8ZM76.3177 1.65966L80.4517 10.3437L84.0634 8.62434L79.9294 -0.0596585L76.3177 1.65966ZM84.1887 10.0044L86.5287 1.32036L82.6664 0.279637L80.3264 8.96364L84.1887 10.0044ZM84.5976 2.8H90.6296V-1.2H84.5976V2.8ZM88.698 0.28124L83.81 18.4812L87.6731 19.5188L92.5611 1.31876L88.698 0.28124ZM85.7416 17H80.3336V21H85.7416V17ZM82.1387 18.1389L77.8227 9.09092L74.2124 10.8131L78.5284 19.8611L82.1387 18.1389ZM74.0868 9.43046L71.6428 18.4785L75.5044 19.5215L77.9484 10.4735L74.0868 9.43046ZM73.5736 17H67.5415V21H73.5736V17ZM95.7611 19L93.8297 18.4806C93.6682 19.0814 93.7954 19.7231 94.1738 20.2168C94.5523 20.7105 95.139 21 95.7611 21V19ZM99.2711 5.948L101.202 6.46739C101.364 5.86664 101.237 5.22491 100.858 4.7312C100.48 4.23748 99.8932 3.948 99.2711 3.948V5.948ZM93.9151 5.948L91.9831 5.43085C91.8224 6.0314 91.95 6.67255 92.3286 7.16572C92.7071 7.6589 93.2934 7.948 93.9151 7.948V5.948ZM95.2931 0.799999V-1.2C94.3877 -1.2 93.5952 -0.591757 93.3611 0.282852L95.2931 0.799999ZM112.089 0.799999L114.021 1.31715C114.182 0.716598 114.054 0.0754461 113.676 -0.417726C113.297 -0.910898 112.711 -1.2 112.089 -1.2V0.799999ZM110.711 5.948V7.948C111.617 7.948 112.409 7.33976 112.643 6.46515L110.711 5.948ZM105.355 5.948V3.948C104.451 3.948 103.659 4.5551 103.424 5.4286L105.355 5.948ZM101.845 19V21C102.75 21 103.542 20.3929 103.776 19.5194L101.845 19ZM97.6925 19.5194L101.202 6.46739L97.3397 5.4286L93.8297 18.4806L97.6925 19.5194ZM99.2711 3.948H93.9151V7.948H99.2711V3.948ZM95.8471 6.46515L97.2251 1.31715L93.3611 0.282852L91.9831 5.43085L95.8471 6.46515ZM95.2931 2.8H112.089V-1.2H95.2931V2.8ZM110.157 0.282852L108.779 5.43085L112.643 6.46515L114.021 1.31715L110.157 0.282852ZM110.711 3.948H105.355V7.948H110.711V3.948ZM103.424 5.4286L99.9137 18.4806L103.776 19.5194L107.286 6.46739L103.424 5.4286ZM101.845 17H95.7611V21H101.845V17ZM111.905 19L109.974 18.4812C109.812 19.0819 109.94 19.7235 110.318 20.2171C110.697 20.7106 111.283 21 111.905 21V19ZM116.793 0.799999V-1.2C115.888 -1.2 115.096 -0.592575 114.862 0.28124L116.793 0.799999ZM130.365 3.14L128.951 4.55421V4.55421L130.365 3.14ZM129.351 15.646L130.765 17.0602L129.351 15.646ZM119.419 13.696L117.487 13.1799C117.326 13.7803 117.454 14.4212 117.833 14.9141C118.211 15.4071 118.798 15.696 119.419 15.696V13.696ZM124.853 12.214L126.267 13.6282V13.6282L124.853 12.214ZM125.399 7.014L126.813 5.59979V5.59978L125.399 7.014ZM121.447 6.104V4.104C120.541 4.104 119.749 4.71275 119.515 5.58785L121.447 6.104ZM113.837 19.5188L118.725 1.31876L114.862 0.28124L109.974 18.4812L113.837 19.5188ZM116.793 2.8H123.241V-1.2H116.793V2.8ZM123.241 2.8C126.408 2.8 128.049 3.65192 128.951 4.55421L131.779 1.72579C129.926 -0.127918 127.146 -1.2 123.241 -1.2V2.8ZM128.951 4.55421C129.847 5.45057 130.341 6.66444 130.341 8.47H134.341C134.341 5.85556 133.587 3.53343 131.779 1.72579L128.951 4.55421ZM130.341 8.47C130.341 10.6635 129.516 12.6526 127.937 14.2318L130.765 17.0602C133.086 14.7394 134.341 11.7365 134.341 8.47H130.341ZM127.937 14.2318C126.224 15.9445 123.644 17 119.809 17V21C124.398 21 128.11 19.7155 130.765 17.0602L127.937 14.2318ZM119.809 17H111.905V21H119.809V17ZM119.419 15.696H120.485V11.696H119.419V15.696ZM120.485 15.696C122.661 15.696 124.835 15.0604 126.267 13.6282L123.439 10.7998C122.999 11.2396 122.001 11.696 120.485 11.696V15.696ZM126.267 13.6282C127.373 12.5229 128.153 10.8011 128.153 9.12H124.153C124.153 9.67493 123.842 10.3971 123.439 10.7998L126.267 13.6282ZM128.153 9.12C128.153 7.69706 127.719 6.50538 126.813 5.59979L123.985 8.42821C124.026 8.46962 124.055 8.51019 124.08 8.57811C124.11 8.65542 124.153 8.81846 124.153 9.12H128.153ZM126.813 5.59978C125.72 4.50688 124.198 4.104 122.461 4.104V8.104C123.636 8.104 123.934 8.37712 123.985 8.42821L126.813 5.59978ZM122.461 4.104H121.447V8.104H122.461V4.104ZM119.515 5.58785L117.487 13.1799L121.351 14.2121L123.379 6.62015L119.515 5.58785ZM145.63 17.364C141.236 17.364 138.582 14.5344 138.582 11.122H134.582C134.582 17.0176 139.311 21.364 145.63 21.364V17.364ZM138.582 11.122C138.582 6.5337 142.338 2.436 147.294 2.436V-1.564C140.029 -1.564 134.582 4.4263 134.582 11.122H138.582ZM147.294 2.436C151.687 2.436 154.342 5.26556 154.342 8.678H158.342C158.342 2.78243 153.612 -1.564 147.294 -1.564V2.436ZM154.342 8.678C154.342 13.2663 150.585 17.364 145.63 17.364V21.364C152.894 21.364 158.342 15.3737 158.342 8.678H154.342ZM146.046 16.008C148.032 16.008 149.619 15.0191 150.656 13.7234C151.672 12.4532 152.232 10.815 152.232 9.224H148.232C148.232 9.921 147.972 10.6748 147.532 11.2246C147.113 11.7489 146.607 12.008 146.046 12.008V16.008ZM152.232 9.224C152.232 7.86611 151.816 6.49226 150.848 5.43575C149.857 4.3535 148.457 3.792 146.878 3.792V7.792C147.482 7.792 147.759 7.9845 147.899 8.13725C148.062 8.31574 148.232 8.65789 148.232 9.224H152.232ZM146.878 3.792C144.891 3.792 143.304 4.78087 142.267 6.07661C141.251 7.34678 140.692 8.985 140.692 10.576H144.692C144.692 9.87899 144.951 9.12522 145.391 8.57539C145.81 8.05113 146.316 7.792 146.878 7.792V3.792ZM140.692 10.576C140.692 11.9339 141.107 13.3077 142.075 14.3642C143.066 15.4465 144.466 16.008 146.046 16.008V12.008C145.441 12.008 145.164 11.8155 145.024 11.6628C144.861 11.4843 144.692 11.1421 144.692 10.576H140.692ZM161.99 19.13L159.993 19.2433C160.053 20.3021 160.929 21.13 161.99 21.13V19.13ZM160.95 0.799999V-1.2C160.4 -1.2 159.874 -0.973421 159.496 -0.573576C159.118 -0.17373 158.922 0.364074 158.953 0.913292L160.95 0.799999ZM167.19 0.799999L169.189 0.746447C169.16 -0.336876 168.273 -1.2 167.19 -1.2V0.799999ZM167.424 9.536L165.424 9.58955C165.448 10.4781 166.055 11.2443 166.915 11.4703C167.775 11.6963 168.68 11.3277 169.138 10.5657L167.424 9.536ZM172.702 0.747999V-1.252C171.999 -1.252 171.349 -0.883726 170.987 -0.281738L172.702 0.747999ZM177.954 0.747999L179.949 0.612219C179.878 -0.437223 179.005 -1.252 177.954 -1.252V0.747999ZM178.552 9.536L176.556 9.67178C176.616 10.5539 177.248 11.2919 178.111 11.4868C178.973 11.6817 179.861 11.2871 180.295 10.5165L178.552 9.536ZM183.466 0.799999V-1.2C182.743 -1.2 182.077 -0.810277 181.722 -0.180524L183.466 0.799999ZM189.862 0.799999L191.582 1.82C191.948 1.20182 191.955 0.434514 191.599 -0.189948C191.244 -0.814409 190.58 -1.2 189.862 -1.2V0.799999ZM178.994 19.13V21.13C179.7 21.13 180.354 20.7575 180.714 20.15L178.994 19.13ZM173.69 19.13L171.697 19.3018C171.786 20.3359 172.652 21.13 173.69 21.13V19.13ZM172.91 10.082L174.902 9.91022C174.828 9.0518 174.213 8.33726 173.375 8.13685C172.537 7.93645 171.665 8.29522 171.21 9.02727L172.91 10.082ZM167.294 19.13V21.13C167.985 21.13 168.628 20.7725 168.993 20.1847L167.294 19.13ZM163.986 19.0167L162.946 0.686706L158.953 0.913292L159.993 19.2433L163.986 19.0167ZM160.95 2.8H167.19V-1.2H160.95V2.8ZM165.19 0.853551L165.424 9.58955L169.423 9.48245L169.189 0.746447L165.19 0.853551ZM169.138 10.5657L174.416 1.77774L170.987 -0.281738L165.709 8.50626L169.138 10.5657ZM172.702 2.748H177.954V-1.252H172.702V2.748ZM175.958 0.88378L176.556 9.67178L180.547 9.40022L179.949 0.612219L175.958 0.88378ZM180.295 10.5165L185.209 1.78052L181.722 -0.180524L176.808 8.55548L180.295 10.5165ZM183.466 2.8H189.862V-1.2H183.466V2.8ZM188.141 -0.220007L177.273 18.11L180.714 20.15L191.582 1.82L188.141 -0.220007ZM178.994 17.13H173.69V21.13H178.994V17.13ZM175.682 18.9582L174.902 9.91022L170.917 10.2538L171.697 19.3018L175.682 18.9582ZM171.21 9.02727L165.594 18.0753L168.993 20.1847L174.609 11.1367L171.21 9.02727ZM167.294 17.13H161.99V21.13H167.294V17.13ZM189.178 19L187.246 18.4812C187.085 19.0819 187.212 19.7235 187.591 20.2171C187.969 20.7106 188.556 21 189.178 21V19ZM194.066 0.799999V-1.2C193.161 -1.2 192.369 -0.592575 192.134 0.28124L194.066 0.799999ZM199.76 0.799999L201.566 -0.0596585C201.234 -0.756255 200.531 -1.2 199.76 -1.2V0.799999ZM203.894 9.484L202.088 10.3437C202.448 11.0997 203.241 11.5515 204.075 11.4758C204.909 11.4001 205.607 10.8129 205.825 10.0044L203.894 9.484ZM206.234 0.799999V-1.2C205.33 -1.2 204.538 -0.593387 204.303 0.279637L206.234 0.799999ZM212.266 0.799999L214.197 1.31876C214.359 0.718062 214.231 0.076499 213.853 -0.417064C213.474 -0.910626 212.888 -1.2 212.266 -1.2V0.799999ZM207.378 19V21C208.283 21 209.075 20.3926 209.309 19.5188L207.378 19ZM201.97 19L200.165 19.8611C200.497 20.5569 201.199 21 201.97 21V19ZM197.654 9.952L199.459 9.09092C199.099 8.33561 198.306 7.88446 197.473 7.96021C196.639 8.03595 195.941 8.62257 195.723 9.43046L197.654 9.952ZM195.21 19V21C196.114 21 196.905 20.394 197.141 19.5215L195.21 19ZM191.109 19.5188L195.997 1.31876L192.134 0.28124L187.246 18.4812L191.109 19.5188ZM194.066 2.8H199.76V-1.2H194.066V2.8ZM197.954 1.65966L202.088 10.3437L205.7 8.62434L201.566 -0.0596585L197.954 1.65966ZM205.825 10.0044L208.165 1.32036L204.303 0.279637L201.963 8.96364L205.825 10.0044ZM206.234 2.8H212.266V-1.2H206.234V2.8ZM210.334 0.28124L205.446 18.4812L209.309 19.5188L214.197 1.31876L210.334 0.28124ZM207.378 17H201.97V21H207.378V17ZM203.775 18.1389L199.459 9.09092L195.849 10.8131L200.165 19.8611L203.775 18.1389ZM195.723 9.43046L193.279 18.4785L197.141 19.5215L199.585 10.4735L195.723 9.43046ZM195.21 17H189.178V21H195.21V17ZM227.379 19L225.448 18.4806C225.286 19.0814 225.413 19.7231 225.792 20.2168C226.17 20.7105 226.757 21 227.379 21V19ZM230.889 5.948L232.82 6.46739C232.982 5.86664 232.855 5.22491 232.476 4.7312C232.098 4.23748 231.511 3.948 230.889 3.948V5.948ZM225.533 5.948L223.601 5.43085C223.44 6.0314 223.568 6.67255 223.946 7.16572C224.325 7.6589 224.911 7.948 225.533 7.948V5.948ZM226.911 0.799999V-1.2C226.006 -1.2 225.213 -0.591757 224.979 0.282852L226.911 0.799999ZM243.707 0.799999L245.639 1.31715C245.8 0.716598 245.672 0.0754461 245.294 -0.417726C244.915 -0.910898 244.329 -1.2 243.707 -1.2V0.799999ZM242.329 5.948V7.948C243.234 7.948 244.027 7.33976 244.261 6.46515L242.329 5.948ZM236.973 5.948V3.948C236.068 3.948 235.277 4.5551 235.042 5.4286L236.973 5.948ZM233.463 19V21C234.368 21 235.159 20.3929 235.394 19.5194L233.463 19ZM229.31 19.5194L232.82 6.46739L228.958 5.4286L225.448 18.4806L229.31 19.5194ZM230.889 3.948H225.533V7.948H230.889V3.948ZM227.465 6.46515L228.843 1.31715L224.979 0.282852L223.601 5.43085L227.465 6.46515ZM226.911 2.8H243.707V-1.2H226.911V2.8ZM241.775 0.282852L240.397 5.43085L244.261 6.46515L245.639 1.31715L241.775 0.282852ZM242.329 3.948H236.973V7.948H242.329V3.948ZM235.042 5.4286L231.532 18.4806L235.394 19.5194L238.904 6.46739L235.042 5.4286ZM233.463 17H227.379V21H233.463V17ZM254.469 17.364C250.075 17.364 247.421 14.5344 247.421 11.122H243.421C243.421 17.0176 248.151 21.364 254.469 21.364V17.364ZM247.421 11.122C247.421 6.5337 251.178 2.436 256.133 2.436V-1.564C248.868 -1.564 243.421 4.4263 243.421 11.122H247.421ZM256.133 2.436C260.527 2.436 263.181 5.26556 263.181 8.678H267.181C267.181 2.78243 262.451 -1.564 256.133 -1.564V2.436ZM263.181 8.678C263.181 13.2663 259.424 17.364 254.469 17.364V21.364C261.734 21.364 267.181 15.3737 267.181 8.678H263.181ZM254.885 16.008C256.872 16.008 258.459 15.0191 259.495 13.7234C260.511 12.4532 261.071 10.815 261.071 9.224H257.071C257.071 9.921 256.812 10.6748 256.372 11.2246C255.952 11.7489 255.446 12.008 254.885 12.008V16.008ZM261.071 9.224C261.071 7.86611 260.655 6.49226 259.688 5.43575C258.697 4.3535 257.297 3.792 255.717 3.792V7.792C256.321 7.792 256.598 7.9845 256.738 8.13725C256.901 8.31574 257.071 8.65789 257.071 9.224H261.071ZM255.717 3.792C253.73 3.792 252.143 4.78087 251.107 6.07661C250.091 7.34678 249.531 8.985 249.531 10.576H253.531C253.531 9.87899 253.79 9.12522 254.23 8.57539C254.65 8.05113 255.156 7.792 255.717 7.792V3.792ZM249.531 10.576C249.531 11.9339 249.946 13.3077 250.914 14.3642C251.905 15.4465 253.305 16.008 254.885 16.008V12.008C254.281 12.008 254.004 11.8155 253.864 11.6628C253.7 11.4843 253.531 11.1421 253.531 10.576H249.531ZM277.552 19L275.621 18.4812C275.46 19.0819 275.587 19.7235 275.965 20.2171C276.344 20.7106 276.931 21 277.552 21V19ZM282.44 0.799999V-1.2C281.536 -1.2 280.744 -0.592575 280.509 0.28124L282.44 0.799999ZM297.676 0.799999L299.607 1.32133C299.77 0.720397 299.643 0.0781794 299.264 -0.416007C298.886 -0.910192 298.299 -1.2 297.676 -1.2V0.799999ZM296.272 6V8C297.176 8 297.968 7.39388 298.203 6.52133L296.272 6ZM287.12 6V4C286.216 4 285.425 4.60643 285.189 5.47927L287.12 6ZM286.496 8.314L284.565 7.79327C284.403 8.39415 284.53 9.03621 284.909 9.53025C285.287 10.0243 285.874 10.314 286.496 10.314V8.314ZM294.999 8.314L296.93 8.83395C297.091 8.23314 296.964 7.59128 296.586 7.09743C296.207 6.60357 295.621 6.314 294.999 6.314V8.314ZM293.724 13.046V15.046C294.629 15.046 295.421 14.4392 295.656 13.5659L293.724 13.046ZM285.223 13.046V11.046C284.316 11.046 283.523 11.6554 283.29 12.5312L285.223 13.046ZM283.637 19V21C284.543 21 285.336 20.3906 285.569 19.5148L283.637 19ZM279.484 19.5188L284.372 1.31876L280.509 0.28124L275.621 18.4812L279.484 19.5188ZM282.44 2.8H297.676V-1.2H282.44V2.8ZM295.746 0.278667L294.342 5.47867L298.203 6.52133L299.607 1.32133L295.746 0.278667ZM296.272 4H287.12V8H296.272V4ZM285.189 5.47927L284.565 7.79327L288.428 8.83472L289.052 6.52073L285.189 5.47927ZM286.496 10.314H294.999V6.314H286.496V10.314ZM293.067 7.79405L291.793 12.5261L295.656 13.5659L296.93 8.83395L293.067 7.79405ZM293.724 11.046H285.223V15.046H293.724V11.046ZM283.29 12.5312L281.704 18.4852L285.569 19.5148L287.155 13.5608L283.29 12.5312ZM283.637 17H277.552V21H283.637V17ZM297.589 19L295.657 18.4812C295.496 19.0819 295.623 19.7235 296.002 20.2171C296.38 20.7106 296.967 21 297.589 21V19ZM302.477 0.799999V-1.2C301.572 -1.2 300.78 -0.592575 300.545 0.28124L302.477 0.799999ZM317.999 0.799999L319.929 1.32283C320.092 0.72176 319.966 0.0791602 319.587 -0.41539C319.209 -0.909939 318.621 -1.2 317.999 -1.2V0.799999ZM316.647 5.792V7.792C317.55 7.792 318.341 7.18664 318.577 6.31483L316.647 5.792ZM307.105 5.792V3.792C306.199 3.792 305.407 4.40031 305.173 5.27498L307.105 5.792ZM306.611 7.638L304.679 7.12098C304.518 7.72152 304.646 8.36264 305.024 8.85578C305.403 9.34892 305.989 9.638 306.611 9.638V7.638ZM315.503 7.638L317.435 8.15261C317.595 7.5523 317.467 6.91179 317.089 6.41924C316.71 5.92668 316.124 5.638 315.503 5.638V7.638ZM314.333 12.032V14.032C315.239 14.032 316.032 13.4225 316.265 12.5466L314.333 12.032ZM305.441 12.032V10.032C304.541 10.032 303.753 10.6324 303.513 11.4993L305.441 12.032ZM304.895 14.008L302.967 13.4753C302.801 14.0773 302.925 14.7224 303.303 15.2193C303.682 15.7163 304.27 16.008 304.895 16.008V14.008ZM314.567 14.008L316.5 14.5214C316.659 13.9212 316.531 13.281 316.152 12.7888C315.774 12.2965 315.188 12.008 314.567 12.008V14.008ZM313.241 19V21C314.148 21 314.941 20.3899 315.174 19.5134L313.241 19ZM299.52 19.5188L304.408 1.31876L300.545 0.28124L295.657 18.4812L299.52 19.5188ZM302.477 2.8H317.999V-1.2H302.477V2.8ZM316.068 0.277167L314.716 5.26917L318.577 6.31483L319.929 1.32283L316.068 0.277167ZM316.647 3.792H307.105V7.792H316.647V3.792ZM305.173 5.27498L304.679 7.12098L308.543 8.15502L309.037 6.30902L305.173 5.27498ZM306.611 9.638H315.503V5.638H306.611V9.638ZM313.57 7.12339L312.4 11.5174L316.265 12.5466L317.435 8.15261L313.57 7.12339ZM314.333 10.032H305.441V14.032H314.333V10.032ZM303.513 11.4993L302.967 13.4753L306.823 14.5407L307.368 12.5647L303.513 11.4993ZM304.895 16.008H314.567V12.008H304.895V16.008ZM312.634 13.4946L311.308 18.4866L315.174 19.5134L316.5 14.5214L312.634 13.4946ZM313.241 17H297.589V21H313.241V17ZM318.463 19L316.531 18.4812C316.37 19.0819 316.497 19.7235 316.876 20.2171C317.254 20.7106 317.841 21 318.463 21V19ZM323.351 0.799999V-1.2C322.446 -1.2 321.654 -0.592575 321.419 0.28124L323.351 0.799999ZM338.873 0.799999L340.803 1.32283C340.966 0.72176 340.84 0.0791602 340.461 -0.41539C340.083 -0.909939 339.496 -1.2 338.873 -1.2V0.799999ZM337.521 5.792V7.792C338.424 7.792 339.215 7.18664 339.451 6.31483L337.521 5.792ZM327.979 5.792V3.792C327.073 3.792 326.281 4.40031 326.047 5.27498L327.979 5.792ZM327.485 7.638L325.553 7.12098C325.392 7.72152 325.52 8.36264 325.898 8.85578C326.277 9.34892 326.863 9.638 327.485 9.638V7.638ZM336.377 7.638L338.31 8.15261C338.469 7.5523 338.341 6.91179 337.963 6.41924C337.584 5.92668 336.998 5.638 336.377 5.638V7.638ZM335.207 12.032V14.032C336.113 14.032 336.906 13.4225 337.14 12.5466L335.207 12.032ZM326.315 12.032V10.032C325.415 10.032 324.627 10.6324 324.387 11.4993L326.315 12.032ZM325.769 14.008L323.841 13.4753C323.675 14.0773 323.799 14.7224 324.177 15.2193C324.556 15.7163 325.144 16.008 325.769 16.008V14.008ZM335.441 14.008L337.374 14.5214C337.533 13.9212 337.405 13.281 337.026 12.7888C336.648 12.2965 336.062 12.008 335.441 12.008V14.008ZM334.115 19V21C335.022 21 335.815 20.3899 336.048 19.5134L334.115 19ZM320.394 19.5188L325.282 1.31876L321.419 0.28124L316.531 18.4812L320.394 19.5188ZM323.351 2.8H338.873V-1.2H323.351V2.8ZM336.942 0.277167L335.59 5.26917L339.451 6.31483L340.803 1.32283L336.942 0.277167ZM337.521 3.792H327.979V7.792H337.521V3.792ZM326.047 5.27498L325.553 7.12098L329.417 8.15502L329.911 6.30902L326.047 5.27498ZM327.485 9.638H336.377V5.638H327.485V9.638ZM334.444 7.12339L333.274 11.5174L337.14 12.5466L338.31 8.15261L334.444 7.12339ZM335.207 10.032H326.315V14.032H335.207V10.032ZM324.387 11.4993L323.841 13.4753L327.697 14.5407L328.243 12.5647L324.387 11.4993ZM325.769 16.008H335.441V12.008H325.769V16.008ZM333.508 13.4946L332.182 18.4866L336.048 19.5134L337.374 14.5214L333.508 13.4946ZM334.115 17H318.463V21H334.115V17ZM339.337 19L337.405 18.4812C337.244 19.0819 337.371 19.7235 337.75 20.2171C338.128 20.7106 338.715 21 339.337 21V19ZM344.225 0.799999V-1.2C343.32 -1.2 342.528 -0.592575 342.293 0.28124L344.225 0.799999ZM357.797 3.14L356.383 4.55421V4.55421L357.797 3.14ZM356.783 15.646L358.197 17.0602L356.783 15.646ZM346.851 13.696L344.919 13.1799C344.758 13.7803 344.886 14.4212 345.265 14.9141C345.643 15.4071 346.23 15.696 346.851 15.696V13.696ZM352.285 12.214L353.699 13.6282V13.6282L352.285 12.214ZM352.831 7.014L354.245 5.59979V5.59978L352.831 7.014ZM348.879 6.104V4.104C347.973 4.104 347.181 4.71275 346.947 5.58785L348.879 6.104ZM341.269 19.5188L346.157 1.31876L342.293 0.28124L337.405 18.4812L341.269 19.5188ZM344.225 2.8H350.673V-1.2H344.225V2.8ZM350.673 2.8C353.84 2.8 355.481 3.65192 356.383 4.55421L359.211 1.72579C357.358 -0.127918 354.578 -1.2 350.673 -1.2V2.8ZM356.383 4.55421C357.279 5.45057 357.773 6.66444 357.773 8.47H361.773C361.773 5.85556 361.019 3.53343 359.211 1.72579L356.383 4.55421ZM357.773 8.47C357.773 10.6635 356.948 12.6526 355.369 14.2318L358.197 17.0602C360.518 14.7394 361.773 11.7365 361.773 8.47H357.773ZM355.369 14.2318C353.656 15.9445 351.076 17 347.241 17V21C351.83 21 355.542 19.7155 358.197 17.0602L355.369 14.2318ZM347.241 17H339.337V21H347.241V17ZM346.851 15.696H347.917V11.696H346.851V15.696ZM347.917 15.696C350.093 15.696 352.267 15.0604 353.699 13.6282L350.871 10.7998C350.431 11.2396 349.433 11.696 347.917 11.696V15.696ZM353.699 13.6282C354.805 12.5229 355.585 10.8011 355.585 9.12H351.585C351.585 9.67493 351.273 10.3971 350.871 10.7998L353.699 13.6282ZM355.585 9.12C355.585 7.69706 355.151 6.50538 354.245 5.59979L351.417 8.42821C351.458 8.46962 351.487 8.51019 351.512 8.57811C351.542 8.65542 351.585 8.81846 351.585 9.12H355.585ZM354.245 5.59978C353.152 4.50688 351.63 4.104 349.893 4.104V8.104C351.068 8.104 351.366 8.37712 351.417 8.42821L354.245 5.59978ZM349.893 4.104H348.879V8.104H349.893V4.104ZM346.947 5.58785L344.919 13.1799L348.783 14.2121L350.811 6.62015L346.947 5.58785Z"
        fill="black"
        mask="url(#path-1-outside-1_2142_6472)"
      />
    </svg>
  );
}

export function CountdownMobileTitle(props: any) {
  return (
    <svg
      {...props}
      width="250"
      height="14"
      viewBox="0 0 250 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.88991 13.27C3.36191 13.27 0.913905 11.128 0.913905 7.744C0.913905 4.306 3.55991 0.129999 8.99591 0.129999C11.7139 0.129999 13.6399 1.57 14.1619 3.802L10.3999 5.44C10.1299 4.414 9.39191 3.91 8.43791 3.91C6.54791 3.91 5.32391 5.638 5.32391 7.366C5.32391 8.752 6.18791 9.526 7.30391 9.526C8.27591 9.526 9.06791 9.058 9.75191 8.212L12.6679 10.516C11.4079 12.172 9.57191 13.27 6.88991 13.27ZM22.4742 13.252C18.7662 13.252 16.2102 10.768 16.2102 7.546C16.2102 3.64 19.3962 0.147999 23.6262 0.147999C27.3342 0.147999 29.8902 2.632 29.8902 5.854C29.8902 9.76 26.7042 13.252 22.4742 13.252ZM22.7622 9.544C24.5262 9.544 25.6602 7.816 25.6602 6.232C25.6602 4.9 24.8502 3.856 23.3382 3.856C21.5742 3.856 20.4402 5.584 20.4402 7.168C20.4402 8.5 21.2502 9.544 22.7622 9.544ZM38.3128 13.252C34.7668 13.252 32.8588 11.56 32.8588 8.716C32.8588 8.068 32.9488 7.366 33.1288 6.682L34.8208 0.399999H39.1048L37.3408 6.952C37.2508 7.312 37.1968 7.654 37.1968 7.942C37.1968 8.986 37.8088 9.526 38.9248 9.526C39.4468 9.526 39.9328 9.346 40.2748 9.004C40.6528 8.626 40.9048 8.14 41.1748 7.168L42.9928 0.399999H47.2768L45.2788 7.816C44.8288 9.49 44.1808 10.714 43.2988 11.596C42.1108 12.784 40.3108 13.252 38.3128 13.252ZM47.4903 13L50.8743 0.399999H54.8163L57.6783 6.412L59.2983 0.399999H63.4743L60.0903 13H56.3463L53.3583 6.736L51.6663 13H47.4903ZM67.0269 13L69.4569 3.964H65.7489L66.7029 0.399999H78.3309L77.3769 3.964H73.6689L71.2389 13H67.0269ZM78.2035 13L81.5875 0.399999H86.0515C88.4995 0.399999 90.0295 1.066 90.9835 2.02C91.9195 2.956 92.3515 4.18 92.3515 5.71C92.3515 7.6 91.6315 9.328 90.2815 10.678C88.7695 12.19 86.5915 13 83.6755 13H78.2035ZM83.4055 9.328H84.1435C85.4215 9.328 86.5195 8.95 87.1675 8.302C87.6895 7.78 88.0675 6.934 88.0675 6.16C88.0675 5.476 87.8695 5.026 87.5455 4.702C87.1495 4.306 86.5195 4.072 85.5115 4.072H84.8095L83.4055 9.328ZM101.551 13.252C97.8432 13.252 95.2872 10.768 95.2872 7.546C95.2872 3.64 98.4732 0.147999 102.703 0.147999C106.411 0.147999 108.967 2.632 108.967 5.854C108.967 9.76 105.781 13.252 101.551 13.252ZM101.839 9.544C103.603 9.544 104.737 7.816 104.737 6.232C104.737 4.9 103.927 3.856 102.415 3.856C100.651 3.856 99.5172 5.584 99.5172 7.168C99.5172 8.5 100.327 9.544 101.839 9.544ZM112.877 13.09L112.157 0.399999H116.477L116.639 6.448L120.293 0.364H123.929L124.343 6.448L127.745 0.399999H132.173L124.649 13.09H120.977L120.437 6.826L116.549 13.09H112.877ZM131.7 13L135.084 0.399999H139.026L141.888 6.412L143.508 0.399999H147.684L144.3 13H140.556L137.568 6.736L135.876 13H131.7ZM158.147 13L160.577 3.964H156.869L157.823 0.399999H169.451L168.497 3.964H164.789L162.359 13H158.147ZM176.902 13.252C173.194 13.252 170.638 10.768 170.638 7.546C170.638 3.64 173.824 0.147999 178.054 0.147999C181.762 0.147999 184.318 2.632 184.318 5.854C184.318 9.76 181.132 13.252 176.902 13.252ZM177.19 9.544C178.954 9.544 180.088 7.816 180.088 6.232C180.088 4.9 179.278 3.856 177.766 3.856C176.002 3.856 174.868 5.584 174.868 7.168C174.868 8.5 175.678 9.544 177.19 9.544ZM192.882 13L196.266 0.399999H206.814L205.842 4H199.506L199.074 5.602H204.96L204.078 8.878H198.192L197.094 13H192.882ZM206.754 13L210.138 0.399999H220.884L219.948 3.856H213.342L213 5.134H219.156L218.346 8.176H212.19L211.812 9.544H218.508L217.59 13H206.754ZM221.205 13L224.589 0.399999H235.335L234.399 3.856H227.793L227.451 5.134H233.607L232.797 8.176H226.641L226.263 9.544H232.959L232.041 13H221.205ZM235.656 13L239.04 0.399999H243.504C245.952 0.399999 247.482 1.066 248.436 2.02C249.372 2.956 249.804 4.18 249.804 5.71C249.804 7.6 249.084 9.328 247.734 10.678C246.222 12.19 244.044 13 241.128 13H235.656ZM240.858 9.328H241.596C242.874 9.328 243.972 8.95 244.62 8.302C245.142 7.78 245.52 6.934 245.52 6.16C245.52 5.476 245.322 5.026 244.998 4.702C244.602 4.306 243.972 4.072 242.964 4.072H242.262L240.858 9.328Z"
        fill="white"
      />
    </svg>
  );
}

export function CountdownFinish(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownFinish.png"
      alt=""
    />
  );
}

export function CountdownFinishMobile(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/CountdownFinishMobile.png"
      alt=""
    />
  );
}

export function CoinPc() {
  return (
    <svg
      width="30"
      height="25"
      viewBox="0 0 30 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.5279 22.2916C25.594 25.4708 20.3017 25.834 15.7123 23.1076C11.1181 20.3813 8.96251 15.5938 10.8964 12.4146C11.0002 12.2448 11.1134 12.0844 11.2313 11.9288L12.2077 10.3251L12.7501 10.6458C15.2642 9.23077 19.1933 9.50435 22.712 11.5939C26.2355 13.6929 28.325 16.9899 28.2354 19.8483L28.8109 20.1879L27.5326 22.2916H27.5279Z"
        fill="#3E3E49"
      />
      <path
        d="M11.2358 11.7611L11.4386 11.8838L11.4292 11.8979L11.4198 11.9073L11.2358 11.7611ZM12.2122 10.1574L12.0094 10.0348L12.132 9.83195L12.3348 9.95458L12.2122 10.1574ZM12.7546 10.4781L12.8725 10.681L12.7499 10.747L12.632 10.6763L12.7546 10.4734V10.4781ZM28.2352 19.6759L28.1126 19.8788L27.9946 19.808V19.6712L28.2352 19.6759ZM28.8106 20.0155L28.9333 19.8127L29.1361 19.9354L29.0135 20.1382L28.8106 20.0155ZM27.5324 22.1192L27.7352 22.2419L27.6126 22.4447L27.4098 22.3221L27.5324 22.1192ZM27.5324 22.1192L27.3296 21.9966L27.4522 21.7938L27.655 21.9164L27.5324 22.1192ZM15.8394 22.7371C18.0988 24.0814 20.5232 24.6522 22.608 24.5107C24.6929 24.3644 26.4145 23.506 27.3296 22.0013L27.7352 22.2419C26.7164 23.9163 24.8297 24.8267 22.6363 24.9776C20.443 25.1286 17.9242 24.5248 15.5941 23.1381L15.8394 22.7371ZM11.1037 12.3696C10.1887 13.8743 10.2264 15.7798 11.0754 17.6666C11.9245 19.5533 13.5753 21.3976 15.8347 22.7371L15.5894 23.1381C13.2546 21.7513 11.533 19.841 10.6415 17.8552C9.75001 15.8742 9.67926 13.7988 10.6934 12.1243L11.099 12.3649L11.1037 12.3696ZM11.4245 11.9073C11.3113 12.0536 11.2028 12.2045 11.1037 12.3696L10.6981 12.129C10.8066 11.9498 10.9245 11.78 11.0519 11.6196L11.4245 11.9073ZM12.415 10.28L11.4386 11.8838L11.033 11.6432L12.0094 10.0395L12.415 10.28ZM12.632 10.681L12.0896 10.3602L12.3348 9.9593L12.8773 10.28L12.632 10.681ZM22.5939 11.6291C19.1223 9.5678 15.2875 9.32253 12.8678 10.6857L12.6367 10.28C15.2498 8.8084 19.2733 9.11027 22.8392 11.2281L22.5939 11.6291ZM27.9994 19.6712C28.0843 16.926 26.0655 13.695 22.5939 11.6338L22.8392 11.2328C26.4051 13.346 28.5607 16.7138 28.471 19.6806L27.9994 19.6712ZM28.688 20.2184L28.1126 19.8788L28.3578 19.4778L28.9333 19.8174L28.688 20.2184ZM27.3296 22.0013L28.6078 19.8976L29.0135 20.1382L27.7352 22.2419L27.3296 22.0013Z"
        fill="black"
      />
      <path
        d="M17.0299 20.9119C19.3083 22.2609 21.7569 22.8458 23.8699 22.7043C25.9829 22.5628 28.0137 21.5412 28.9496 20.0035C29.8903 18.4658 29.5708 16.6762 28.7057 14.7706C27.8407 12.8651 26.172 11.0113 23.8936 9.65762C21.6104 8.30861 19.1618 7.72844 17.0535 7.86523C14.9405 8.00674 13.1773 8.87463 12.2413 10.4123C11.3006 11.95 11.3526 13.8933 12.2177 15.7989C13.0827 17.7045 14.7514 19.5582 17.0299 20.9119Z"
        fill="#A0A0BF"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M17.7263 19.8034C19.58 20.9025 21.5658 21.3789 23.2686 21.2609C24.9761 21.1477 26.3769 20.4449 27.1175 19.228C27.858 18.0063 27.8297 16.4592 27.1316 14.9168C26.4336 13.3744 25.0798 11.865 23.2261 10.766C21.3724 9.66701 19.3866 9.19062 17.6839 9.30854C15.9764 9.42174 14.5755 10.1245 13.8349 11.3415C13.0944 12.5631 13.1227 14.1103 13.8208 15.6526C14.5189 17.195 15.8726 18.7044 17.7263 19.8034Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M17.6652 19.908C19.5377 21.0212 21.5329 21.5259 23.2404 21.4457C24.9479 21.3655 26.3235 20.8216 27.0499 19.6236C27.781 18.4255 27.745 16.7761 27.0092 15.2478C26.2781 13.7196 24.8913 12.2196 23.0187 11.1065C21.1462 9.9933 19.1509 9.4886 17.4435 9.56878C15.736 9.64425 14.3256 10.3046 13.5993 11.5027C12.8682 12.7007 12.9389 14.2384 13.6747 15.7667C14.4058 17.2949 15.7926 18.7949 17.6652 19.908Z"
        fill="#717194"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M21.1016 19.0768C20.8753 18.7268 20.9146 18.2679 21.1972 17.9615L21.4623 17.674C21.8669 17.2352 22.5767 17.296 22.9008 17.7972C23.1272 18.1472 23.0879 18.6061 22.8053 18.9125L22.5401 19.2C22.1355 19.6388 21.4258 19.578 21.1016 19.0768ZM19.6448 16.4736L19.6524 16.3046C20.3035 15.4362 20.4855 14.8974 20.1906 14.6288C20.0253 14.4759 19.8092 14.4915 19.5792 14.7377C19.4351 14.8937 19.3135 15.0917 19.2245 15.3617C19.1207 15.677 18.7965 15.8927 18.4824 15.7854C17.7997 15.5522 17.3394 14.8621 17.6331 14.2032C17.8127 13.8003 18.0655 13.4127 18.3929 13.0574C19.3258 12.0454 20.492 11.9079 21.2995 12.647C22.1098 13.3822 22.3538 14.5227 21.3875 16.004L21.5334 16.2903C21.6788 16.5757 21.6309 16.9214 21.4134 17.1564C21.1114 17.4828 20.5956 17.4834 20.2927 17.1578L19.6463 16.4626L19.6448 16.4736Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.06182 17.1571C5.22522 20.7135 11.1456 21.1198 16.2797 18.0699C21.4191 15.0201 23.8305 9.66433 21.6671 6.1079C21.551 5.91795 21.4244 5.73854 21.2924 5.56441L20.2002 3.77037L19.5934 4.12918C16.781 2.5462 12.3856 2.85225 8.44922 5.18978C4.50761 7.53786 2.17008 11.2262 2.27033 14.4238L1.62659 14.8037L3.05654 17.1571H3.06182Z"
        fill="#9EFF00"
      />
      <path
        d="M21.2874 5.57062L21.0605 5.70781L21.0711 5.72364L21.0816 5.73419L21.2874 5.57062ZM20.1952 3.77658L20.4221 3.63939L20.2849 3.41249L20.058 3.54968L20.1952 3.77658ZM19.5884 4.13539L19.4565 4.36228L19.5936 4.43615L19.7256 4.357L19.5884 4.13011V4.13539ZM2.27059 14.4247L2.40778 14.6516L2.53969 14.5725V14.4195L2.27059 14.4247ZM1.62684 14.8047L1.48965 14.5778L1.26276 14.715L1.39995 14.9419L1.62684 14.8047ZM3.0568 17.158L2.8299 17.2952L2.9671 17.5221L3.19399 17.3849L3.0568 17.158ZM3.0568 17.158L3.28369 17.0208L3.1465 16.7939L2.91961 16.9311L3.0568 17.158ZM16.1375 17.8493C13.61 19.3531 10.8978 19.9916 8.56556 19.8333C6.23331 19.6697 4.30735 18.7093 3.28369 17.0261L2.8299 17.2952C3.96965 19.1684 6.08029 20.1868 8.5339 20.3556C10.9875 20.5245 13.8052 19.8491 16.4119 18.2978L16.1375 17.8493ZM21.4352 6.2513C22.4588 7.93453 22.4166 10.0663 21.4668 12.1769C20.517 14.2876 18.6702 16.3507 16.1428 17.8493L16.4171 18.2978C19.029 16.7464 20.955 14.6094 21.9523 12.388C22.9496 10.1718 23.0287 7.85011 21.8942 5.97692L21.4404 6.24602L21.4352 6.2513ZM21.0764 5.73419C21.203 5.89777 21.3244 6.06662 21.4352 6.2513L21.889 5.98219C21.7676 5.78168 21.6357 5.59173 21.4932 5.41232L21.0764 5.73419ZM19.9683 3.91377L21.0605 5.70781L21.5143 5.4387L20.4221 3.64466L19.9683 3.91377ZM19.7256 4.36228L20.3324 4.00347L20.058 3.55496L19.4512 3.91377L19.7256 4.36228ZM8.58139 5.42287C12.465 3.117 16.7548 2.84262 19.4617 4.36756L19.7203 3.91377C16.797 2.26747 12.2961 2.60517 8.30701 4.97436L8.58139 5.42287ZM2.53442 14.4195C2.43944 11.3485 4.69782 7.73402 8.58139 5.42815L8.30701 4.97964C4.3179 7.34355 1.9065 11.111 2.00676 14.43L2.53442 14.4195ZM1.76403 15.0316L2.40778 14.6516L2.13339 14.2031L1.48965 14.583L1.76403 15.0316ZM3.28369 17.0261L1.85373 14.6727L1.39995 14.9419L2.8299 17.2952L3.28369 17.0261Z"
        fill="black"
      />
      <path
        d="M14.7759 15.6169C12.2326 17.126 9.49932 17.7803 7.14068 17.622C4.78205 17.4637 2.81388 16.4928 1.76911 14.7727C0.719068 13.0525 0.777111 10.8785 1.74273 8.74678C2.70834 6.61504 4.57098 4.54134 7.1143 3.02695C9.66289 1.51785 12.3962 0.868825 14.7495 1.02185C17.1082 1.18014 19.0763 2.15104 20.1211 3.87121C21.1711 5.59138 21.1131 7.76534 20.1475 9.89708C19.1819 12.0288 17.3192 14.1025 14.7759 15.6169Z"
        fill="#9EFF00"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M14.0266 14.3772C11.9529 15.6067 9.73141 16.1396 7.82656 16.0077C5.91644 15.881 4.34929 15.0948 3.52086 13.7335C2.69244 12.3668 2.7241 10.6361 3.50503 8.91066C4.28597 7.18521 5.80035 5.4967 7.87405 4.26725C9.94775 3.03781 12.1692 2.50487 14.074 2.63679C15.9842 2.76343 17.5513 3.54964 18.3797 4.911C19.2082 6.27764 19.1765 8.00836 18.3956 9.7338C17.6146 11.4593 16.1003 13.1478 14.0266 14.3772Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M14.0952 14.4915C12.0004 15.7368 9.7684 16.3014 7.85827 16.2117C5.94815 16.122 4.37045 15.3885 3.55785 14.0483C2.73998 12.708 2.81913 10.9879 3.64228 9.27825C4.46015 7.56863 6.01147 5.89068 8.10627 4.6454C10.2011 3.40012 12.4331 2.83553 14.3432 2.92523C16.2533 3.00966 17.831 3.74838 18.6436 5.08863C19.4615 6.42889 19.3824 8.14906 18.5592 9.85868C17.7413 11.5683 16.19 13.2462 14.0952 14.4915Z"
        fill="#9EFF00"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M7.87174 12.3347C8.04529 11.9019 8.48984 11.6414 8.95224 11.7017L9.38613 11.7583C10.0482 11.8446 10.451 12.5322 10.2025 13.1519C10.0289 13.5847 9.5844 13.8451 9.122 13.7848L8.68811 13.7283C8.02607 13.642 7.62325 12.9544 7.87174 12.3347ZM9.30898 9.32279L9.46826 9.2206C10.682 9.25466 11.2917 9.07299 11.3466 8.63018C11.3795 8.38038 11.2258 8.19304 10.8523 8.14194C10.6168 8.11109 10.3573 8.12785 10.0533 8.22096C9.6982 8.32968 9.29185 8.17282 9.187 7.81659C8.95915 7.04242 9.29227 6.17626 10.0838 6.01908C10.5679 5.92297 11.0852 5.90366 11.6212 5.97327C13.148 6.17197 14.0268 7.14844 13.873 8.36335C13.7247 9.57826 12.8405 10.5377 10.8633 10.6115L10.6959 10.9297C10.5292 11.2468 10.1825 11.4262 9.8273 11.3793C9.33413 11.3142 9.00046 10.8435 9.10238 10.3566L9.31997 9.31711L9.30898 9.32279Z"
        fill="black"
      />
    </svg>
  );
}

export function CoinMobile() {
  return (
    <svg
      width="38"
      height="31"
      viewBox="0 0 38 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.4523 27.4633C32.1518 31.2451 25.8562 31.6772 20.3966 28.434C14.9315 25.1908 12.3672 19.4956 14.6677 15.7137C14.7912 15.5117 14.9258 15.3209 15.0661 15.1358L16.2276 13.228L16.8729 13.6096C19.8636 11.9262 24.5376 12.2517 28.7234 14.7374C32.9149 17.2343 35.4006 21.1564 35.294 24.5567L35.9785 24.9607L34.4579 27.4633H34.4523Z"
        fill="#3E3E49"
      />
      <path
        d="M15.0703 14.9406L15.3116 15.0865L15.3004 15.1033L15.2891 15.1145L15.0703 14.9406ZM16.2318 13.0328L15.9905 12.8869L16.1364 12.6456L16.3777 12.7915L16.2318 13.0328ZM16.8771 13.4144L17.0173 13.6556L16.8715 13.7342L16.7312 13.65L16.8771 13.4087V13.4144ZM35.2925 24.3559L35.1467 24.5972L35.0064 24.513V24.3503L35.2925 24.3559ZM35.9771 24.7599L36.123 24.5186L36.3643 24.6645L36.2184 24.9058L35.9771 24.7599ZM34.4565 27.2624L34.6978 27.4083L34.5519 27.6496L34.3106 27.5037L34.4565 27.2624ZM34.4565 27.2624L34.2152 27.1165L34.3611 26.8753L34.6024 27.0212L34.4565 27.2624ZM20.5467 27.9975C23.2344 29.5966 26.1185 30.2756 28.5986 30.1072C31.0786 29.9333 33.1267 28.9121 34.2152 27.1222L34.6978 27.4083C33.4858 29.4002 31.2414 30.4832 28.6322 30.6627C26.0231 30.8423 23.0268 30.1241 20.2549 28.4744L20.5467 27.9975ZM14.9132 15.6644C13.8247 17.4543 13.8695 19.7212 14.8795 21.9656C15.8895 24.21 17.8534 26.4039 20.5411 27.9975L20.2493 28.4744C17.4718 26.8248 15.4238 24.5523 14.3633 22.19C13.3028 19.8334 13.2187 17.3645 14.425 15.3726L14.9076 15.6588L14.9132 15.6644ZM15.2947 15.1145C15.1601 15.2884 15.031 15.468 14.9132 15.6644L14.4306 15.3782C14.5597 15.165 14.7 14.963 14.8515 14.7722L15.2947 15.1145ZM16.4731 13.1787L15.3116 15.0865L14.829 14.8003L15.9905 12.8925L16.4731 13.1787ZM16.7312 13.6556L16.0859 13.2741L16.3777 12.7971L17.023 13.1787L16.7312 13.6556ZM28.5817 14.7835C24.452 12.3314 19.8902 12.0396 17.0117 13.6612L16.7368 13.1787C19.8453 11.428 24.6315 11.7872 28.8735 14.3065L28.5817 14.7835ZM35.012 24.3503C35.113 21.0847 32.7115 17.2411 28.5817 14.7891L28.8735 14.3121C33.1155 16.8259 35.6797 20.8322 35.5731 24.3615L35.012 24.3503ZM35.8312 25.0012L35.1467 24.5972L35.4384 24.1202L36.123 24.5242L35.8312 25.0012ZM34.2152 27.1222L35.7358 24.6196L36.2184 24.9058L34.6978 27.4083L34.2152 27.1222Z"
        fill="black"
      />
      <path
        d="M21.964 25.8256C24.6744 27.4304 27.5872 28.1262 30.1008 27.9578C32.6144 27.7895 35.0301 26.5742 36.1435 24.745C37.2626 22.9158 36.8825 20.7869 35.8534 18.52C34.8244 16.2532 32.8393 14.048 30.1289 12.4377C27.4129 10.8329 24.5 10.1427 21.9921 10.3055C19.4785 10.4738 17.381 11.5062 16.2676 13.3354C15.1486 15.1646 15.2104 17.4764 16.2395 19.7432C17.2685 22.0101 19.2535 24.2153 21.964 25.8256Z"
        fill="#A0A0BF"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M22.7925 24.5103C24.9976 25.8177 27.3599 26.3844 29.3854 26.2441C31.4166 26.1095 33.0831 25.2734 33.9641 23.8258C34.845 22.3725 34.8113 20.5321 33.9809 18.6973C33.1505 16.8625 31.5401 15.0669 29.3349 13.7595C27.1298 12.4522 24.7675 11.8854 22.742 12.0257C20.7108 12.1604 19.0443 12.9964 18.1633 14.4441C17.2824 15.8974 17.3161 17.7378 18.1465 19.5726C18.9769 21.4074 20.5873 23.2029 22.7925 24.5103Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M22.721 24.6344C24.9486 25.9586 27.3221 26.559 29.3533 26.4636C31.3845 26.3682 33.0209 25.7212 33.885 24.296C34.7547 22.8708 34.7119 20.9087 33.8365 19.0907C32.9668 17.2727 31.3172 15.4884 29.0896 14.1642C26.862 12.84 24.4885 12.2396 22.4573 12.335C20.4261 12.4248 18.7484 13.2103 17.8843 14.6355C17.0146 16.0607 17.0988 17.8899 17.9741 19.7079C18.8438 21.5259 20.4934 23.3102 22.721 24.6344Z"
        fill="#717194"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M26.8083 23.6441C26.539 23.2278 26.5858 22.6819 26.9219 22.3174L27.2374 21.9753C27.7187 21.4534 28.563 21.5257 28.9486 22.1219C29.2179 22.5382 29.1711 23.0841 28.835 23.4486L28.5195 23.7907C28.0382 24.3126 27.1939 24.2403 26.8083 23.6441ZM25.0752 20.5473L25.0843 20.3463C25.8589 19.3133 26.0754 18.6724 25.7246 18.3529C25.5279 18.1709 25.2708 18.1895 24.9972 18.4824C24.8259 18.6679 24.6811 18.9035 24.5753 19.2247C24.4518 19.5998 24.0662 19.8563 23.6925 19.7287C22.8804 19.4513 22.3327 18.6304 22.6821 17.8466C22.8958 17.3673 23.1966 16.9062 23.5861 16.4835C24.6958 15.2797 26.0831 15.116 27.0437 15.9953C28.0076 16.8698 28.2979 18.2266 27.1483 19.9887L27.3219 20.3294C27.4949 20.6688 27.4379 21.08 27.1792 21.3596C26.8199 21.7479 26.2063 21.7487 25.8461 21.3613L25.077 20.5343L25.0752 20.5473Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.49262 20.5311C6.10759 24.8299 13.2637 25.321 19.4694 21.6345C25.6816 17.9481 28.5963 11.4744 25.9813 7.17566C25.841 6.94606 25.688 6.72921 25.5285 6.51873L24.2083 4.35022L23.4748 4.78392C20.0753 2.87053 14.7625 3.24046 10.0045 6.0659C5.24018 8.90409 2.41474 13.3623 2.53593 17.2273L1.75781 17.6866L3.48624 20.5311H3.49262Z"
        fill="#9EFF00"
      />
      <path
        d="M25.5218 6.52413L25.2475 6.68996L25.2603 6.7091L25.273 6.72185L25.5218 6.52413ZM24.2015 4.35562L24.4758 4.1898L24.31 3.91554L24.0357 4.08137L24.2015 4.35562ZM23.4681 4.78933L23.3086 5.06358L23.4744 5.15287L23.6339 5.0572L23.4681 4.78295V4.78933ZM2.53558 17.2264L2.7014 17.5006L2.86085 17.405V17.22L2.53558 17.2264ZM1.75746 17.6856L1.59164 17.4113L1.31738 17.5772L1.48321 17.8514L1.75746 17.6856ZM3.48589 20.5302L3.21164 20.696L3.37747 20.9702L3.65172 20.8044L3.48589 20.5302ZM3.48589 20.5302L3.76015 20.3643L3.59432 20.0901L3.32007 20.2559L3.48589 20.5302ZM19.2969 21.3657C16.2418 23.1834 12.9636 23.9551 10.1445 23.7638C7.32543 23.5661 4.99747 22.4053 3.76015 20.3707L3.21164 20.696C4.58928 22.9602 7.14047 24.1911 10.1062 24.3952C13.072 24.5993 16.4778 23.7829 19.6285 21.9078L19.2969 21.3657ZM25.7004 7.34689C26.9377 9.38147 26.8867 11.9582 25.7386 14.5094C24.5906 17.0605 22.3583 19.5543 19.3033 21.3657L19.6349 21.9078C22.792 20.0327 25.12 17.4496 26.3254 14.7645C27.5308 12.0857 27.6265 9.27942 26.2552 7.01524L25.7067 7.34051L25.7004 7.34689ZM25.2667 6.72185C25.4197 6.91957 25.5664 7.12366 25.7004 7.34689L26.2489 7.02162C26.1022 6.77925 25.9427 6.54965 25.7705 6.3328L25.2667 6.72185ZM23.9273 4.52145L25.2475 6.68996L25.796 6.36469L24.4758 4.19618L23.9273 4.52145ZM23.6339 5.06358L24.3674 4.62988L24.0357 4.08775L23.3022 4.52145L23.6339 5.06358ZM10.1636 6.34555C14.8578 3.55838 20.0431 3.22672 23.315 5.06996L23.6275 4.52145C20.0941 2.53153 14.6537 2.93972 9.83197 5.80342L10.1636 6.34555ZM2.85447 17.22C2.73967 13.508 5.46944 9.1391 10.1636 6.35193L9.83197 5.8098C5.01023 8.66713 2.0955 13.221 2.21668 17.2327L2.85447 17.22ZM1.92329 17.9598L2.7014 17.5006L2.36975 16.9585L1.59164 17.4177L1.92329 17.9598ZM3.76015 20.3707L2.03172 17.5261L1.48321 17.8514L3.21164 20.696L3.76015 20.3707Z"
        fill="black"
      />
      <path
        d="M17.6513 18.6679C14.5772 20.492 11.2734 21.2828 8.42242 21.0915C5.57147 20.9002 3.19248 19.7266 1.92965 17.6474C0.660429 15.5682 0.730587 12.9405 1.89776 10.3638C3.06492 7.78705 5.31635 5.28051 8.39053 3.45003C11.4711 1.62594 14.7749 0.841445 17.6195 1.02641C20.4704 1.21774 22.8494 2.39129 24.1122 4.47051C25.3814 6.54973 25.3113 9.17745 24.1441 11.7542C22.9769 14.3309 20.7255 16.8374 17.6513 18.6679Z"
        fill="#9EFF00"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M16.7452 17.1707C14.2387 18.6568 11.5536 19.301 9.25111 19.1415C6.94228 18.9884 5.04802 18.0381 4.04668 16.3926C3.04534 14.7407 3.08361 12.6487 4.02755 10.5632C4.97149 8.47756 6.80197 6.4366 9.30851 4.95054C11.8151 3.46447 14.5002 2.8203 16.8026 2.97975C19.1114 3.13282 21.0057 4.08313 22.007 5.72865C23.0084 7.38054 22.9701 9.47252 22.0262 11.5581C21.0822 13.6437 19.2518 15.6847 16.7452 17.1707Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M16.8279 17.31C14.2959 18.8152 11.598 19.4977 9.28918 19.3892C6.98036 19.2808 5.07334 18.3943 4.09114 16.7743C3.10255 15.1543 3.19822 13.075 4.19318 11.0086C5.18177 8.94211 7.05689 6.91392 9.58895 5.40872C12.121 3.90351 14.8189 3.22107 17.1277 3.3295C19.4365 3.43155 21.3435 4.32446 22.3258 5.94447C23.3143 7.56447 23.2187 9.64369 22.2237 11.7102C21.2351 13.7766 19.36 15.8048 16.8279 17.31Z"
        fill="#9EFF00"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M9.30676 14.6975C9.51654 14.1744 10.0539 13.8596 10.6128 13.9325L11.1373 14.0008C11.9375 14.1051 12.4244 14.9363 12.124 15.6853C11.9142 16.2084 11.3769 16.5232 10.818 16.4504L10.2935 16.382C9.4933 16.2777 9.00641 15.4466 9.30676 14.6975ZM11.044 11.057L11.2365 10.9335C12.7036 10.9746 13.4405 10.7551 13.5069 10.2198C13.5467 9.91787 13.3609 9.69142 12.9094 9.62966C12.6248 9.59237 12.3112 9.61262 11.9436 9.72517C11.5145 9.85659 11.0233 9.66698 10.8966 9.2364C10.6212 8.30064 11.0238 7.25369 11.9806 7.0637C12.5657 6.94752 13.191 6.92418 13.8388 7.00833C15.6844 7.2485 16.7465 8.42879 16.5606 9.89729C16.3814 11.3658 15.3126 12.5255 12.9227 12.6147L12.7096 13.0199C12.5146 13.3908 12.109 13.6007 11.6936 13.5459L11.6348 13.5381C11.058 13.4619 10.6677 12.9113 10.7869 12.3418L11.0573 11.0501L11.044 11.057Z"
        fill="black"
      />
    </svg>
  );
}

export function RuleTips() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="8.75" stroke="#FFBB54" strokeWidth="1.5" />
      <path
        d="M10 10L10 14"
        stroke="#FFBB54"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.25" r="0.75" fill="#7E8A93" stroke="#FFBB54" />
    </svg>
  );
}

export function RuleIcon() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 11.5H2C1.17157 11.5 0.5 10.8284 0.5 10V2C0.5 1.17157 1.17157 0.5 2 0.5H9C9.82843 0.5 10.5 1.17157 10.5 2V6.85714V10C10.5 10.8284 9.82843 11.5 9 11.5Z"
        stroke="white"
      />
      <line x1="2.5" y1="4.5" x2="7.5" y2="4.5" stroke="white" />
      <line x1="2.5" y1="7.5" x2="5.5" y2="7.5" stroke="white" />
    </svg>
  );
}

export function TriangleUp() {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 0.777328C4.83426 0.356276 4.16574 0.356275 3.77072 0.777328L0.45095 4.31579C-0.148156 4.95436 0.30462 6 1.18024 6H7.81976C8.69538 6 9.14815 4.95436 8.54905 4.31579L5.22929 0.777328Z"
        fill="white"
      />
    </svg>
  );
}

export function TriangleDown() {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 5.22267C4.83426 5.64372 4.16574 5.64372 3.77072 5.22267L0.45095 1.68421C-0.148156 1.04564 0.30462 0 1.18024 0H7.81976C8.69538 0 9.14815 1.04564 8.54905 1.68421L5.22929 5.22267Z"
        fill="#7E8A93"
      />
    </svg>
  );
}

export function UserRankingPC() {
  return (
    <svg
      width="55"
      height="42"
      viewBox="0 0 55 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5845 14.5234L1.09424 19.0196L13.0841 20.5184L12.5845 14.5234Z"
        fill="#A55F00"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M44.0577 27.0128L43.5581 41.001L52.5505 32.5081L54.0492 19.0195L44.0577 27.0128Z"
        fill="#F89E28"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M54.0487 19.0177L39.0613 18.0186L29.5693 25.0126L44.0571 27.011L54.0487 19.0177Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M39.0613 18.0172L40.5601 2.53027L29.5693 7.02647V25.0113L39.0613 18.0172Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M23.5763 1.0332L11.5864 5.02983L29.0717 7.02814L40.562 2.53194L23.5763 1.0332Z"
        fill="#FFCF37"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M12.5845 20.0157L11.5854 5.02832L29.5702 7.02663V25.0114L44.058 27.0098L43.5584 40.9979L3.09255 35.003L1.09424 19.0165L12.5845 20.0157Z"
        fill="url(#paint0_linear_2016_900)"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M16.3755 13.5362V11.399C18.9402 11.8264 19.9376 10.1522 20.1157 9.26172H22.2529V21.0166H19.5814V14.0705L16.3755 13.5362Z"
        fill="black"
      />
      <path
        d="M7.33705 26.0104L5.16389 25.4466C6.25047 20.3756 12.2266 22.0669 12.7699 24.8842C13.4219 28.2652 9.87239 29.204 8.42362 29.9552L12.7699 30.518V32.7718L4.62061 31.6456C4.62061 30.5187 6.25047 28.8277 8.42362 27.7008C10.5968 26.5739 10.5968 24.8832 9.5102 24.3197C8.28089 23.6822 7.33705 24.8831 7.33705 26.0104Z"
        fill="black"
      />
      <path
        d="M33.5125 30.6412H31.0163C31.5511 28.4111 34.7297 27.0851 37.4341 28.968C39.2976 30.2655 38.6625 33.2044 37.3867 33.4289C39.2503 34.3799 39.2976 37.3188 36.3644 38.4476C32.0859 38.8937 31.0692 36.1433 30.4814 34.5442H32.8324C32.8324 36.1433 34.76 37.3188 35.8296 36.2171C36.9362 35.0774 35.4731 33.8007 34.76 33.429V32.3137C35.2948 32.3137 36.9411 32.2415 36.3589 30.8536C35.8296 29.5919 34.0079 29.6781 33.5125 30.6412Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2016_900"
          x1="22.5761"
          y1="5.02832"
          x2="22.5761"
          y2="40.9979"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDF688" />
          <stop offset="1" stopColor="#FFCB34" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserRankingMobile() {
  return (
    <svg
      width="37"
      height="28"
      viewBox="0 0 37 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.47448 9.77344L1 12.6982L8.79946 13.6732L8.47448 9.77344Z"
        fill="#A55F00"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M28.95 17.8979L28.625 26.9972L34.4746 21.4726L35.4495 12.6982L28.95 17.8979Z"
        fill="#F89E28"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M35.4464 12.7017L25.697 12.0518L19.5225 16.6014L28.9468 17.9014L35.4464 12.7017Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M25.697 12.0518L26.672 1.97754L19.5225 4.90233V16.6015L25.697 12.0518Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M15.6227 1L7.82324 3.59982L19.1975 4.89973L26.6719 1.97493L15.6227 1Z"
        fill="#FFCF37"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M8.47448 13.3509L7.82453 3.60156L19.5237 4.90147V16.6007L28.9481 17.9006L28.6231 26.9999L2.29991 23.1002L1 12.7009L8.47448 13.3509Z"
        fill="url(#paint0_linear_2088_73)"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M10.9385 9.13117V7.74088C12.6068 8.01894 13.2556 6.92988 13.3715 6.35059H14.7618V13.9972H13.0239V9.47875L10.9385 9.13117Z"
        fill="black"
      />
      <path
        d="M5.06393 17.2493L3.65029 16.8825C4.35711 13.5838 8.24463 14.684 8.59804 16.5166C9.02218 18.716 6.71318 19.3267 5.77075 19.8154L8.59804 20.1815V21.6476L3.29688 20.915C3.29688 20.1819 4.35711 19.0819 5.77075 18.3488C7.1844 17.6158 7.1844 16.516 6.47757 16.1495C5.6779 15.7348 5.06393 16.516 5.06393 17.2493Z"
        fill="black"
      />
      <path
        d="M22.0889 20.2599H20.4651C20.813 18.8092 22.8807 17.9466 24.6399 19.1715C25.8522 20.0155 25.439 21.9273 24.6091 22.0733C25.8214 22.692 25.8522 24.6037 23.9441 25.338C21.1609 25.6282 20.4995 23.8391 20.1172 22.7989H21.6465C21.6465 23.8391 22.9004 24.6037 23.5962 23.8871C24.316 23.1457 23.3643 22.3152 22.9004 22.0734V21.3479C23.2483 21.3479 24.3192 21.3009 23.9405 20.3981C23.5962 19.5773 22.4112 19.6334 22.0889 20.2599Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2088_73"
          x1="14.974"
          y1="3.60156"
          x2="14.974"
          y2="26.9999"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDF688" />
          <stop offset="1" stopColor="#FFCB34" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserStakeRankingSort(props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.38406 5.53907C5.18417 5.77894 4.81574 5.77894 4.61584 5.53907L0.683363 0.82009C0.411977 0.494427 0.643556 -8.17966e-07 1.06747 -7.80906e-07L8.93243 -9.33297e-08C9.35635 -5.62695e-08 9.58793 0.494429 9.31654 0.820092L5.38406 5.53907Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UserStakeRankingTab1(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37562L18.9884 7.5956L17.4294 8.18173L13.742 9.56697L10.8344 8.4746L10.055 8.18173L9.27509 7.88866L8.49561 7.5956L7.9093 7.37562V0H19.5747Z"
        fill="url(#paint0_linear_1484_6598)"
      />
      <path
        opacity="0.8"
        d="M10.8341 0V8.4746L10.0546 8.18173L9.27478 7.88866V0H10.8341Z"
        fill="url(#paint1_linear_1484_6598)"
      />
      <path
        opacity="0.8"
        d="M16.6493 0V8.4746L17.4288 8.18173L18.2086 7.88866V0H16.6493Z"
        fill="url(#paint2_linear_1484_6598)"
      />
      <path
        d="M9.63879 28.158L13.74 31.9967V18.2568L9.63879 28.158Z"
        fill="url(#paint3_linear_1484_6598)"
      />
      <path
        d="M17.8412 8.3553L13.7397 4.5166V18.2566L17.8412 8.3553Z"
        fill="url(#paint4_linear_1484_6598)"
      />
      <path
        d="M3.83838 22.358L4.0242 27.9724L13.7397 18.2568L3.83838 22.358Z"
        fill="url(#paint5_linear_1484_6598)"
      />
      <path
        d="M23.6411 14.1544L23.4553 8.54004L13.7397 18.2558L23.6411 14.1544Z"
        fill="url(#paint6_linear_1484_6598)"
      />
      <path
        d="M0 18.2557H13.7398L3.83848 14.1543L0 18.2557Z"
        fill="url(#paint7_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L23.6411 22.358L27.4798 18.2568H13.7397Z"
        fill="url(#paint8_linear_1484_6598)"
      />
      <path
        d="M9.63849 8.35449L4.02417 8.5401L13.7397 18.2558L9.63849 8.35449Z"
        fill="url(#paint9_linear_1484_6598)"
      />
      <path
        d="M4.02417 27.9724L9.63849 28.158L13.7397 18.2568L4.02417 27.9724Z"
        fill="url(#paint10_linear_1484_6598)"
      />
      <path
        d="M17.8412 8.35449L13.7397 18.2558L23.4553 8.5401L17.8412 8.35449Z"
        fill="url(#paint11_linear_1484_6598)"
      />
      <path
        d="M3.83848 22.358L13.7398 18.2568H0L3.83848 22.358Z"
        fill="url(#paint12_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2557H27.4798L23.6411 14.1543L13.7397 18.2557Z"
        fill="url(#paint13_linear_1484_6598)"
      />
      <path
        d="M3.83838 14.1544L13.7397 18.2558L4.0242 8.54004L3.83838 14.1544Z"
        fill="url(#paint14_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L23.4553 27.9724L23.6411 22.358L13.7397 18.2568Z"
        fill="url(#paint15_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L17.8412 28.158L23.4553 27.9724L13.7397 18.2568Z"
        fill="url(#paint16_linear_1484_6598)"
      />
      <path
        d="M13.74 4.5166L9.63879 8.3553L13.74 18.2566V4.5166Z"
        fill="url(#paint17_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568V31.9967L17.8412 28.158L13.7397 18.2568Z"
        fill="url(#paint18_linear_1484_6598)"
      />
      <path
        d="M13.7396 28.4246C19.3563 28.4246 23.9094 23.8714 23.9094 18.2548C23.9094 12.6381 19.3563 8.08496 13.7396 8.08496C8.123 8.08496 3.56982 12.6381 3.56982 18.2548C3.56982 23.8714 8.123 28.4246 13.7396 28.4246Z"
        fill="url(#paint19_linear_1484_6598)"
      />
      <path
        d="M13.7397 26.8348C18.4783 26.8348 22.3197 22.9934 22.3197 18.2548C22.3197 13.5162 18.4783 9.6748 13.7397 9.6748C9.00107 9.6748 5.15967 13.5162 5.15967 18.2548C5.15967 22.9934 9.00107 26.8348 13.7397 26.8348Z"
        fill="url(#paint20_linear_1484_6598)"
      />
      <path
        d="M13.74 25.9862C18.0097 25.9862 21.4709 22.5249 21.4709 18.2553C21.4709 13.9856 18.0097 10.5244 13.74 10.5244C9.47039 10.5244 6.00916 13.9856 6.00916 18.2553C6.00916 22.5249 9.47039 25.9862 13.74 25.9862Z"
        fill="url(#paint21_linear_1484_6598)"
      />
      <path
        d="M13.7398 24.627C17.2596 24.627 20.1129 21.7737 20.1129 18.2539C20.1129 14.7342 17.2596 11.8809 13.7398 11.8809C10.22 11.8809 7.3667 14.7342 7.3667 18.2539C7.3667 21.7737 10.22 24.627 13.7398 24.627Z"
        fill="url(#paint22_linear_1484_6598)"
      />
      <path
        d="M10.336 13.97L13.15 13.13H14.62V23H12.492V15.314L10.784 15.734L10.336 13.97Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6598"
          x1="13.742"
          y1="0.47528"
          x2="13.742"
          y2="9.28259"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#1EAA1E" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6598"
          x1="10.0545"
          y1="9.012"
          x2="10.0545"
          y2="-0.0373881"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6598"
          x1="17.429"
          y1="9.012"
          x2="17.429"
          y2="-0.0373881"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6598"
          x1="9.77822"
          y1="25.1266"
          x2="13.4994"
          y2="25.1266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6598"
          x1="13.7397"
          y1="11.3866"
          x2="17.8412"
          y2="11.3866"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6598"
          x1="9.11044"
          y1="23.3968"
          x2="6.44038"
          y2="20.097"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6598"
          x1="18.9179"
          y1="13.6453"
          x2="21.9479"
          y2="15.9852"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6598"
          x1="7.69088"
          y1="15.3366"
          x2="6.61084"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6598"
          x1="20.8827"
          y1="17.3246"
          x2="19.6528"
          y2="21.5246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6598"
          x1="7.95126"
          y1="13.9549"
          x2="11.7612"
          y2="11.675"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6598"
          x1="8.49923"
          y1="22.8395"
          x2="11.7992"
          y2="25.2095"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6598"
          x1="16.2034"
          y1="11.5168"
          x2="18.7235"
          y2="13.4968"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6598"
          x1="6.61769"
          y1="17.1434"
          x2="7.63763"
          y2="21.6435"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6598"
          x1="20.0726"
          y1="15.4363"
          x2="20.6727"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6598"
          x1="9.4896"
          y1="12.377"
          x2="7.23981"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6598"
          x1="20.3161"
          y1="20.5365"
          x2="18.2762"
          y2="23.5965"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6598"
          x1="18.7606"
          y1="22.9942"
          x2="15.6707"
          y2="25.2742"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6598"
          x1="9.63879"
          y1="11.3866"
          x2="13.74"
          y2="11.3866"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6598"
          x1="13.8279"
          y1="25.1266"
          x2="17.7095"
          y2="25.1266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6598"
          x1="13.7396"
          y1="8.23919"
          x2="13.7396"
          y2="27.7237"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6598"
          x1="13.7397"
          y1="9.97906"
          x2="13.7397"
          y2="29.689"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6598"
          x1="10.3583"
          y1="11.7439"
          x2="17.1982"
          y2="24.9136"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFCB40" />
          <stop offset="1" stopColor="#F89C27" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6598"
          x1="10.5993"
          y1="12.0238"
          x2="16.4677"
          y2="23.6652"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FA8C00" />
          <stop offset="1" stopColor="#FFC017" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export function UserStakeRankingTab2(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37566L18.9881 7.59564L17.4292 8.18177L13.7419 9.56702L10.8341 8.47464L10.0547 8.18177L9.27498 7.88871L8.49549 7.59564L7.90918 7.37566V0H19.5747Z"
        fill="url(#paint0_linear_1484_6625)"
      />
      <path
        opacity="0.8"
        d="M10.8341 0V8.47464L10.0546 8.18177L9.2749 7.8887V0H10.8341Z"
        fill="url(#paint1_linear_1484_6625)"
      />
      <path
        d="M9.63904 28.157L13.7402 31.9957V18.2559L9.63904 28.157Z"
        fill="url(#paint2_linear_1484_6625)"
      />
      <path
        d="M17.8412 8.35434L13.74 4.51562V18.2557L17.8412 8.35434Z"
        fill="url(#paint3_linear_1484_6625)"
      />
      <path
        d="M3.83838 22.3571L4.02421 27.9714L13.7397 18.2559L3.83838 22.3571Z"
        fill="url(#paint4_linear_1484_6625)"
      />
      <path
        d="M23.6414 14.1544L23.4555 8.54004L13.74 18.2558L23.6414 14.1544Z"
        fill="url(#paint5_linear_1484_6625)"
      />
      <path
        d="M0 18.2557H13.7399L3.83849 14.1543L0 18.2557Z"
        fill="url(#paint6_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L23.6414 22.3571L27.4799 18.2559H13.74Z"
        fill="url(#paint7_linear_1484_6625)"
      />
      <path
        d="M9.6385 8.35352L4.02417 8.53912L13.7397 18.2549L9.6385 8.35352Z"
        fill="url(#paint8_linear_1484_6625)"
      />
      <path
        d="M4.02417 27.9714L9.6385 28.157L13.7397 18.2559L4.02417 27.9714Z"
        fill="url(#paint9_linear_1484_6625)"
      />
      <path
        d="M17.8412 8.35352L13.74 18.2549L23.4555 8.53912L17.8412 8.35352Z"
        fill="url(#paint10_linear_1484_6625)"
      />
      <path
        d="M3.83849 22.3571L13.7399 18.2559H0L3.83849 22.3571Z"
        fill="url(#paint11_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2557H27.4799L23.6414 14.1543L13.74 18.2557Z"
        fill="url(#paint12_linear_1484_6625)"
      />
      <path
        d="M3.83838 14.1544L13.7397 18.2558L4.02421 8.54004L3.83838 14.1544Z"
        fill="url(#paint13_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L23.4555 27.9714L23.6414 22.3571L13.74 18.2559Z"
        fill="url(#paint14_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L17.8412 28.157L23.4555 27.9714L13.74 18.2559Z"
        fill="url(#paint15_linear_1484_6625)"
      />
      <path
        d="M13.7402 4.51562L9.63904 8.35434L13.7402 18.2557V4.51562Z"
        fill="url(#paint16_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559V31.9957L17.8412 28.157L13.74 18.2559Z"
        fill="url(#paint17_linear_1484_6625)"
      />
      <path
        d="M13.7397 28.4246C19.3563 28.4246 23.9095 23.8714 23.9095 18.2548C23.9095 12.6381 19.3563 8.08496 13.7397 8.08496C8.12301 8.08496 3.56982 12.6381 3.56982 18.2548C3.56982 23.8714 8.12301 28.4246 13.7397 28.4246Z"
        fill="url(#paint18_linear_1484_6625)"
      />
      <path
        d="M13.7399 26.8359C18.4786 26.8359 22.32 22.9944 22.32 18.2558C22.32 13.5172 18.4786 9.67578 13.7399 9.67578C9.00132 9.67578 5.15991 13.5172 5.15991 18.2558C5.15991 22.9944 9.00132 26.8359 13.7399 26.8359Z"
        fill="url(#paint19_linear_1484_6625)"
      />
      <path
        d="M13.7401 25.9872C18.0097 25.9872 21.4709 22.5259 21.4709 18.2563C21.4709 13.9866 18.0097 10.5254 13.7401 10.5254C9.4704 10.5254 6.00916 13.9866 6.00916 18.2563C6.00916 22.5259 9.4704 25.9872 13.7401 25.9872Z"
        fill="url(#paint20_linear_1484_6625)"
      />
      <path
        d="M13.7396 24.63C17.2593 24.63 20.1127 21.7767 20.1127 18.2569C20.1127 14.7371 17.2593 11.8838 13.7396 11.8838C10.2198 11.8838 7.36646 14.7371 7.36646 18.2569C7.36646 21.7767 10.2198 24.63 13.7396 24.63Z"
        fill="url(#paint21_linear_1484_6625)"
      />
      <path
        opacity="0.8"
        d="M16.6495 0V8.47464L17.429 8.18177L18.2087 7.8887V0H16.6495Z"
        fill="url(#paint22_linear_1484_6625)"
      />
      <path
        d="M13.326 14.992C12.57 14.992 12.052 15.412 11.324 16.308L9.812 15.09C10.778 13.774 11.716 13.06 13.466 13.06C15.552 13.06 16.84 14.264 16.84 16.098C16.84 17.736 16 18.562 14.264 19.906L12.668 21.138H16.938V23H9.686V21.292L12.948 18.618C14.166 17.61 14.642 17.078 14.642 16.266C14.642 15.44 14.096 14.992 13.326 14.992Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6625"
          x1="13.4131"
          y1="1.22914"
          x2="13.4131"
          y2="1.22914"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#24B124" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6625"
          x1="10.0546"
          y1="0"
          x2="10.0546"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6625"
          x1="9.77846"
          y1="25.1257"
          x2="13.4994"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6625"
          x1="13.74"
          y1="11.3857"
          x2="17.8412"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6625"
          x1="9.11045"
          y1="23.3958"
          x2="6.44039"
          y2="20.096"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6625"
          x1="18.9182"
          y1="13.6453"
          x2="21.9482"
          y2="15.9852"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6625"
          x1="7.6909"
          y1="15.3366"
          x2="6.61086"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6625"
          x1="20.8829"
          y1="17.3236"
          x2="19.6528"
          y2="21.5236"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6625"
          x1="7.95104"
          y1="13.9539"
          x2="11.761"
          y2="11.6741"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6625"
          x1="8.49902"
          y1="22.8385"
          x2="11.799"
          y2="25.2085"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6625"
          x1="16.2037"
          y1="11.5159"
          x2="18.7235"
          y2="13.4959"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6625"
          x1="6.61748"
          y1="17.1424"
          x2="7.63743"
          y2="21.6425"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6625"
          x1="20.0729"
          y1="15.4363"
          x2="20.6728"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6625"
          x1="9.48961"
          y1="12.377"
          x2="7.23959"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6625"
          x1="20.3164"
          y1="20.5355"
          x2="18.2765"
          y2="23.5955"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6625"
          x1="18.7608"
          y1="22.9932"
          x2="15.6709"
          y2="25.2733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6625"
          x1="9.63904"
          y1="11.3857"
          x2="13.7402"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6625"
          x1="13.8282"
          y1="25.1257"
          x2="17.7097"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6625"
          x1="13.7397"
          y1="8.23919"
          x2="13.7397"
          y2="27.7237"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6625"
          x1="13.7399"
          y1="-3.10887"
          x2="13.7399"
          y2="-3.10887"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6625"
          x1="10.3583"
          y1="11.7449"
          x2="17.1983"
          y2="24.9146"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6625"
          x1="10.5991"
          y1="12.0267"
          x2="16.4673"
          y2="23.6682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6625"
          x1="17.429"
          y1="0"
          x2="17.429"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export function UserStakeRankingTab3(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37571L18.9882 7.5957L17.4293 8.18183L13.742 9.56709L10.8342 8.4747L10.0547 8.18183L9.27499 7.88876L8.4955 7.5957L7.90918 7.37571V0H19.5747Z"
        fill="url(#paint0_linear_1484_6652)"
      />
      <path
        opacity="0.8"
        d="M10.8342 0V8.4747L10.0547 8.18183L9.27502 7.88876V0H10.8342Z"
        fill="url(#paint1_linear_1484_6652)"
      />
      <path
        opacity="0.8"
        d="M16.6497 0V8.4747L17.4292 8.18183L18.2088 7.88876V0H16.6497Z"
        fill="url(#paint2_linear_1484_6652)"
      />
      <path
        d="M9.63904 28.157L13.7403 31.9958V18.2559L9.63904 28.157Z"
        fill="url(#paint3_linear_1484_6652)"
      />
      <path
        d="M17.8414 8.35435L13.74 4.51562V18.2558L17.8414 8.35435Z"
        fill="url(#paint4_linear_1484_6652)"
      />
      <path
        d="M3.83862 22.3571L4.02423 27.9714L13.7398 18.2559L3.83862 22.3571Z"
        fill="url(#paint5_linear_1484_6652)"
      />
      <path
        d="M23.6414 14.1544L23.4558 8.54004L13.74 18.2558L23.6414 14.1544Z"
        fill="url(#paint6_linear_1484_6652)"
      />
      <path
        d="M0 18.2557H13.7399L3.83873 14.1543L0 18.2557Z"
        fill="url(#paint7_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L23.6414 22.3571L27.4801 18.2559H13.74Z"
        fill="url(#paint8_linear_1484_6652)"
      />
      <path
        d="M9.63877 8.35352L4.02441 8.53912L13.74 18.2549L9.63877 8.35352Z"
        fill="url(#paint9_linear_1484_6652)"
      />
      <path
        d="M4.02441 27.9714L9.63877 28.157L13.74 18.2559L4.02441 27.9714Z"
        fill="url(#paint10_linear_1484_6652)"
      />
      <path
        d="M17.8414 8.35352L13.74 18.2549L23.4558 8.53912L17.8414 8.35352Z"
        fill="url(#paint11_linear_1484_6652)"
      />
      <path
        d="M3.83873 22.3571L13.7399 18.2559H0L3.83873 22.3571Z"
        fill="url(#paint12_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2557H27.4801L23.6414 14.1543L13.74 18.2557Z"
        fill="url(#paint13_linear_1484_6652)"
      />
      <path
        d="M3.83862 14.1544L13.7398 18.2558L4.02423 8.54004L3.83862 14.1544Z"
        fill="url(#paint14_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L23.4558 27.9714L23.6414 22.3571L13.74 18.2559Z"
        fill="url(#paint15_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L17.8414 28.157L23.4558 27.9714L13.74 18.2559Z"
        fill="url(#paint16_linear_1484_6652)"
      />
      <path
        d="M13.7403 4.51562L9.63904 8.35435L13.7403 18.2558V4.51562Z"
        fill="url(#paint17_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559V31.9958L17.8414 28.157L13.74 18.2559Z"
        fill="url(#paint18_linear_1484_6652)"
      />
      <path
        d="M13.7399 28.4267C19.3566 28.4267 23.9098 23.8734 23.9098 18.2568C23.9098 12.6401 19.3566 8.08691 13.7399 8.08691C8.12327 8.08691 3.57007 12.6401 3.57007 18.2568C3.57007 23.8734 8.12327 28.4267 13.7399 28.4267Z"
        fill="url(#paint19_linear_1484_6652)"
      />
      <path
        d="M13.74 26.8349C18.4786 26.8349 22.32 22.9935 22.32 18.2549C22.32 13.5162 18.4786 9.6748 13.74 9.6748C9.00134 9.6748 5.15991 13.5162 5.15991 18.2549C5.15991 22.9935 9.00134 26.8349 13.74 26.8349Z"
        fill="url(#paint20_linear_1484_6652)"
      />
      <path
        d="M13.7401 25.9872C18.0098 25.9872 21.471 22.526 21.471 18.2563C21.471 13.9866 18.0098 10.5254 13.7401 10.5254C9.47041 10.5254 6.00916 13.9866 6.00916 18.2563C6.00916 22.526 9.47041 25.9872 13.7401 25.9872Z"
        fill="url(#paint21_linear_1484_6652)"
      />
      <path
        d="M13.7398 24.63C17.2596 24.63 20.113 21.7767 20.113 18.2569C20.113 14.7371 17.2596 11.8838 13.7398 11.8838C10.22 11.8838 7.3667 14.7371 7.3667 18.2569C7.3667 21.7767 10.22 24.63 13.7398 24.63Z"
        fill="url(#paint22_linear_1484_6652)"
      />
      <path
        d="M13.956 15.048H10.106V13.2H16.728V14.824L14.25 17.19C15.594 17.414 16.882 18.114 16.882 19.948C16.882 21.81 15.538 23.168 13.354 23.168C11.59 23.168 10.372 22.468 9.532 21.474L11.016 20.06C11.688 20.816 12.388 21.236 13.382 21.236C14.194 21.236 14.768 20.774 14.768 20.032C14.768 19.22 14.082 18.772 12.85 18.772H11.954L11.618 17.4L13.956 15.048Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6652"
          x1="13.4131"
          y1="1.22915"
          x2="13.4131"
          y2="1.22915"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#24B124" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6652"
          x1="10.0547"
          y1="0"
          x2="10.0547"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6652"
          x1="17.4291"
          y1="0"
          x2="17.4291"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6652"
          x1="9.77846"
          y1="25.1257"
          x2="13.4996"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6652"
          x1="13.74"
          y1="11.3857"
          x2="17.8414"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6652"
          x1="9.11049"
          y1="23.3958"
          x2="6.44042"
          y2="20.096"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6652"
          x1="18.9182"
          y1="13.6453"
          x2="21.9482"
          y2="15.9853"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6652"
          x1="7.69093"
          y1="15.3366"
          x2="6.61088"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6652"
          x1="20.8832"
          y1="17.3236"
          x2="19.6531"
          y2="21.5236"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6652"
          x1="7.95152"
          y1="13.9539"
          x2="11.7615"
          y2="11.6741"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6652"
          x1="8.4995"
          y1="22.8386"
          x2="11.7995"
          y2="25.2086"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6652"
          x1="16.2037"
          y1="11.5159"
          x2="18.7237"
          y2="13.4959"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6652"
          x1="6.61773"
          y1="17.1424"
          x2="7.63768"
          y2="21.6425"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6652"
          x1="20.0731"
          y1="15.4363"
          x2="20.673"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6652"
          x1="9.48966"
          y1="12.377"
          x2="7.23985"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6652"
          x1="20.3166"
          y1="20.5355"
          x2="18.2765"
          y2="23.5956"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6652"
          x1="18.7611"
          y1="22.9932"
          x2="15.671"
          y2="25.2733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6652"
          x1="9.63904"
          y1="11.3857"
          x2="13.7403"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6652"
          x1="13.8282"
          y1="25.1257"
          x2="17.7097"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6652"
          x1="13.7399"
          y1="8.24114"
          x2="13.7399"
          y2="27.7258"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6652"
          x1="13.74"
          y1="9.97907"
          x2="13.74"
          y2="29.6891"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6652"
          x1="10.3583"
          y1="11.7449"
          x2="17.1983"
          y2="24.9147"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6652"
          x1="10.5993"
          y1="12.0267"
          x2="16.4678"
          y2="23.6682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserStakeRankingMobileTab1(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/UserStakeRankingMobileTab1.png"
      alt=""
      style={{ width: "26px", height: "30px" }}
    />
  );
}

export function UserStakeRankingMobileTab2(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/UserStakeRankingMobileTab2.png"
      alt=""
      style={{ width: "26px", height: "30px" }}
    />
  );
}

export function UserStakeRankingMobileTab3(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/UserStakeRankingMobileTab3.png"
      alt=""
      style={{ width: "26px", height: "30px" }}
    />
  );
}

export function UserStakeRankingPrevious({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.53032 8.46967C6.82322 8.76256 6.82322 9.23744 6.53032 9.53033C6.23743 9.82322 5.76256 9.82322 5.46966 9.53033L1.46966 5.53033L0.939331 5L1.46966 4.46967L5.46966 0.46967C5.76256 0.176777 6.23743 0.176777 6.53032 0.46967C6.82322 0.762563 6.82322 1.23744 6.53032 1.53033L3.06065 5L6.53032 8.46967ZM11.5303 8.46967C11.8232 8.76256 11.8232 9.23744 11.5303 9.53033C11.2374 9.82322 10.7626 9.82322 10.4697 9.53033L6.46966 5.53033L5.93933 5L6.46966 4.46967L10.4697 0.46967C10.7626 0.176777 11.2374 0.176777 11.5303 0.46967C11.8232 0.762563 11.8232 1.23744 11.5303 1.53033L8.06065 5L11.5303 8.46967Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingNext({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.46967 8.46967C0.176777 8.76256 0.176777 9.23744 0.46967 9.53033C0.762563 9.82322 1.23744 9.82322 1.53033 9.53033L5.53033 5.53033L6.06066 5L5.53033 4.46967L1.53033 0.46967C1.23744 0.176777 0.762563 0.176777 0.46967 0.46967C0.176777 0.762563 0.176777 1.23744 0.46967 1.53033L3.93934 5L0.46967 8.46967ZM5.46967 8.46967C5.17678 8.76256 5.17678 9.23744 5.46967 9.53033C5.76256 9.82322 6.23744 9.82322 6.53033 9.53033L10.5303 5.53033L11.0607 5L10.5303 4.46967L6.53033 0.46967C6.23744 0.176777 5.76256 0.176777 5.46967 0.46967C5.17678 0.762563 5.17678 1.23744 5.46967 1.53033L8.93934 5L5.46967 8.46967Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingFirst({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.81067 9C1.81067 9.41421 1.47488 9.75 1.06067 9.75C0.646455 9.75 0.310669 9.41421 0.310669 9V1C0.310669 0.585787 0.646456 0.25 1.06067 0.25C1.47488 0.25 1.81067 0.585787 1.81067 1L1.81067 9ZM5.12133 5L8.591 8.46967C8.88389 8.76256 8.88389 9.23744 8.591 9.53033C8.29811 9.82322 7.82323 9.82322 7.53034 9.53033L3.53034 5.53033L3.00001 5L3.53034 4.46967L7.53034 0.46967C7.82323 0.176777 8.29811 0.176777 8.591 0.46967C8.88389 0.762563 8.88389 1.23744 8.591 1.53033L5.12133 5Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingLast({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.31055 9C7.31055 9.41421 7.64633 9.75 8.06055 9.75C8.47476 9.75 8.81055 9.41421 8.81055 9V1C8.81055 0.585787 8.47476 0.25 8.06055 0.25C7.64633 0.25 7.31055 0.585787 7.31055 1L7.31055 9ZM3.99989 5L0.530217 8.46967C0.237324 8.76256 0.237324 9.23744 0.530217 9.53033C0.82311 9.82322 1.29798 9.82322 1.59088 9.53033L5.59088 5.53033L6.12121 5L5.59088 4.46967L1.59088 0.46967C1.29798 0.176777 0.82311 0.176777 0.530216 0.46967C0.237323 0.762563 0.237323 1.23744 0.530216 1.53033L3.99989 5Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingPopupDown({ ...props }) {
  return (
    <svg
      {...props}
      width="13"
      height="7"
      viewBox="0 0 13 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 1L6.5 5.4L1 1" stroke="white" strokeWidth="1.58" />
    </svg>
  );
}

export function Goback() {
  return (
    <svg
      width="11"
      height="19"
      viewBox="0 0 11 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1392 0.0429687L10.1392 2.95964L3.72495 9.28561L10.1392 15.6471L10.1392 18.5283L0.896517 9.28561L10.1392 0.0429687Z"
        fill="white"
      />
    </svg>
  );
}

export function MemeRightArrow() {
  return (
    <svg
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3536 4.35355C12.5488 4.15829 12.5488 3.84171 12.3536 3.64645L9.17157 0.464466C8.97631 0.269204 8.65973 0.269204 8.46447 0.464466C8.2692 0.659728 8.2692 0.976311 8.46447 1.17157L11.2929 4L8.46447 6.82843C8.2692 7.02369 8.2692 7.34027 8.46447 7.53553C8.65973 7.7308 8.97631 7.7308 9.17157 7.53553L12.3536 4.35355ZM0 4.5H12V3.5H0V4.5Z"
        fill="white"
      />
    </svg>
  );
}

export function MemeEllipsis() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_11_2)">
        <path
          d="M10 19.375C15.1777 19.375 19.375 15.1777 19.375 10C19.375 4.82233 15.1777 0.625 10 0.625C4.82233 0.625 0.625 4.82233 0.625 10C0.625 15.1777 4.82233 19.375 10 19.375Z"
          fill="#0C171F"
          stroke="#9EFE01"
        />
        <path
          d="M10 19.375C15.1777 19.375 19.375 15.1777 19.375 10C19.375 4.82233 15.1777 0.625 10 0.625C4.82233 0.625 0.625 4.82233 0.625 10C0.625 15.1777 4.82233 19.375 10 19.375Z"
          fill="#0F1A22"
          stroke="#26323C"
        />
        <path
          d="M5.55447 11.1114C6.16812 11.1114 6.66558 10.6139 6.66558 10.0003C6.66558 9.38662 6.16812 8.88916 5.55447 8.88916C4.94082 8.88916 4.44336 9.38662 4.44336 10.0003C4.44336 10.6139 4.94082 11.1114 5.55447 11.1114Z"
          fill="#91A2AE"
        />
        <path
          d="M9.99905 11.1114C10.6127 11.1114 11.1102 10.6139 11.1102 10.0003C11.1102 9.38662 10.6127 8.88916 9.99905 8.88916C9.3854 8.88916 8.88794 9.38662 8.88794 10.0003C8.88794 10.6139 9.3854 11.1114 9.99905 11.1114Z"
          fill="#91A2AE"
        />
        <path
          d="M14.4424 11.1114C15.0561 11.1114 15.5535 10.6139 15.5535 10.0003C15.5535 9.38662 15.0561 8.88916 14.4424 8.88916C13.8288 8.88916 13.3313 9.38662 13.3313 10.0003C13.3313 10.6139 13.8288 11.1114 14.4424 11.1114Z"
          fill="#91A2AE"
        />
      </g>
      <defs>
        <clipPath id="clip0_11_2">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AcquireXREFIcon() {
  return (
    <svg
      width="12"
      height="11"
      viewBox="0 0 12 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 10L11 1M11 1H4.33333M11 1V7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AirdropMobileArrowIcon() {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.928931 5.98513L15.0711 5.98513M15.0711 5.98513L10.357 1.27109M15.0711 5.98513L10.357 10.6992"
        stroke="#9EFF00"
        strokeWidth="2"
      />
    </svg>
  );
}

export function XREFStakingDetails() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 11.5H2C1.17157 11.5 0.5 10.8284 0.5 10V2C0.5 1.17157 1.17157 0.5 2 0.5H9C9.82843 0.5 10.5 1.17157 10.5 2V6.85714V10C10.5 10.8284 9.82843 11.5 9 11.5Z"
        stroke="white"
      />
      <line x1="2.5" y1="4.5" x2="7.5" y2="4.5" stroke="white" />
      <line x1="2.5" y1="7.5" x2="5.5" y2="7.5" stroke="white" />
    </svg>
  );
}

export function MemeFinalistToken({ ...props }) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/MemeFinalistToken.png"
      alt=""
    />
  );
}

export function ChartLoading() {
  return (
    <div className="inner-loader active">
      <svg
        width="50px"
        height="50px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        className="lds-eclipse"
        style={{ background: "none" }}
      >
        <path
          // eslint-disable-next-line react/no-unknown-property
          ng-attr-d="{{config.pathCmd}}"
          // eslint-disable-next-line react/no-unknown-property
          ng-attr-fill="{{config.color}}"
          stroke="none"
          d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50"
          fill="#10B981"
        ></path>
      </svg>
    </div>
  );
}

export function CloseIconWithCircle({
  width,
  height,
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="11" fill="#061824" />
      <circle cx="11" cy="11" r="10.5" stroke="white" strokeOpacity="0.3" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.91679 13.5218C6.51406 13.9245 6.51406 14.5775 6.91679 14.9802C7.31952 15.383 7.97247 15.383 8.3752 14.9802L11.2921 12.0633L14.2091 14.9802C14.6118 15.383 15.2648 15.383 15.6675 14.9802C16.0702 14.5775 16.0702 13.9245 15.6675 13.5218L12.7505 10.6049L15.6672 7.68819C16.07 7.28546 16.07 6.63251 15.6672 6.22978C15.2645 5.82705 14.6116 5.82705 14.2088 6.22978L11.2921 9.14647L8.37545 6.22978C7.97272 5.82705 7.31977 5.82705 6.91705 6.22978C6.51432 6.63251 6.51432 7.28546 6.91705 7.68819L9.83373 10.6049L6.91679 13.5218Z"
        fill="#7E8A93"
      />
    </svg>
  );
}

export function NoDataIcon() {
  return (
    <svg
      width="120"
      height="111"
      viewBox="0 0 120 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="62.7519"
        cy="73.7613"
        rx="44.0366"
        ry="13.211"
        fill="url(#paint0_linear_13858_1144)"
      />
      <mask
        id="mask0_13858_1144"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="26"
        y="26"
        width="77"
        height="61"
      >
        <rect
          x="26.4219"
          y="26.4219"
          width="75.9632"
          height="60.5503"
          fill="#C4C4C4"
        />
      </mask>
      <g mask="url(#mask0_13858_1144)">
        <mask
          id="path-3-outside-1_13858_1144"
          maskUnits="userSpaceOnUse"
          x="26.9404"
          y="30.4963"
          width="72.3924"
          height="70.8149"
          fill="black"
        >
          <rect
            fill="white"
            x="26.9404"
            y="30.4963"
            width="72.3924"
            height="70.8149"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M28.3068 44.2039C28.2005 43.662 28.5536 43.1365 29.0955 43.0301L45.3749 39.8359C45.9169 39.7296 46.4424 40.0827 46.5487 40.6246L48.7114 51.6468C48.8829 52.521 47.9119 53.1662 47.1724 52.6693L44.551 50.9079C44.0926 50.5999 43.4713 50.7218 43.1632 51.1802L34.0705 64.7123C33.5736 65.4517 32.4307 65.2213 32.2591 64.3471L28.3068 44.2039ZM44.6818 58.9196C44.9898 58.4612 45.6111 58.3393 46.0696 58.6473L50.351 61.5242C50.5711 61.6721 50.7235 61.9014 50.7746 62.1617L57.2595 95.212C57.3658 95.754 57.0127 96.2795 56.4707 96.3859L40.1914 99.5801C39.6494 99.6864 39.1239 99.3333 39.0175 98.7913L34.3223 74.862C34.2712 74.6017 34.3256 74.3318 34.4736 74.1117L44.6818 58.9196ZM64.7899 37.0458C64.6835 36.5038 64.158 36.1507 63.616 36.257L49.1609 39.0933C48.6189 39.1997 48.2658 39.7252 48.3721 40.2671L51.278 55.0767C51.329 55.3369 51.4814 55.5663 51.7015 55.7142L59.3699 60.8669C59.8164 61.1669 60.4202 61.06 60.7365 60.625L67.3154 51.5766C67.4789 51.3517 67.5414 51.0688 67.4878 50.7959L64.7899 37.0458ZM69.4787 60.9423C69.3106 60.0854 68.2021 59.8405 67.6886 60.5467L62.0868 68.2513C61.7705 68.6863 61.1667 68.7932 60.7202 68.4932L54.8801 64.569C54.1407 64.0721 53.1696 64.7174 53.3411 65.5916L59.0829 94.8545C59.1892 95.3965 59.7148 95.7496 60.2567 95.6433L74.7119 92.807C75.2538 92.7007 75.607 92.1751 75.5006 91.6332L69.4787 60.9423ZM73.0403 69.4304C73.1407 69.9418 73.6246 70.2877 74.1359 70.1874V70.1874C83.7069 68.3095 89.9433 59.0282 88.0654 49.4572C87.392 46.0252 85.7666 43.0219 83.5173 40.6678C83.1041 40.2354 82.4072 40.3056 82.0555 40.7894L70.7872 56.2875C70.6236 56.5124 70.5611 56.7953 70.6147 57.0681L73.0403 69.4304ZM68.6238 46.9218C68.792 47.7786 69.9005 48.0236 70.4139 47.3173L77.3491 37.7789C77.7207 37.2678 77.531 36.5428 76.9395 36.3203C73.9744 35.2047 70.6724 34.8729 67.3352 35.5277V35.5277C66.8239 35.6281 66.5066 36.1313 66.6069 36.6426L68.6238 46.9218ZM97.4046 86.6147C98.1441 87.1116 97.9137 88.2545 97.0394 88.426L78.4995 92.0638C77.9575 92.1702 77.432 91.817 77.3256 91.2751L73.6878 72.7351C73.5163 71.8609 74.4874 71.2156 75.2269 71.7125L97.4046 86.6147Z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.3068 44.2039C28.2005 43.662 28.5536 43.1365 29.0955 43.0301L45.3749 39.8359C45.9169 39.7296 46.4424 40.0827 46.5487 40.6246L48.7114 51.6468C48.8829 52.521 47.9119 53.1662 47.1724 52.6693L44.551 50.9079C44.0926 50.5999 43.4713 50.7218 43.1632 51.1802L34.0705 64.7123C33.5736 65.4517 32.4307 65.2213 32.2591 64.3471L28.3068 44.2039ZM44.6818 58.9196C44.9898 58.4612 45.6111 58.3393 46.0696 58.6473L50.351 61.5242C50.5711 61.6721 50.7235 61.9014 50.7746 62.1617L57.2595 95.212C57.3658 95.754 57.0127 96.2795 56.4707 96.3859L40.1914 99.5801C39.6494 99.6864 39.1239 99.3333 39.0175 98.7913L34.3223 74.862C34.2712 74.6017 34.3256 74.3318 34.4736 74.1117L44.6818 58.9196ZM64.7899 37.0458C64.6835 36.5038 64.158 36.1507 63.616 36.257L49.1609 39.0933C48.6189 39.1997 48.2658 39.7252 48.3721 40.2671L51.278 55.0767C51.329 55.3369 51.4814 55.5663 51.7015 55.7142L59.3699 60.8669C59.8164 61.1669 60.4202 61.06 60.7365 60.625L67.3154 51.5766C67.4789 51.3517 67.5414 51.0688 67.4878 50.7959L64.7899 37.0458ZM69.4787 60.9423C69.3106 60.0854 68.2021 59.8405 67.6886 60.5467L62.0868 68.2513C61.7705 68.6863 61.1667 68.7932 60.7202 68.4932L54.8801 64.569C54.1407 64.0721 53.1696 64.7174 53.3411 65.5916L59.0829 94.8545C59.1892 95.3965 59.7148 95.7496 60.2567 95.6433L74.7119 92.807C75.2538 92.7007 75.607 92.1751 75.5006 91.6332L69.4787 60.9423ZM73.0403 69.4304C73.1407 69.9418 73.6246 70.2877 74.1359 70.1874V70.1874C83.7069 68.3095 89.9433 59.0282 88.0654 49.4572C87.392 46.0252 85.7666 43.0219 83.5173 40.6678C83.1041 40.2354 82.4072 40.3056 82.0555 40.7894L70.7872 56.2875C70.6236 56.5124 70.5611 56.7953 70.6147 57.0681L73.0403 69.4304ZM68.6238 46.9218C68.792 47.7786 69.9005 48.0236 70.4139 47.3173L77.3491 37.7789C77.7207 37.2678 77.531 36.5428 76.9395 36.3203C73.9744 35.2047 70.6724 34.8729 67.3352 35.5277V35.5277C66.8239 35.6281 66.5066 36.1313 66.6069 36.6426L68.6238 46.9218ZM97.4046 86.6147C98.1441 87.1116 97.9137 88.2545 97.0394 88.426L78.4995 92.0638C77.9575 92.1702 77.432 91.817 77.3256 91.2751L73.6878 72.7351C73.5163 71.8609 74.4874 71.2156 75.2269 71.7125L97.4046 86.6147Z"
          fill="url(#paint1_linear_13858_1144)"
        />
        <path
          d="M77.3256 91.2751L76.3443 91.4676L77.3256 91.2751ZM70.4139 47.3173L69.6051 46.7293L70.4139 47.3173ZM77.3491 37.7789L76.5403 37.1909L77.3491 37.7789ZM76.9395 36.3203L76.5874 37.2562L76.9395 36.3203ZM73.0403 69.4304L72.059 69.623L73.0403 69.4304ZM75.5006 91.6332L74.5193 91.8257L75.5006 91.6332ZM54.8801 64.569L55.4379 63.739L54.8801 64.569ZM67.6886 60.5467L68.4974 61.1348L67.6886 60.5467ZM69.4787 60.9423L70.46 60.7497L69.4787 60.9423ZM62.0868 68.2513L61.278 67.6632L62.0868 68.2513ZM60.7202 68.4932L61.278 67.6632L60.7202 68.4932ZM67.3154 51.5766L68.1242 52.1646L67.3154 51.5766ZM67.4878 50.7959L68.4691 50.6034L67.4878 50.7959ZM59.3699 60.8669L59.9277 60.0369L59.3699 60.8669ZM60.7365 60.625L61.5453 61.213L60.7365 60.625ZM51.7015 55.7142L52.2593 54.8842L51.7015 55.7142ZM64.7899 37.0458L65.7712 36.8532L64.7899 37.0458ZM34.4736 74.1117L33.6435 73.554L34.4736 74.1117ZM46.0696 58.6473L45.5118 59.4773L46.0696 58.6473ZM44.6818 58.9196L45.5118 59.4773L44.6818 58.9196ZM50.351 61.5242L50.9087 60.6942L50.351 61.5242ZM34.0705 64.7123L34.9005 65.27L34.0705 64.7123ZM48.7114 51.6468L47.7301 51.8393L48.7114 51.6468ZM70.7872 56.2875L69.9783 55.6994L70.7872 56.2875ZM70.6147 57.0681L71.596 56.8756L70.6147 57.0681ZM83.5173 40.6678L82.7943 41.3587L83.5173 40.6678ZM46.5487 40.6246L45.5674 40.8172L46.5487 40.6246ZM45.1824 38.8546L28.903 42.0488L29.2881 44.0114L45.5674 40.8172L45.1824 38.8546ZM49.6927 51.4542L47.53 40.4321L45.5674 40.8172L47.7301 51.8393L49.6927 51.4542ZM43.9933 51.7379L46.6147 53.4994L47.7301 51.8393L45.1087 50.0779L43.9933 51.7379ZM34.9005 65.27L43.9933 51.7379L42.3332 50.6225L33.2404 64.1545L34.9005 65.27ZM27.3255 44.3965L31.2778 64.5396L33.2404 64.1545L29.2881 44.0114L27.3255 44.3965ZM50.9087 60.6942L46.6273 57.8173L45.5118 59.4773L49.7933 62.3542L50.9087 60.6942ZM58.2408 95.0195L51.7559 61.9691L49.7933 62.3542L56.2782 95.4046L58.2408 95.0195ZM40.3839 100.561L56.6633 97.3672L56.2782 95.4046L39.9988 98.5988L40.3839 100.561ZM33.341 75.0545L38.0363 98.9839L39.9988 98.5988L35.3036 74.6694L33.341 75.0545ZM43.8518 58.3619L33.6435 73.554L35.3036 74.6694L45.5118 59.4773L43.8518 58.3619ZM49.3534 40.0746L63.8086 37.2383L63.4235 35.2757L48.9683 38.112L49.3534 40.0746ZM52.2593 54.8842L49.3534 40.0746L47.3909 40.4597L50.2967 55.2692L52.2593 54.8842ZM59.9277 60.0369L52.2593 54.8842L51.1438 56.5442L58.8122 61.6969L59.9277 60.0369ZM66.5065 50.9885L59.9277 60.0369L61.5453 61.213L68.1242 52.1646L66.5065 50.9885ZM63.8086 37.2383L66.5065 50.9885L68.4691 50.6034L65.7712 36.8532L63.8086 37.2383ZM62.8956 68.8394L68.4974 61.1348L66.8798 59.9587L61.278 67.6632L62.8956 68.8394ZM54.3224 65.3991L60.1625 69.3233L61.278 67.6632L55.4379 63.739L54.3224 65.3991ZM60.0642 94.662L54.3224 65.3991L52.3598 65.7841L58.1016 95.0471L60.0642 94.662ZM74.5193 91.8257L60.0642 94.662L60.4493 96.6246L74.9044 93.7883L74.5193 91.8257ZM68.4974 61.1348L74.5193 91.8257L76.4819 91.4406L70.46 60.7497L68.4974 61.1348ZM87.0841 49.6498C88.8557 58.6788 82.9724 67.4345 73.9434 69.2061L74.3284 71.1687C84.4414 69.1844 91.031 59.3776 89.0467 49.2647L87.0841 49.6498ZM82.7943 41.3587C84.9157 43.5788 86.4485 46.4106 87.0841 49.6498L89.0467 49.2647C88.3354 45.6398 86.6176 42.465 84.2403 39.977L82.7943 41.3587ZM71.596 56.8756L82.8643 41.3775L81.2466 40.2013L69.9783 55.6994L71.596 56.8756ZM74.0216 69.2379L71.596 56.8756L69.6334 57.2607L72.059 69.623L74.0216 69.2379ZM76.5403 37.1909L69.6051 46.7293L71.2228 47.9054L78.1579 38.367L76.5403 37.1909ZM67.5278 36.509C70.6775 35.891 73.791 36.2041 76.5874 37.2562L77.2917 35.3843C74.1577 34.2052 70.6673 33.8549 67.1427 34.5465L67.5278 36.509ZM69.6051 46.7293L67.5882 36.4501L65.6256 36.8351L67.6426 47.1143L69.6051 46.7293ZM78.692 93.0451L97.232 89.4073L96.8469 87.4447L78.3069 91.0825L78.692 93.0451ZM72.7066 72.9276L76.3443 91.4676L78.3069 91.0825L74.6691 72.5425L72.7066 72.9276ZM97.9624 85.7847L75.7846 70.8825L74.6691 72.5425L96.8469 87.4447L97.9624 85.7847ZM74.6691 72.5425L74.6691 72.5425L75.7846 70.8825C74.3057 69.8887 72.3635 71.1792 72.7066 72.9276L74.6691 72.5425ZM97.232 89.4073C98.9805 89.0643 99.4413 86.7785 97.9624 85.7847L96.8469 87.4447L96.8469 87.4447L97.232 89.4073ZM78.3069 91.0825L78.3069 91.0825L76.3443 91.4676C76.557 92.5515 77.6081 93.2578 78.692 93.0451L78.3069 91.0825ZM67.1427 34.5465C66.0565 34.7596 65.4255 35.8154 65.6256 36.8351L67.5882 36.4501C67.5889 36.4533 67.5888 36.4626 67.5816 36.4738C67.5778 36.4796 67.5713 36.4873 67.5607 36.4946C67.5494 36.5024 67.5373 36.5072 67.5278 36.509L67.1427 34.5465ZM69.6051 46.7293L69.6051 46.7293L67.6426 47.1143C67.9788 48.828 70.1958 49.3178 71.2228 47.9054L69.6051 46.7293ZM78.1579 38.367C78.8875 37.3635 78.5489 35.8573 77.2917 35.3843L76.5874 37.2562C76.5815 37.254 76.5688 37.2468 76.5573 37.2339C76.5471 37.2223 76.5428 37.2119 76.5411 37.206C76.5396 37.2003 76.5397 37.1961 76.5402 37.1932C76.5409 37.1891 76.5423 37.188 76.5403 37.1909L78.1579 38.367ZM73.9434 69.2061C73.9529 69.2042 73.9659 69.204 73.9793 69.207C73.9918 69.2098 74.0008 69.2144 74.0065 69.2184C74.0174 69.226 74.021 69.2346 74.0216 69.2379L72.059 69.623C72.2591 70.6427 73.2422 71.3818 74.3284 71.1687L73.9434 69.2061ZM74.9044 93.7883C75.9883 93.5756 76.6946 92.5245 76.4819 91.4406L74.5193 91.8257L74.5193 91.8257L74.9044 93.7883ZM58.1016 95.0471C58.3143 96.131 59.3654 96.8373 60.4493 96.6246L60.0642 94.662L60.0642 94.662L58.1016 95.0471ZM55.4379 63.739C53.9589 62.7452 52.0168 64.0357 52.3598 65.7841L54.3224 65.3991L54.3224 65.3991L55.4379 63.739ZM68.4974 61.1348L68.4974 61.1348L70.46 60.7497C70.1237 59.0361 67.9067 58.5462 66.8798 59.9587L68.4974 61.1348ZM61.278 67.6632L61.278 67.6632L60.1625 69.3233C61.0554 69.9233 62.263 69.7095 62.8956 68.8394L61.278 67.6632ZM68.1242 52.1646C68.4512 51.7148 68.5762 51.1491 68.4691 50.6034L66.5065 50.9885L66.5065 50.9885L68.1242 52.1646ZM58.8122 61.6969C59.7051 62.2969 60.9127 62.0831 61.5453 61.213L59.9277 60.0369L59.9277 60.0369L58.8122 61.6969ZM50.2967 55.2692C50.3988 55.7897 50.7035 56.2484 51.1438 56.5442L52.2593 54.8842L52.2593 54.8842L50.2967 55.2692ZM63.8086 37.2383L63.8086 37.2383L65.7712 36.8532C65.5585 35.7693 64.5074 35.0631 63.4235 35.2757L63.8086 37.2383ZM48.9683 38.112C47.8844 38.3247 47.1782 39.3758 47.3909 40.4597L49.3534 40.0746L49.3534 40.0746L48.9683 38.112ZM35.3036 74.6694L35.3036 74.6694L33.6435 73.554C33.3477 73.9943 33.2389 74.534 33.341 75.0545L35.3036 74.6694ZM39.9988 98.5988L39.9988 98.5988L38.0363 98.9839C38.2489 100.068 39.3 100.774 40.3839 100.561L39.9988 98.5988ZM56.2782 95.4046L56.2782 95.4046L56.6633 97.3672C57.7472 97.1545 58.4534 96.1034 58.2408 95.0195L56.2782 95.4046ZM46.6273 57.8173C45.7105 57.2012 44.4678 57.445 43.8518 58.3619L45.5118 59.4773L45.5118 59.4773L46.6273 57.8173ZM49.7933 62.3542L49.7933 62.3542L51.7559 61.9691C51.6537 61.4486 51.349 60.99 50.9087 60.6942L49.7933 62.3542ZM33.2404 64.1545L33.2404 64.1545L31.2778 64.5396C31.6209 66.2881 33.9067 66.7489 34.9005 65.27L33.2404 64.1545ZM45.1087 50.0779C44.1919 49.4618 42.9493 49.7057 42.3332 50.6225L43.9933 51.7379L43.9933 51.7379L45.1087 50.0779ZM47.7301 51.8393L47.7301 51.8393L46.6147 53.4994C48.0936 54.4931 50.0358 53.2027 49.6927 51.4542L47.7301 51.8393ZM69.9783 55.6994C69.6513 56.1493 69.5263 56.7149 69.6334 57.2607L71.596 56.8756L71.596 56.8756L69.9783 55.6994ZM28.903 42.0488C27.8191 42.2615 27.1128 43.3126 27.3255 44.3965L29.2881 44.0114L29.2881 44.0114L28.903 42.0488ZM84.2403 39.977C83.3654 39.0613 81.9385 39.2497 81.2466 40.2013L82.8643 41.3775C82.8659 41.3753 82.8622 41.3802 82.8518 41.3811C82.8463 41.3816 82.8364 41.3812 82.8237 41.3766C82.8095 41.3715 82.799 41.3636 82.7943 41.3587L84.2403 39.977ZM45.5674 40.8172L45.5674 40.8172L47.53 40.4321C47.3173 39.3482 46.2663 38.6419 45.1824 38.8546L45.5674 40.8172Z"
          fill="black"
          mask="url(#path-3-outside-1_13858_1144)"
        />
        <path
          d="M86.518 27.4643L77.099 29.3124C75.7876 29.5697 75.442 31.2841 76.5512 32.0294L87.8184 39.6003C88.9276 40.3456 90.3842 39.3778 90.1269 38.0664L88.2788 28.6474C88.1192 27.8345 87.3309 27.3048 86.518 27.4643Z"
          fill="#73818B"
          stroke="black"
        />
      </g>
      <mask id="path-6-inside-2_13858_1144" fill="white">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M62.7521 86.9726C87.0729 86.9726 106.789 81.0578 106.789 73.7616C106.789 71.8121 105.381 69.9612 102.854 68.2954C110.921 72.2332 120 80.8394 120 84.7713C120 94.4996 94.369 102.386 62.752 102.386C31.135 102.386 5.50439 94.4996 5.50439 84.7713C5.50439 81.1286 13.6784 73.4739 21.3667 69.2363C19.6513 70.6479 18.7155 72.172 18.7155 73.7616C18.7155 81.0578 38.4314 86.9726 62.7521 86.9726Z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62.7521 86.9726C87.0729 86.9726 106.789 81.0578 106.789 73.7616C106.789 71.8121 105.381 69.9612 102.854 68.2954C110.921 72.2332 120 80.8394 120 84.7713C120 94.4996 94.369 102.386 62.752 102.386C31.135 102.386 5.50439 94.4996 5.50439 84.7713C5.50439 81.1286 13.6784 73.4739 21.3667 69.2363C19.6513 70.6479 18.7155 72.172 18.7155 73.7616C18.7155 81.0578 38.4314 86.9726 62.7521 86.9726Z"
        fill="#31373B"
      />
      <path
        d="M102.854 68.2954L103.293 67.3968L102.304 69.1303L102.854 68.2954ZM21.3667 69.2363L22.0022 70.0085L20.884 68.3606L21.3667 69.2363ZM105.789 73.7616C105.789 75.1008 104.88 76.5774 102.75 78.0882C100.645 79.5806 97.5359 80.9656 93.6033 82.1453C85.751 84.501 74.8432 85.9726 62.7521 85.9726V87.9726C74.9818 87.9726 86.0922 86.4867 94.178 84.061C98.2146 82.85 101.554 81.3882 103.907 79.7195C106.233 78.0693 107.789 76.0704 107.789 73.7616H105.789ZM102.304 69.1303C104.744 70.739 105.789 72.3283 105.789 73.7616H107.789C107.789 71.2958 106.018 69.1833 103.405 67.4605L102.304 69.1303ZM121 84.7713C121 83.4674 120.277 81.9772 119.279 80.5253C118.251 79.0306 116.814 77.411 115.143 75.8129C111.804 72.6188 107.434 69.4182 103.293 67.3968L102.416 69.1941C106.341 71.1104 110.544 74.1818 113.761 77.2582C115.368 78.7953 116.704 80.3106 117.631 81.6584C118.587 83.0491 119 84.1092 119 84.7713H121ZM62.752 103.386C78.6317 103.386 93.0473 101.407 103.526 98.1825C108.76 96.5722 113.068 94.6344 116.089 92.4363C119.089 90.2542 121 87.6766 121 84.7713H119C119 86.7301 117.707 88.7864 114.912 90.819C112.14 92.8357 108.064 94.6936 102.938 96.2709C92.6974 99.4219 78.4893 101.386 62.752 101.386V103.386ZM4.50439 84.7713C4.50439 87.6766 6.41527 90.2542 9.41492 92.4363C12.4365 94.6344 16.7444 96.5722 21.9777 98.1825C32.4567 101.407 46.8723 103.386 62.752 103.386V101.386C47.0147 101.386 32.8065 99.4219 22.5659 96.2709C17.4395 94.6936 13.3637 92.8357 10.5915 90.819C7.79734 88.7864 6.50439 86.7301 6.50439 84.7713H4.50439ZM20.884 68.3606C16.9597 70.5235 12.9234 73.5498 9.85811 76.5072C8.32577 77.9856 7.01341 79.4683 6.07629 80.8385C5.16623 82.1692 4.50439 83.5435 4.50439 84.7713H6.50439C6.50439 84.1777 6.8643 83.2292 7.72712 81.9676C8.56288 80.7456 9.77454 79.3669 11.2467 77.9465C14.1905 75.1065 18.0854 72.1867 21.8494 70.1121L20.884 68.3606ZM19.7155 73.7616C19.7155 72.5957 20.3999 71.327 22.0022 70.0085L20.7313 68.4642C18.9027 69.9689 17.7155 71.7483 17.7155 73.7616H19.7155ZM62.7521 85.9726C50.661 85.9726 39.7532 84.501 31.9009 82.1453C27.9683 80.9656 24.8588 79.5806 22.7546 78.0882C20.6245 76.5774 19.7155 75.1008 19.7155 73.7616H17.7155C17.7155 76.0704 19.2709 78.0693 21.5976 79.7195C23.9502 81.3882 27.2896 82.85 31.3262 84.061C39.412 86.4867 50.5225 87.9726 62.7521 87.9726V85.9726Z"
        fill="url(#paint2_linear_13858_1144)"
        mask="url(#path-6-inside-2_13858_1144)"
      />
      <path
        d="M92.4111 70.4585C88.4478 70.4585 75.3472 71.0093 75.3472 71.0093L82.5031 75.9634L87.4572 76.5136C91.9417 75.1579 90.2093 74.3117 90.2093 74.3117L99.5671 76.5136C97.9157 72.11 96.3744 70.4585 92.4111 70.4585Z"
        fill="#73818B"
        stroke="black"
      />
      <path
        d="M97.105 75.2125C102.917 77.0266 100.676 81.9438 99.2922 83.1593C98.0865 82.3837 95.9129 78.9801 93.493 78.6266C91.0731 78.2731 88.4238 79.3542 87.3595 80.0733C87.0962 79.7033 86.6608 78.5408 87.0263 76.8506C87.483 74.7378 89.8398 72.945 97.105 75.2125Z"
        fill="white"
        stroke="black"
      />
      <path
        d="M85.0072 92.8749C83.5989 92.1862 81.854 91.4621 81.6041 89.2745C81.2918 86.54 79.6543 84.3006 81.2544 82.7882C82.8546 81.2757 89.2114 76.7821 93.8365 78.47C98.4616 80.1578 103.333 86.9146 102.067 90.3834C100.801 93.8522 100.336 96.5649 94.8447 97.9677C91.375 98.8542 90.238 98.0082 90.1106 97.4272C89.745 98.9317 88.9033 102.041 88.4661 103.239C87.623 105.551 86.0006 107.842 83.2872 107.377C80.5755 106.912 82.6408 102.686 83.9287 98.4387C84.3775 96.9589 84.7517 94.8541 85.0072 92.8749Z"
        fill="white"
      />
      <path
        d="M85.0072 92.8749C83.5989 92.1862 81.854 91.4621 81.6041 89.2745C81.2918 86.54 79.6543 84.3006 81.2544 82.7882C82.8546 81.2757 89.2114 76.7821 93.8365 78.47C98.4616 80.1578 103.333 86.9146 102.067 90.3834C100.801 93.8522 100.336 96.5649 94.8447 97.9677C90.452 99.09 89.7982 97.4355 90.1983 97.0574C89.9023 98.347 88.9433 101.931 88.4661 103.239C87.623 105.551 86.0006 107.842 83.2872 107.377C80.5755 106.912 82.6408 102.686 83.9287 98.4387C84.7371 95.7731 85.3036 91.0798 85.3698 88.7449L84.2575 86.7666"
        stroke="black"
        strokeLinejoin="round"
      />
      <path
        d="M34.6151 78.1037C23.7118 80.3056 18.1254 83.5698 18.9122 87.0318C19.6989 90.4939 32.6279 89.6989 38.4605 88.5601L38.4613 82.432C37.7533 82.3553 37.012 82.3032 36.2665 82.2698L34.6151 78.1037Z"
        fill="#73818B"
      />
      <path
        d="M34.6151 78.1037L34.5162 77.6136C34.7534 77.5657 34.9908 77.6945 35.08 77.9195L34.6151 78.1037ZM18.9122 87.0318L19.3997 86.921L19.3997 86.921L18.9122 87.0318ZM38.4605 88.5601L38.9605 88.5601L38.9605 88.9719L38.5564 89.0508L38.4605 88.5601ZM38.4613 82.432L38.5152 81.935L38.9614 81.9833L38.9613 82.4321L38.4613 82.432ZM28.3693 82.432L28.2855 81.9391L28.3064 81.9355L28.3275 81.9337L28.3693 82.432ZM34.7141 78.5938C29.2826 79.6907 25.2211 81.0442 22.6283 82.5291C19.995 84.0372 19.0867 85.5436 19.3997 86.921L18.4246 87.1426C17.9508 85.058 19.4423 83.2013 22.1313 81.6613C24.8609 80.0981 29.0443 78.7186 34.5162 77.6136L34.7141 78.5938ZM19.3997 86.921C19.4623 87.1966 19.6519 87.4677 20.025 87.7282C20.4016 87.9912 20.9348 88.2206 21.6127 88.4097C22.9675 88.7878 24.7915 88.976 26.8054 89.0214C30.8272 89.1122 35.4817 88.6323 38.3647 88.0693L38.5564 89.0508C35.6067 89.6267 30.8804 90.1137 26.7829 90.0212C24.7372 89.975 22.8168 89.7839 21.3439 89.3729C20.6079 89.1676 19.9564 88.9 19.4525 88.5482C18.9452 88.194 18.5587 87.7326 18.4246 87.1426L19.3997 86.921ZM37.9605 88.56L37.9613 82.432L38.9613 82.4321L38.9605 88.5601L37.9605 88.56ZM38.4074 82.9291C37.7121 82.8537 36.9816 82.8023 36.2442 82.7693L36.2889 81.7703C37.0424 81.804 37.7945 81.8568 38.5152 81.935L38.4074 82.9291ZM36.2442 82.7693C34.3185 82.6832 32.3599 82.7232 30.8797 82.7852C30.1404 82.8162 29.5221 82.8525 29.089 82.8811C28.8725 82.8954 28.7024 82.9077 28.5867 82.9165C28.5289 82.9208 28.4847 82.9243 28.4551 82.9267C28.4403 82.9279 28.4291 82.9288 28.4217 82.9294C28.4181 82.9297 28.4153 82.9299 28.4135 82.93C28.4127 82.9301 28.412 82.9302 28.4116 82.9302C28.4114 82.9302 28.4113 82.9302 28.4112 82.9302C28.4111 82.9302 28.4111 82.9302 28.4111 82.9302C28.4111 82.9302 28.4111 82.9302 28.3693 82.432C28.3275 81.9337 28.3275 81.9337 28.3276 81.9337C28.3276 81.9337 28.3277 81.9337 28.3278 81.9337C28.328 81.9337 28.3282 81.9337 28.3285 81.9337C28.329 81.9336 28.3298 81.9335 28.3309 81.9335C28.333 81.9333 28.3361 81.933 28.3401 81.9327C28.3481 81.932 28.3599 81.9311 28.3754 81.9298C28.4064 81.9274 28.4521 81.9238 28.5114 81.9193C28.63 81.9103 28.8033 81.8978 29.0231 81.8833C29.4629 81.8542 30.0893 81.8174 30.8379 81.7861C32.3336 81.7234 34.3236 81.6824 36.2889 81.7703L36.2442 82.7693ZM28.359 81.9321L36.2563 81.7699L36.2768 82.7697L28.3796 82.9319L28.359 81.9321ZM28.3693 82.432C28.4531 82.9249 28.4531 82.9249 28.4531 82.9249C28.4531 82.9249 28.4531 82.9249 28.4531 82.9249C28.4531 82.9249 28.453 82.9249 28.4529 82.925C28.4526 82.925 28.4521 82.9251 28.4513 82.9252C28.4499 82.9255 28.4475 82.9259 28.4444 82.9264C28.4381 82.9275 28.4284 82.9292 28.4155 82.9315C28.3897 82.9361 28.3513 82.9431 28.3016 82.9523C28.2024 82.9709 28.0587 82.9987 27.8828 83.0355C27.5305 83.1091 27.052 83.2179 26.5449 83.3586C26.0361 83.4999 25.5086 83.6707 25.0544 83.8666C24.5869 84.0681 24.2521 84.2735 24.0784 84.4607L23.3453 83.7805C23.6657 83.4352 24.1601 83.1632 24.6585 82.9483C25.1703 82.7276 25.7454 82.5428 26.2774 82.3951C26.8112 82.2469 27.3117 82.1332 27.6783 82.0566C27.8618 82.0183 28.0125 81.9891 28.1178 81.9694C28.1704 81.9595 28.2118 81.9521 28.2402 81.947C28.2545 81.9445 28.2655 81.9425 28.2731 81.9412C28.2769 81.9405 28.2799 81.94 28.282 81.9397C28.283 81.9395 28.2838 81.9394 28.2844 81.9393C28.2847 81.9392 28.285 81.9392 28.2851 81.9391C28.2852 81.9391 28.2853 81.9391 28.2854 81.9391C28.2855 81.9391 28.2855 81.9391 28.3693 82.432ZM35.08 77.9195L36.7313 82.0856L35.8017 82.4541L34.1503 78.288L35.08 77.9195Z"
        fill="black"
      />
      <path
        d="M37.5297 84.0742C39.0112 80.8477 41.8128 79.6548 43.4146 81.893C42.8398 82.9813 42.9101 89.7001 42.9101 89.7001C44.0652 91.3141 39.7767 91.9427 38.368 90.9202C36.9592 89.8977 35.6778 88.1072 37.5297 84.0742Z"
        fill="white"
        stroke="black"
      />
      <path
        d="M50.1937 79.9197C43.5025 80.5316 42.2318 82.7125 41.7464 83.8438C41.121 85.0936 39.9939 86.9019 42.3581 90.5353C44.7222 94.1687 54.8202 96.1132 58.5721 94.7051C60.1332 94.1192 61.9564 93.2252 63.3492 92.3179C65.3036 91.0447 66.4105 89.7454 64.7565 89.2344C62.8033 88.6311 60.0681 88.0906 58.558 87.8131C60.461 88.1169 64.229 88.5655 65.1705 87.5439C66.8202 85.7537 54.8423 82.7842 54.8459 82.7839C62.5226 82.1113 55.2475 79.4576 50.1937 79.9197Z"
        fill="white"
      />
      <path
        d="M54.9693 91.1309C55.7305 91.4374 58.7267 92.2379 60.0405 92.3773C61.1545 92.4955 62.795 92.2933 63.3492 92.3179M63.3492 92.3179C61.9564 93.2252 60.1332 94.1192 58.5721 94.7051C54.8202 96.1132 44.7222 94.1687 42.3581 90.5353C39.9939 86.9019 41.121 85.0936 41.7464 83.8438C42.2318 82.7125 43.5025 80.5316 50.1937 79.9197C55.2475 79.4576 62.5226 82.1113 54.8459 82.7839C54.8423 82.7842 66.8202 85.7537 65.1705 87.5439C63.8965 88.9264 57.4462 87.6165 57.4462 87.6165C57.4462 87.6165 61.9237 88.3594 64.7565 89.2344C66.4105 89.7454 65.3036 91.0447 63.3492 92.3179Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.1354 60.6282L23.1351 60.6278C22.5643 59.8657 22.4999 59.0251 22.7907 58.1372C23.0883 57.2287 23.7569 56.2879 24.6235 55.4234L24.8977 55.1498L24.7013 54.8159C22.2814 50.7024 20.6721 45.8917 20.4194 41.3257C20.1669 36.7607 21.2702 32.4834 24.2187 29.3597L24.2531 29.3233L24.2796 29.2807C24.7315 28.5544 26.2497 26.2292 27.9789 24.9405L27.9789 24.9405L27.979 24.9405L27.979 24.9405L27.979 24.9405L27.979 24.9405L27.979 24.9404L27.979 24.9404L27.979 24.9404L27.9791 24.9404L27.9791 24.9404L27.9791 24.9404L27.9791 24.9404L27.9791 24.9404L27.9791 24.9404L27.9792 24.9404L27.9792 24.9403L27.9792 24.9403L27.9792 24.9403L27.9792 24.9403L27.9792 24.9403L27.9792 24.9403L27.9793 24.9403L27.9793 24.9403L27.9793 24.9403L27.9793 24.9402L27.9793 24.9402L27.9793 24.9402L27.9794 24.9402L27.9794 24.9402L27.9794 24.9402L27.9794 24.9402L27.9794 24.9402L27.9794 24.9401L27.9795 24.9401L27.9795 24.9401L27.9795 24.9401L27.9795 24.9401L27.9795 24.9401L27.9795 24.9401L27.9796 24.9401L27.9796 24.9401L27.9796 24.94L27.9796 24.94L27.9796 24.94C29.8322 23.6325 32.2346 23.1855 33.0924 23.0666L33.158 23.0576L33.219 23.0317C38.7006 20.708 43.8088 21.8331 48.0349 24.0974C52.2712 26.3671 55.5829 29.7645 57.4035 31.8969L57.6393 32.1732L57.9749 32.0343C58.8967 31.6528 59.8866 31.3589 60.7596 31.3935C61.5945 31.4265 62.3155 31.7552 62.8071 32.6572L62.8212 32.6832L62.8383 32.7073C62.9585 32.8768 63.1409 33.4225 63.0217 34.4155C62.9055 35.3838 62.5072 36.7198 61.5615 38.4001C59.6687 41.7628 55.6036 46.4677 47.3415 52.2989C41.5765 56.3677 36.0489 59.2671 31.6596 60.7163C29.4622 61.4418 27.5781 61.7943 26.1058 61.7644C24.6259 61.7343 23.6546 61.3229 23.1354 60.6282ZM22.7349 60.9275L22.7356 60.9269L22.7349 60.9275Z"
        fill="#454545"
        stroke="black"
      />
      <path
        d="M29.7494 55.322C32.2551 54.4439 38.6361 51.6594 44.1151 47.5451C49.5942 43.4308 53.8508 38.9993 55.9142 36.6586"
        stroke="#777777"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M34.9288 35.6575C31.4699 37.7257 26.9428 32.1176 25.1116 29.055C25.4366 28.3716 26.6271 26.6815 28.789 25.3889C30.9508 24.0964 32.6427 24.0629 33.2184 24.2078C35.2297 27.1627 38.3877 33.5894 34.9288 35.6575Z"
        fill="#777777"
      />
      <defs>
        <linearGradient
          id="paint0_linear_13858_1144"
          x1="62.7519"
          y1="60.5503"
          x2="62.7519"
          y2="86.9723"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4E4E4E" />
          <stop offset="1" stopColor="#010101" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_13858_1144"
          x1="37.0252"
          y1="41.4742"
          x2="48.1211"
          y2="98.0245"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#B7B7B7" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_13858_1144"
          x1="62.752"
          y1="102.386"
          x2="62.752"
          y2="67.158"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A8A8A8" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
