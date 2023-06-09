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
        <div className="absolute top-0 w-full overflow-hidden h-2.5">
          <div className="mx-auto -mt-3.5 w-6 h-6 border border-gray-300 bg-neutral-50 rounded-full" />
        </div>
      )}
      <div
        className={clsx(
          "rounded-md w-full p-4",
          dashed
            ? "border-2 border-gray-300 border-dashed bg-neutral-50"
            : "border border-gray-300 bg-white"
        )}
      >
        {children}
      </div>
      {lowerCutout && (
        <div className="absolute bottom-0 w-full overflow-hidden h-2.5">
          <div className="mx-auto w-6 h-6 border border-gray-300 bg-neutral-50 rounded-full" />
        </div>
      )}
    </div>
  );
};
