import React, { Children, FC, Fragment } from "react";

export const Concatenator: FC<{ className?: string }> = ({
  children,
  className,
}) => {
  const count = Children.count(children);

  return (
    <>
      {Children.map(children, (child, index) => (
        <Fragment key={index}>
          <span className={className}>{child}</span>
          {count > 1 && index === count - 2
            ? " och "
            : index !== count - 1
            ? ", "
            : ""}
        </Fragment>
      ))}
    </>
  );
};
