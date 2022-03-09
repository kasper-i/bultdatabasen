import React, { Children, FC } from "react";

export const Concatenator: FC<{ className?: string }> = ({
  children,
  className,
}) => {
  const count = Children.count(children);

  return Children.map(Children.toArray(children), (child, index) => (
    <span key={child.key}>
      <span className={className}>{child}</span>
      {count > 2 && index === count - 2
        ? " och "
        : index !== count - 1
        ? ", "
        : ""}
    </span>
  ));
};
