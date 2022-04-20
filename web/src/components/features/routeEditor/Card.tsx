import clsx from "clsx";
import React, { FC, ReactNode, useEffect, useRef } from "react";

export const Card: FC<{ dashed?: boolean; children: ReactNode }> = ({
  children,
  dashed,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, []);

  return (
    <div className="w-full h-0 relative">
      <div className="absolute z-10 left-0 top-0 right-0 pb-4">
        <div ref={ref}>
          <div
            className={clsx(
              "shadow-sm rounded-md w-full p-4",
              dashed
                ? "border-2 border-gray-300 border-dashed bg-gray-100"
                : "border border-gray-300 bg-white"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
