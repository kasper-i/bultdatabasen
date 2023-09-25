import { Author } from "@/models/user";
import clsx from "clsx";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Fragment, Key, ReactNode } from "react";
import UserName from "./UserName";

export interface FeedItem {
  key: Key;
  timestamp: Date;
  icon: ReactNode;
  description: string;
  author: Author;
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
        ({ key, timestamp, icon, description, author, value }, index) => {
          return (
            <li key={key}>
              <div>
                <div data-tailwind="flex items-center">
                  <div data-tailwind="rounded-full h-6 w-6 bg-gray-500 flex justify-center items-center">
                    {icon}
                  </div>

                  <div data-tailwind="text-gray-600 ml-2">
                    <p data-tailwind="text-xs">
                      <UserName user={author} />
                      <br />
                      <span>
                        {description}{" "}
                        <span data-tailwind="font-semibold">
                          {format(timestamp, "d MMM yyyy", { locale: sv })}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
                <div data-tailwind="flex">
                  <div
                    data-tailwind={clsx(
                      "w-6 flex justify-center",
                      index === items.length - 1 && "invisible"
                    )}
                  >
                    <div data-tailwind="border-l border border-gray-300"></div>
                  </div>

                  <div data-tailwind="p-2 flex-grow mb-1">{value}</div>
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
