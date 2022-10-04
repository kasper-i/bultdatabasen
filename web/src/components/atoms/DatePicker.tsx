import {
  CalendarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { format } from "date-fns";
import { RenderProps, useDayzed } from "dayzed";
import { FC, useState } from "react";
import { usePopper } from "react-popper";
import Input from "./Input";

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];
const weekdayNamesShort = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

const Calendar: FC<RenderProps> = ({
  calendars,
  getBackProps,
  getForwardProps,
  getDateProps,
}) => {
  if (!calendars.length) {
    return null;
  }

  return (
    <div className="border rounded-md p-3 w-64 bg-white shadow-md">
      {calendars.map((calendar) => (
        <div key={`${calendar.month}${calendar.year}`}>
          <div className="flex justify-between items-center my-2">
            <button {...getBackProps({ calendars, offset: 12 })}>
              <ChevronDoubleLeftIcon className="h-5 text-gray-500" />
            </button>
            <button {...getBackProps({ calendars })}>
              <ChevronLeftIcon className="h-5 text-gray-500" />
            </button>

            <div className="flex-grow" />

            <p>
              <span className="font-bold">
                {monthNamesShort[calendar.month]}
              </span>{" "}
              <span className="text-gray-500">{calendar.year}</span>
            </p>

            <div className="flex-grow" />

            <button {...getForwardProps({ calendars })}>
              <ChevronRightIcon className="h-5 text-gray-500" />
            </button>
            <button {...getForwardProps({ calendars, offset: 12 })}>
              <ChevronDoubleRightIcon className="h-5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-7">
            {weekdayNamesShort.map((weekday) => (
              <div
                key={`${calendar.month}${calendar.year}${weekday}`}
                className="font-semibold text-gray-600 text-xs mx-auto py-2"
              >
                {weekday}
              </div>
            ))}
            {calendar.weeks.map((week, weekIndex) =>
              week.map((dateObj, index) => {
                const key = `${calendar.month}${calendar.year}${weekIndex}${index}`;
                if (!dateObj) {
                  return <div key={key} />;
                }
                const { date, selected, nextMonth, prevMonth } = dateObj;
                return (
                  <div
                    key={key}
                    className="aspect-square flex items-center justify-center"
                  >
                    <button
                      className={clsx(
                        "font-medium text-sm h-7 w-7 hover:rounded-full hover:bg-primary-500 hover:text-white",
                        selected
                          ? "rounded-full bg-gray-500 text-white"
                          : nextMonth || prevMonth
                          ? "text-gray-200"
                          : "text-gray-500"
                      )}
                      {...getDateProps({ dateObj })}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Datepicker: FC<{
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
}> = ({ label, value, onChange }) => {
  const [date] = useState(value);
  const [offset, setOffset] = useState(0);
  const [hidden, setHidden] = useState(true);

  const dayzedData = useDayzed({
    date,
    selected: value,
    onDateSelected: (dateObj) => {
      onChange(dateObj.date);
      if (dateObj.prevMonth) {
        setOffset((offset) => offset - 1);
      } else if (dateObj.nextMonth) {
        setOffset((offset) => offset + 1);
      }
      setHidden(true);
    },
    firstDayOfWeek: 1,
    showOutsideDays: true,
    offset,
    onOffsetChanged: setOffset,
  });

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [{ name: "offset", options: { offset: [0, 5] } }],
  });

  return (
    <div className="w-full">
      <Input
        inputRef={setReferenceElement}
        label={label}
        value={value ? format(value, "yyyy-MM-dd") : ""}
        onClick={() => setHidden(false)}
        icon={CalendarIcon}
      />
      {!hidden && (
        <div
          className="z-50"
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <Calendar {...dayzedData} />
        </div>
      )}
    </div>
  );
};
