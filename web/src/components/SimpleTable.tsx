import React, { FC, ReactElement, ReactNode } from "react";

export interface SimpleTableItem {
  key: React.Key;
  row: ReactNode;
  badge?: string;
}

const SimpleTable: FC<{ items: SimpleTableItem[] }> = ({
  items,
}): ReactElement => {
  return (
    <div>
      <ul className="divide-y">
        {items.map(({ key, row, badge }) => {
          return (
            <li key={key} className="flex justify-between items-center py-1.5">
              {row}

              {badge && (
                <span className="bg-primary-400 rounded-full py-1 px-2 text-xs text-white">
                  {badge}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SimpleTable;
