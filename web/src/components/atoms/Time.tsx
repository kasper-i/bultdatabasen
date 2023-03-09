import { format } from "date-fns";
import React, { FC } from "react";
import { sv } from "date-fns/locale";

export const Time: FC<{ time: Date; datetimeFormat?: string }> = ({
  time,
  datetimeFormat = "PP",
}) => {
  return <span>{format(new Date(time), datetimeFormat, { locale: sv })}</span>;
};
