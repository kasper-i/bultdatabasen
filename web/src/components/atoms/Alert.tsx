import { XCircleIcon } from "@heroicons/react/24/solid";
import { FC, ReactNode } from "react";

export const Alert: FC<{ children: ReactNode }> = ({ children }) => {
  if (!children) {
    return null;
  }

  return (
    <div className="w-full p-3 rounded bg-red-100 text-sm text-red-700 font-medium flex items-center gap-2">
      <XCircleIcon className="h-5 w-5 text-red-400" />
      {children}
    </div>
  );
};
