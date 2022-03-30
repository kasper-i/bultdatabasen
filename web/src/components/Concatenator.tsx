import React, { Children, FC } from "react";

export const Concatenator: FC<{ className?: string }> = ({
  children,
  className,
}) => {
  const count = Children.count(children);

  return (
    <>
      {Children.map(Children.toArray(children), (child, index) => (
        <>
          <span className={className}>{child}</span>
          {count > 1 && index === count - 2
            ? " och "
            : index !== count - 1
            ? ", "
            : ""}
        </>
      ))}
    </>
  );
};
