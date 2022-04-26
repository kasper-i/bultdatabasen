import clsx from "clsx";
import React, { FC, ReactNode, useEffect, useRef } from "react";

export const Card: FC<{
  dashed?: boolean;
  children: ReactNode;
  upperCutout?: boolean;
  lowerCutout?: boolean;
}> = ({ children, dashed, upperCutout, lowerCutout }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, []);

  return (
    <div ref={ref} className="relative">
      {upperCutout && (
        <div className="absolute top-0 w-full overflow-hidden h-3">
          <div
            className="mx-auto -mt-4 w-7 h-7 border border-gray-300 bg-gray-100"
            style={{ borderRadius: "360px" }}
          />
        </div>
      )}
      <div
        className={clsx(
          "rounded-md w-full p-4",
          dashed
            ? "border-2 border-gray-300 border-dashed bg-gray-100"
            : "border border-gray-300 bg-white"
        )}
      >
        {children}
      </div>
      {lowerCutout && (
        <div className="absolute bottom-0 w-full overflow-hidden h-3">
          <div
            className="mx-auto w-7 h-7 border border-gray-300 bg-gray-100 "
            style={{ borderRadius: "360px" }}
          />
        </div>
      )}
    </div>
  );
};
