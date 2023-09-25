import { FC } from "react";

export const Counter: FC<{ label: string; count: number }> = ({
  label,
  count,
}) => {
  return (
    <div data-tailwind="h-12 rounded-lg bg-transparent flex flex-col items-center divide-y-2 divide-analogous-500">
      <span data-tailwind="font-bold">{count}</span>
      <span data-tailwind="text-xs">{label}</span>
    </div>
  );
};
