import { FC } from "react";

export const Counter: FC<{ label: string; count: number }> = ({
  label,
  count,
}) => {
  return (
    <div className="h-12 rounded-lg bg-transparent flex flex-col items-center divide-y-2 divide-analogous-500">
      <span className="font-bold">{count}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
};
