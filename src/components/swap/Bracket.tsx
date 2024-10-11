export const RightBracket = ({ size }: { size: number }) => {
  return (
    <div
      className="w-4 mr-3 opacity-30 rounded-full relative z-10 border border-gray-60"
      style={{
        height: `${size * 60}px`,
        clipPath: `polygon(50% 0, 100% 0,100% 100%, 50%  100%)`,
      }}
    ></div>
  );
};

export const LeftBracket = ({ size }: { size: number }) => {
  return (
    <div
      className="w-4 ml-3 opacity-30 rounded-full relative z-10 border border-gray-60  transform rotate-180"
      style={{
        height: `${size * 60}px`,
        clipPath: `polygon(50% 0, 100% 0,100% 100%, 50%  100%)`,
      }}
    ></div>
  );
};
