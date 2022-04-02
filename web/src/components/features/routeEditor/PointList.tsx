import { InsertPosition } from "@/Api";
import clsx from "clsx";
import React, { Children, FC, ReactNode } from "react";
import IconButton from "../../atoms/IconButton";

const Tunnel: FC = ({ children }) => {
  return (
    <div className="w-3 flex flex-col items-center gap-0.5 my-0.5">
      {children}
    </div>
  );
};

const Line: FC<{ short?: boolean }> = ({ short }) => {
  return (
    <div
      className={clsx(
        "mx-auto border-l-4 border-dotted border-primary-500",
        short ? "h-2.5" : "h-10"
      )}
    ></div>
  );
};

const PointListRoot: FC<{
  expandable: boolean;
  onExpand: (index: number, order: InsertPosition["order"]) => void;
}> = ({ children, expandable, onExpand }) => {
  const count = Children.count(children);

  return (
    <ul className="flex flex-col">
      {expandable && (
        <Tunnel>
          <IconButton tiny icon="plus" onClick={() => onExpand(0, "after")} />
          <Line short />
        </Tunnel>
      )}

      {Children.map(Children.toArray(children), (child, index) => {
        let position: "first" | "last" | "intermediate" = "intermediate";

        if (index === 0) {
          position = "last";
        } else if (index === count - 1) {
          position = "first";
        }

        return (
          <div className="flex flex-col items-start w-full">
            {child}
            {count > 1 && position !== "first" && (
              <Tunnel>
                {expandable ? (
                  <>
                    <Line short />
                    <IconButton
                      tiny
                      icon="plus"
                      onClick={() => onExpand(index, "before")}
                    />
                    <Line short />
                  </>
                ) : (
                  <Line />
                )}
              </Tunnel>
            )}
          </div>
        );
      })}

      {expandable && (
        <Tunnel>
          <Line short />
          <IconButton
            tiny
            icon="plus"
            onClick={() => onExpand(count - 1, "before")}
          />
        </Tunnel>
      )}
    </ul>
  );
};

const Entry: FC<{
  label?: ReactNode;
  selected: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  position?: "above" | "below" | "center";
}> = ({ children, label, selected, onClick, dimmed, position }) => {
  return (
    <li className="flex items-start gap-4 w-full">
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center w-full">
          <div
            onClick={onClick}
            className={clsx(
              "relative cursor-pointer rounded-full h-3 w-3 ring-2 ring-offset-2 ring-offset-gray-100 mr-4",
              selected
                ? "bg-primary-500 ring-primary-500"
                : "bg-gray-100 ring-primary-500"
            )}
          />
          <div className={clsx("relative w-full text-gray-600 h-6")}>
            {!selected && (
              <div
                onClick={onClick}
                className={clsx(
                  "cursor-pointer text-gray-600",
                  dimmed && "opacity-20"
                )}
              >
                {label}
              </div>
            )}

            {children && (
              <div
                className={clsx(
                  "z-10 absolute top-0 left-0 right-0 pb-4",
                  position === "above"
                    ? "-mt-6"
                    : position === "below"
                    ? "mt-11"
                    : "mt-2.5"
                )}
              >
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export const PointList = Object.assign(PointListRoot, { Entry });
