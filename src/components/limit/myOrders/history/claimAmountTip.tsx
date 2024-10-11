import { ONLY_ZEROS, toPrecision } from "@/utils/numbers";
const getClaimAmountTip = ({
  claimedAmount,
  cancelAmount,
}: {
  claimedAmount: string;
  cancelAmount: string;
}) => {
  return `
    <div 
      class="flex flex-col text-xs min-w-36 text-gray-10 z-50"
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
      ONLY_ZEROS.test(cancelAmount)
        ? ""
        : `<div class="flex items-center my-1 justify-between">
        <span class="flex items-center ">
            <div class="w-2 h-1 rounded-full bg-gray-60 mr-1">
            </div>

            Canceled
        </span>

        <span>
        ${
          Number(cancelAmount) > 0 && Number(cancelAmount) < 0.001
            ? "< 0.001"
            : toPrecision(cancelAmount, 3)
        }

        </span>

    </div>`
    }

    </div>
`;
};
export default getClaimAmountTip;
