import { format } from "date-fns";
import React, { FC } from "react";
import { sv } from "date-fns/locale";

export const Time: FC<{ time: string }> = ({ time }) => {
  return <span>{format(new Date(time), "PP", { locale: sv })}</span>;
};
