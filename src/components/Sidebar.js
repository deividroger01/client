import React, { useState, useContext, useEffect } from "react";
import SmallCalendar from "./SmallCalendar";
import ServicesButton from "./ServicesButton";
import LogoutButton from "./LogoutButton";
import EventsButton from "./EventsButton";
import ReportButton from "./ReportButton";
import GlobalContext from "../context/GlobalContext";
import Month from "./Month";
import { getMonth } from "../util";

export default function Sidebar(userDetails) {
  const user = userDetails.user;
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex } = useContext(GlobalContext);
  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  return (
    <aside className="border p-2 sm:w-64 sm:flex-shrink-0 flex flex-col items-center">
      <EventsButton />
      <ServicesButton user={user} />
      <ReportButton />
      <span className="p-2"></span>
      <div className="sm:hidden">
        <Month className="sm:w-1/1 " month={currentMonth} />
      </div>
      <div className="m-1 hidden sm:block">
        <SmallCalendar />
      </div>
      <LogoutButton />
    </aside>
  );
}
