import React, { FC, useEffect, useRef } from "react";

export const Card: FC = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white shadow-sm flex flex-col items-start text-black"
    >
      <div className="w-full h-1 bg-primary-500"></div>
      <div className="border border-gray-300 border-t-0 flex flex-col w-full p-4">
        {children}
      </div>
    </div>
  );
};
