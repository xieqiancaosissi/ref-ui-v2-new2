import { ONLY_ZEROS, toPrecision } from "@/utils/numbers";
const getUnclaimAmountTip = ({
  claimedAmount,
  unClaimedAmount,
  pendingAmount,
}: {
  claimedAmount: string;
  unClaimedAmount: string;
  pendingAmount: string;
}) => {
  return `
    <div 
      class="flex flex-col relative text-xs min-w-36 text-gray-10 z-50"
    >
    ${
      ONLY_ZEROS.test(claimedAmount)
        ? ""
        : `
    <div class="flex items-center justify-between my-1">
        <span class="flex items-center mr-1">
            <div class="w-2 h-1 rounded-full bg-primaryGreen mr-1">
            </div>

            Claimed

        </span>

        <span>
        ${
          Number(claimedAmount) > 0 && Number(claimedAmount) < 0.001
            ? "< 0.001"
            : toPrecision(claimedAmount, 3)
        }
        </span>

    </div>
    `
    }


    ${
      ONLY_ZEROS.test(unClaimedAmount)
        ? ""
        : `<div class="flex items-center my-1 justify-between">
        <span class="flex items-center mr-1">
            <div class="w-2 h-1 rounded-full bg-blue-10 mr-1">
            </div>

           Filled

        </span>

        <span>
        ${
          Number(unClaimedAmount) > 0 && Number(unClaimedAmount) < 0.001
            ? "< 0.001"
            : toPrecision(unClaimedAmount, 3)
        }
        </span>

    </div>`
    }

    ${
      ONLY_ZEROS.test(pendingAmount)
        ? ""
        : `<div class="flex items-center my-1 justify-between">
        <span class="flex items-center ">
            <div class="w-2 h-1 rounded-full bg-gray-60 mr-1">
            </div>

            Open

        </span>

        <span>
        ${
          Number(pendingAmount) > 0 && Number(pendingAmount) < 0.001
            ? "< 0.001"
            : toPrecision(pendingAmount, 3)
        }

        </span>

    </div>`
    }

    </div>
`;
};
export default getUnclaimAmountTip;
