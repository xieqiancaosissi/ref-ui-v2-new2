import React from "react";

export const CalcIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        opacity="0.4"
        x="0.75"
        y="0.75"
        width="16.5"
        height="16.5"
        rx="3.25"
        stroke="#7E8A93"
        strokeWidth="1.5"
      />
      <path
        d="M4 5.5H8"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6 3.5L6 7.5"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4.58594 10.8999L7.41436 13.7283"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M7.41406 10.8999L4.58564 13.7283"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M11 5.5H14"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10 12.2998H14"
        stroke="#7E8A93"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="10.5498" r="0.75" fill="#7E8A93" />
      <circle cx="12" cy="14.0498" r="0.75" fill="#7E8A93" />
    </svg>
  );
};
export const ArrowDownIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="9"
      viewBox="0 0 10 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 0V8M5 8L1 4M5 8L9 4" stroke="#00C6A2" />
    </svg>
  );
};
export const SearchIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.65777 10.8721C3.07154 9.2859 3.07154 6.7141 4.65777 5.12787C6.24401 3.54163 8.8158 3.54163 10.402 5.12787C11.9864 6.71227 11.9883 9.27997 10.4075 10.8666C10.4057 10.8685 10.4038 10.8703 10.402 10.8721C10.4002 10.8739 10.3985 10.8756 10.3968 10.8773C8.81016 12.4584 6.24227 12.4566 4.65777 10.8721ZM10.8222 12.1852C8.73254 13.8333 5.69323 13.6932 3.76495 11.765C1.68563 9.68563 1.68563 6.31437 3.76495 4.23505C5.84428 2.15572 9.21553 2.15572 11.2949 4.23505C13.2231 6.16333 13.3632 9.20268 11.7151 11.2924L14.6133 14.1907C14.8599 14.4372 14.8599 14.8369 14.6133 15.0835C14.3668 15.33 13.9671 15.33 13.7205 15.0835L10.8222 12.1852Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};
export const LightningIcon = function () {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_355_3780)">
        <circle cx="9" cy="9" r="5" fill="currentColor" fillOpacity="0.4" />
      </g>
      <path
        d="M9.30276 2.00509C9.46925 2.04842 9.49576 2.33523 9.49894 2.89749L9.5 6.12766C9.5 6.37113 9.5 6.49287 9.57741 6.56818C9.6421 6.63008 9.73965 6.64143 9.91568 6.6435H11.1574C12.7799 6.6435 13.59 6.6435 13.8965 7.15624C14.204 7.66898 13.8032 8.35504 13.0015 9.72614L10.4915 14.0251C10.0938 14.706 9.89447 15.0465 9.69724 14.9949C9.5 14.9454 9.5 14.5544 9.5 13.7713V10.8734C9.5 10.6299 9.5 10.5081 9.42259 10.4328C9.34518 10.3575 9.22005 10.3575 8.96979 10.3575H7.33145C6.04729 10.3513 5.37605 10.3008 5.10352 9.84478C4.796 9.33204 5.19684 8.64598 5.99851 7.27488L8.50851 2.9759C8.90617 2.29499 9.10553 1.95351 9.30276 2.00509Z"
        fill="currentColor"
      />
      <defs>
        <filter
          id="filter0_f_355_3780"
          x="0"
          y="0"
          width="18"
          height="18"
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
            result="effect1_foregroundBlur_355_3780"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const LightningBase64 = function () {
  return "https://img.ref.finance/images/farmLightningGrey.png";
};
export const LightningBase64Grey = function () {
  return "https://img.ref.finance/images/farmLightning.svg";
};

export const BoostOptIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.86238 9.50529L3.40647 8.13033C3.52816 7.82285 3.36226 7.62362 3.03781 7.6876L1.72637 7.94641C1.40196 8.01035 0.945117 8.2541 0.711273 8.48795L0.425048 8.77417C0.191204 9.00801 0.191204 9.39067 0.425048 9.62451L1.58406 10.7835L2.86238 9.50529ZM4.53254 13.732L5.70703 14.9065C5.94087 15.1403 6.32353 15.1403 6.55737 14.9065L6.8436 14.6203C7.07744 14.3864 7.32778 13.9311 7.39993 13.6084L7.67281 12.3878C7.74509 12.0651 7.54772 11.8876 7.23433 11.9934L5.72625 12.5025"
        fill="#E88A46"
      />
      <path
        d="M10.9948 8.68451C12.9584 6.52192 12.5499 4.05934 12.329 3.21592C12.329 3.21592 12.2275 2.86214 11.8163 2.80976C5.48588 2.00329 3.40764 9.667 3.40764 9.667C3.40764 9.667 3.22839 10.6134 3.96019 11.3051C4.84242 12.1389 5.5326 11.9272 5.5326 11.9272C5.5326 11.9272 6.94443 11.7434 8.3341 10.8065C9.15093 10.2558 10.1327 9.63341 10.9948 8.68451V8.68451Z"
        fill="#00D6AF"
      />
      <path
        d="M8.09371 4.85795C7.93621 5.01542 7.81127 5.20237 7.72603 5.40813C7.64079 5.61388 7.59691 5.83442 7.5969 6.05713C7.59689 6.27985 7.64075 6.50039 7.72597 6.70615C7.8112 6.91191 7.93612 7.09888 8.0936 7.25636C8.25109 7.41385 8.43805 7.53877 8.64381 7.62399C8.84958 7.70922 9.07011 7.75308 9.29283 7.75307C9.51555 7.75306 9.73608 7.70918 9.94184 7.62393C10.1476 7.53869 10.3345 7.41375 10.492 7.25625C10.6495 7.09878 10.7744 6.91183 10.8597 6.70608C10.9449 6.50032 10.9888 6.27979 10.9888 6.05707C10.9888 5.83436 10.945 5.61382 10.8598 5.40805C10.7745 5.20229 10.6496 5.01533 10.4921 4.85784C10.3346 4.70036 10.1477 4.57544 9.94191 4.49021C9.73615 4.40499 9.51561 4.36113 9.29289 4.36114C9.07018 4.36115 8.84964 4.40503 8.64389 4.49027C8.43813 4.57551 8.25118 4.70045 8.09371 4.85795V4.85795Z"
        fill="#172128"
      />
    </svg>
  );
};

export const WarningIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1859_401)">
        <path
          d="M0 7C0.00218939 5.14416 0.74039 3.36495 2.05267 2.05267C3.36495 0.74039 5.14416 0.00218939 7 0C8.85584 0.00218939 10.635 0.74039 11.9473 2.05267C13.2596 3.36495 13.9978 5.14416 14 7C13.998 8.8559 13.2598 10.6352 11.9475 11.9475C10.6352 13.2598 8.8559 13.998 7 14C5.14416 13.9978 3.36495 13.2596 2.05267 11.9473C0.74039 10.635 0.00218939 8.85584 0 7H0ZM1.27273 7C1.27458 8.5184 1.87858 9.97408 2.95225 11.0477C4.02592 12.1214 5.4816 12.7254 7 12.7273C8.5184 12.7254 9.97408 12.1214 11.0477 11.0477C12.1214 9.97408 12.7254 8.5184 12.7273 7C12.7253 5.48165 12.1212 4.02607 11.0476 2.95244C9.97393 1.8788 8.51835 1.27475 7 1.27273C5.48165 1.27475 4.02607 1.8788 2.95244 2.95244C1.8788 4.02607 1.27475 5.48165 1.27273 7ZM6.04545 10.1634C6.04545 9.9102 6.14602 9.66741 6.32503 9.4884C6.50405 9.30939 6.74684 9.20882 7 9.20882C7.25316 9.20882 7.49595 9.30939 7.67497 9.4884C7.85398 9.66741 7.95455 9.9102 7.95455 10.1634C7.95455 10.4165 7.85398 10.6593 7.67497 10.8383C7.49595 11.0173 7.25316 11.1179 7 11.1179C6.74695 11.1179 6.50425 11.0174 6.32526 10.8386C6.14627 10.6597 6.04562 10.4171 6.04545 10.164V10.1634ZM6.36364 7.95709V3.04373H7.63636V7.95709H6.36364Z"
          fill="#00C6A2"
        />
      </g>
      <defs>
        <clipPath id="clip0_1859_401">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const NewTag = (props: any) => {
  return (
    <svg
      {...props}
      width="44"
      height="20"
      viewBox="0 0 44 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="44"
        height="20"
        rx="10"
        transform="matrix(-1 0 0 1 44 0)"
        fill="#8FFF00"
      />
      <path
        d="M10.9775 15H9.56836L11.5171 5.84033H12.7676L16.0303 12.5371H16.1382L17.5918 5.84033H19.001L17.0522 15H15.8018L12.5327 8.32861H12.4312L10.9775 15ZM21.0957 10.8677H24.5679C24.5721 10.8465 24.5742 10.8084 24.5742 10.7534C24.5785 10.6984 24.5806 10.6455 24.5806 10.5947C24.5806 10.3239 24.5234 10.0785 24.4092 9.8584C24.2992 9.63411 24.1341 9.45426 23.9141 9.31885C23.6982 9.18343 23.4338 9.11572 23.1206 9.11572C22.7905 9.11572 22.4901 9.18978 22.2192 9.33789C21.9526 9.48177 21.722 9.6849 21.5273 9.94727C21.3369 10.2096 21.193 10.5164 21.0957 10.8677ZM22.4604 15.1333C21.9188 15.1333 21.4279 15.0212 20.9878 14.7969C20.5519 14.5684 20.2049 14.2362 19.9468 13.8003C19.6929 13.3602 19.5659 12.8291 19.5659 12.207C19.5659 11.5723 19.6548 10.9946 19.8325 10.4741C20.0103 9.94938 20.2599 9.50081 20.5815 9.12842C20.9074 8.75179 21.2925 8.46191 21.7368 8.25879C22.1854 8.05566 22.6763 7.9541 23.2095 7.9541C23.7088 7.9541 24.1637 8.06624 24.5742 8.29053C24.9889 8.51481 25.319 8.84066 25.5645 9.26807C25.8141 9.69124 25.939 10.1991 25.939 10.7915C25.939 10.9269 25.9284 11.1047 25.9072 11.3247C25.8903 11.5448 25.8691 11.7267 25.8438 11.8706H20.9307C20.9264 11.9172 20.9222 11.9637 20.918 12.0103C20.918 12.0568 20.918 12.1034 20.918 12.1499C20.918 12.5731 20.9963 12.9159 21.1528 13.1782C21.3136 13.4406 21.5189 13.6331 21.7686 13.7559C22.0182 13.8786 22.2785 13.9399 22.5493 13.9399C22.964 13.9399 23.3005 13.868 23.5586 13.7241C23.821 13.576 24.0156 13.3813 24.1426 13.1401H25.5264C25.429 13.5252 25.2428 13.868 24.9678 14.1685C24.6927 14.4689 24.3436 14.7059 23.9204 14.8794C23.4972 15.0487 23.0106 15.1333 22.4604 15.1333ZM37.1489 8.0874L33.7847 15H32.3628L31.9946 9.94092H31.8931L29.4111 15H28.002L27.5767 8.0874H28.8589L29.0684 13.3179H29.1763L31.6582 8.0874H33.0166L33.3022 13.3623H33.4102L35.7842 8.0874H37.1489Z"
        fill="black"
      />
    </svg>
  );
};

export const ForbiddonIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 24C5.3724 24 0 18.6276 0 12C0 5.3724 5.3724 0 12 0C18.6276 0 24 5.3724 24 12C24 18.6276 18.6276 24 12 24ZM12 21.6C14.5461 21.6 16.9879 20.5886 18.7882 18.7882C20.5886 16.9879 21.6 14.5461 21.6 12C21.6 9.45392 20.5886 7.01212 18.7882 5.21177C16.9879 3.41143 14.5461 2.4 12 2.4C9.45392 2.4 7.01212 3.41143 5.21177 5.21177C3.41143 7.01212 2.4 9.45392 2.4 12C2.4 14.5461 3.41143 16.9879 5.21177 18.7882C7.01212 20.5886 9.45392 21.6 12 21.6ZM20.4852 3.5148C20.7102 3.73983 20.8365 4.045 20.8365 4.3632C20.8365 4.6814 20.7102 4.98657 20.4852 5.2116L5.2116 20.4852C4.98528 20.7038 4.68215 20.8247 4.36752 20.822C4.05288 20.8193 3.75191 20.6931 3.52942 20.4706C3.30693 20.2481 3.18073 19.9471 3.17799 19.6325C3.17526 19.3178 3.29621 19.0147 3.5148 18.7884L18.7884 3.5148C19.0134 3.28983 19.3186 3.16346 19.6368 3.16346C19.955 3.16346 20.2602 3.28983 20.4852 3.5148Z"
        fill="#73818B"
      />
    </svg>
  );
};

export const CrossIconEmpty = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke="#00C6A2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 2"
      />
    </svg>
  );
};
export const CrossIconLittle = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke="#00C6A2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 2"
      />
      <mask
        id={`mask0_0_1_${props.num || 0}`}
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="2"
        width="8"
        height="8"
      >
        <circle cx="6" cy="6" r="4" fill="#00C6A2" />
      </mask>
      <g mask={`url(#mask0_0_1_${props.num || 0})`}>
        <rect x="1" y="1" width="3" height="10" fill="#00C6A2" />
      </g>
    </svg>
  );
};

export const CrossIconMiddle = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke="#00C6A2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 2"
      />
      <mask
        id={`mask0_0_1_${props.num || 0}`}
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="2"
        width="8"
        height="8"
      >
        <circle cx="6" cy="6" r="4" fill="#00C6A2" />
      </mask>
      <g mask={`url(#mask0_0_1_${props.num || 0})`}>
        <rect
          x="0.5"
          y="0.5"
          width="5"
          height="11"
          fill="#00C6A2"
          stroke="#00C6A2"
        />
      </g>
    </svg>
  );
};

export const CrossIconLarge = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke="#00C6A2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 2"
      />
      <mask
        id={`mask0_0_1_${props.num || 0}`}
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="2"
        y="2"
        width="8"
        height="8"
      >
        <circle cx="6" cy="6" r="4" fill="#00C6A2" />
      </mask>
      <g mask={`url(#mask0_0_1_${props.num || 0})`}>
        <rect x="1" y="1" width="7" height="10" fill="#00C6A2" />
      </g>
    </svg>
  );
};

export const CrossIconFull = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="4" fill="#00C6A2" />
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke="#00C6A2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 2"
      />
    </svg>
  );
};

export const LinkArrowIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.592725 9.07802L8.95679 0.713952M3.9397 0.545594L9.07801 0.592734L9.12515 5.73104"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const DownArrowIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 1L5.8655 5.66667L1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
