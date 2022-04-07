import { InsertPosition } from "@/Api";
import clsx from "clsx";
import React, { FC, Fragment, ReactNode } from "react";
import IconButton from "../../atoms/IconButton";

const Connector: FC<{ short?: boolean }> = ({ short }) => {
  return (
    <div
      className={clsx(
        "border-l-2 border-dotted border-primary-400",
        short ? "h-2" : "h-7"
      )}
    ></div>
  );
};

export const PointNavigator: FC<{
  expandable: boolean;
  onExpand: (pointId: string, order: InsertPosition["order"]) => void;
  entries: Entry[];
  contentPointId: string | null;
  position?: "before" | "after";
  hideLabels?: boolean;
}> = ({
  children,
  expandable,
  onExpand,
  entries,
  contentPointId,
  position,
  hideLabels,
}) => {
  const count = entries.length;

  return (
    <div
      className="inline-grid auto-rows-auto w-full gap-0.5 gap-x-2"
      style={{
        gridTemplateColumns: "1.25rem 1fr",
      }}
    >
      {entries.map((entry, index) => {
        const { pointId, label, selected, onClick } = entry;

        return (
          <Fragment key={pointId}>
            {index === 0 && expandable && (
              <>
                <div className="justify-self-center self-center">
                  <IconButton
                    tiny
                    icon="plus"
                    onClick={() => onExpand(pointId, "after")}
                  />
                </div>
                <div>
                  {contentPointId === pointId &&
                    position === "after" &&
                    children}
                </div>
                <div className="justify-self-center">
                  <Connector short />
                </div>
                <div />
              </>
            )}
            <div className="justify-self-center flex items-center h-6">
              <div
                onClick={onClick}
                className={clsx(
                  "cursor-pointer rounded-full h-3 w-3 ring-2 ring-offset-2 ring-offset-gray-100 ring-primary-500",
                  selected ? "bg-primary-500" : "bg-gray-100"
                )}
              />
            </div>

            {contentPointId === pointId && position === undefined ? (
              <div className="self-center h-6">{children}</div>
            ) : (
              <div
                className={clsx("cursor-pointer", hideLabels && "invisible")}
                onClick={onClick}
              >
                {label}
              </div>
            )}

            {count > 1 &&
              index !== count - 1 &&
              (expandable ? (
                <>
                  <div className="justify-self-center">
                    <Connector short />
                  </div>
                  <div />
                  <div className="justify-self-center">
                    <IconButton
                      tiny
                      icon="plus"
                      onClick={() => onExpand(pointId, "before")}
                    />
                  </div>
                  <div>
                    {contentPointId === pointId &&
                      position === "before" &&
                      children}
                  </div>
                  <div className="justify-self-center">
                    <Connector short />
                  </div>
                  <div />
                </>
              ) : (
                <>
                  <div className="rows-span-3 justify-self-center">
                    <Connector />
                  </div>
                  <div className="rows-span-3" />
                </>
              ))}
            {index === count - 1 && expandable && (
              <>
                <div className="justify-self-center">
                  <Connector short />
                </div>
                <div />
                <div className="justify-self-center self-center">
                  <IconButton
                    tiny
                    icon="plus"
                    onClick={() => onExpand(pointId, "before")}
                  />
                </div>
                <div>
                  {contentPointId === pointId &&
                    position === "before" &&
                    children}
                </div>
              </>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export interface Entry {
  pointId: string;
  label: ReactNode;
  selected: boolean;
  onClick?: () => void;
}
