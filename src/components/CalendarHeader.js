import dayjs from "dayjs";
import React, { useContext } from "react";
import saslogo from "../assets/sas_logo.png";
import GlobalContext from "../context/GlobalContext";

export default function CalendarHeader(userDetails) {
  const user = userDetails.user;
  const { monthIndex, setMonthIndex } = useContext(GlobalContext);
  function handlePrevMonth() {
    setMonthIndex(monthIndex - 1);
  }
  function handleNextMonth() {
    setMonthIndex(monthIndex + 1);
  }
  function handleReset() {
    setMonthIndex(
      monthIndex === dayjs().month()
        ? monthIndex + Math.random()
        : dayjs().month()
    );
  }

  function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return (
    <header className="px-4 py-2 flex flex-col sm:flex-row items-center flex-wrap">
      <div className="flex items-center mb-2 sm:mb-0">
        <img src={saslogo} alt="calendar" className="mr-2 w-12 h-12" />
        <h1 className="mr-10 text-xl text-greensas">Olá, {user.username}</h1>
      </div>
      <button
        onClick={handleReset}
        className="border rounded py-2 px-4 mr-2 mb-2 sm:mr-5"
      >
        Hoje
      </button>
      <div className="flex mb-2">
        <button onClick={handlePrevMonth} className="mr-1">
          <span className="material-icons-outlined cursor-pointer text-greensas">
            chevron_left
          </span>
        </button>
        <button onClick={handleNextMonth} className="mr-1">
          <span className="material-icons-outlined cursor-pointer text-greensas">
            chevron_right
          </span>
        </button>
      </div>
      <div className="w-full sm:w-auto sm:ml-4">
        <h2 className="text-xl text-greensas font-bold mb-2 sm:mb-0 text-center sm:text-left">
          {capitalizeFirstLetter(
            dayjs(new Date(dayjs().year(), monthIndex))
              .locale("pt-br")
              .format("MMMM YYYY")
          )}
        </h2>
      </div>
    </header>
  );
}
