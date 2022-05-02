import clsx from "clsx";
import React, { Fragment, Key, ReactNode } from "react";
import Icon from "./atoms/Icon";

export interface FeedItem {
  key: Key;
  header: ReactNode;
  value: ReactNode;
}

type Props = {
  items: FeedItem[];
};

const Feed = ({ items }: Props) => {
  if (items.length === 0) {
    return <Fragment />;
  }

  return (
    <ul>
      {items.map(({ key, header, value }, index) => {
        return (
          <li key={key}>
            <div>
              <div className="flex items-center">
                <div className="rounded-full h-6 w-6 bg-gray-500 flex justify-center items-center">
                  <Icon name="image" className="text-white" />
                </div>

                <div className="text-gray-600 ml-2">{header}</div>
              </div>
              <div className="flex">
                <div
                  className={clsx(
                    "w-6 flex justify-center",
                    index === items.length - 1 && "invisible"
                  )}
                >
                  <div className="border-l border border-gray-300"></div>
                </div>

                <div className="p-2">{value}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default Feed;
