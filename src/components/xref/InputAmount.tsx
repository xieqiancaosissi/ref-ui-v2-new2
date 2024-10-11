import React, { useRef, useState, useEffect } from "react";

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string) => void;
}

function InputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  value,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>(
    value ? String(value) : ""
  );
  const [symbolsArr] = useState(["e", "E", "+", "-"]);

  useEffect(() => {
    setInputValue(value ? String(value) : "");
  }, [value]);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);
    setInputValue(amount);
  };

  return (
    <>
      <fieldset className={className}>
        <div
          className={`relative flex align-center items-center h-16 rounded overflow-hidden border mb-5`}
          style={{ borderColor: "rgba(255, 255, 255, 0.16" }}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current && ref.current.blur()}
            {...rest}
            step="any"
            className={`w-full h-full pl-4 bg-dark-130 bg-opacity-40 text-lg font-bold focus:outline-none appearance-none leading-tight ${
              disabled ? "text-gray-400 placeholder-gray-400" : "text-white"
            }`}
            type="number"
            placeholder="0.0"
            value={inputValue}
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            inputMode="decimal"
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />
        </div>
      </fieldset>
    </>
  );
}

export default React.memo(InputAmount);
