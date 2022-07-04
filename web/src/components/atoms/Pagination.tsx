import clsx from "clsx";
import React, { FC } from "react";

const Pagination: FC<{
  page: number;
  itemsPerPage: number;
  totalItems: number;
  onPageSelect: (page: number) => void;
}> = ({ page, itemsPerPage, totalItems, onPageSelect }) => {
  if (totalItems === 0) {
    return null;
  }

  const numberOfPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-center items-center gap-x-2.5 flex-wrap">
      {Array(numberOfPages)
        .fill(0)
        .map((_, i) => i + 1)
        .map((x) => (
          <div
            key={x}
            className={clsx(
              "cursor-pointer text-primary-500",
              x === page && "font-bold "
            )}
            onClick={() => onPageSelect(x)}
          >
            {x}
          </div>
        ))}
    </div>
  );
};

export default Pagination;
