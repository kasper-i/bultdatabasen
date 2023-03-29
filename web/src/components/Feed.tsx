import clsx from "clsx";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import React, { Fragment, Key, ReactNode } from "react";
import Icon from "./atoms/Icon";
import { IconType } from "./atoms/types";
import UserName from "./UserName";

export interface FeedItem {
  key: Key;
  timestamp: Date;
  icon: IconType;
  description: string;
  userId: string;
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
      {items.map(
        ({ key, timestamp, icon, description, userId, value }, index) => {
          return (
            <li key={key}>
              <div>
                <div className="flex items-center">
                  <div className="rounded-full h-6 w-6 bg-gray-500 flex justify-center items-center">
                    <Icon name={icon} className="text-white" />
                  </div>

                  <div className="text-gray-600 ml-2">
                    <p className="text-xs">
                      <UserName userId={userId} />
                      <br />
                      <span>
                        {description}{" "}
                        <span className="font-semibold">
                          {format(timestamp, "d MMM yyyy", { locale: sv })}
                        </span>
                      </span>
                    </p>
                  </div>
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

                  <div className="p-2 flex-grow mb-1">{value}</div>
                </div>
              </div>
            </li>
          );
        }
      )}
    </ul>
  );
};

export default Feed;
