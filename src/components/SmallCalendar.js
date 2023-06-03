import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import { getMonth } from "../util";

export default function SmallCalendar() {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(dayjs().month());
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  useEffect(() => {
    setCurrentMonth(getMonth(currentMonthIdx));
  }, [currentMonthIdx]);

  const { monthIndex, setSmallCalendarMonth, setDaySelected, daySelected } =
    useContext(GlobalContext);

  useEffect(() => {
    setCurrentMonthIdx(monthIndex);
  }, [monthIndex]);

  function handlePrevMonth() {
    setCurrentMonthIdx(currentMonthIdx - 1);
  }
  function handleNextMonth() {
    setCurrentMonthIdx(currentMonthIdx + 1);
  }
  function getDayClass(day) {
    const format = "MMDDYY";
    const nowDay = dayjs().locale("pt-br").format(format);
    const currDay = day.locale("pt-br").format(format);
    const sltDay = daySelected && daySelected.locale("pt-br").format(format);
    if (nowDay === currDay) {
      return "bg-greensas rounded-full text-white";
    } else if (currDay === sltDay) {
      return "bg-greensas rounded-full text-white";
    } else {
      return "";
    }
  }

  function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return (
    <div className="mt-9">
      <header className="flex justify-between">
        <p className="text-greensas font-bold">
          {capitalizeFirstLetter(
            dayjs(new Date(dayjs().year(), currentMonthIdx))
              .locale("pt-br")
              .format("MMMM YYYY")
          )}
        </p>
        <div>
          <button onClick={handlePrevMonth}>
            <span className="material-icons-outlined cursor-pointer text-greensas mx-2">
              chevron_left
            </span>
          </button>
          <button onClick={handleNextMonth}>
            <span className="material-icons-outlined cursor-pointer text-greensas mx-2">
              chevron_right
            </span>
          </button>
        </div>
      </header>
      <div className="grid grid-cols-7 grid-rows-6">
        {currentMonth[0].map((day, i) => (
          <span key={i} className="text-sm py-2 px-4 text-center">
            {day.locale("pt-br").format("ddd").toUpperCase().charAt(0)}
          </span>
        ))}
        {currentMonth.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSmallCalendarMonth(currentMonthIdx);
                  setDaySelected(day);
                }}
                className={`py-1 w-full ${getDayClass(day)}`}
              >
                <span className="text-sm">{day.format("D")}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
