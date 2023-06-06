import React, { useContext, useEffect, useState } from "react";
import backendconn from "../api/api";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";
require("dayjs/locale/pt-br");

export default function Day({ day, rowIdx }) {
  const [dayEvents, setDayEvents] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const {
    setDaySelected,
    setShowEventModal,
    filteredEvents,
    setSelectedEvent,
  } = useContext(GlobalContext);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await backendconn.get("/scheduling");
        const allEvents = response.data;
        const currentDay = day.locale("pt-br").format("MMDDYY");

        const eventsWithServiceName = await Promise.all(
          allEvents.map(async (evt) => {
            const eventDate = dayjs(evt.startTime)
              .locale("pt-br")
              .format("MMDDYY");
            if (eventDate === currentDay) {
              const serviceName = await fetchServiceName(evt.serviceId);

              const sHourTime = dayjs(evt.startTime).format("HH");
              const sMinuteTime = dayjs(evt.startTime).format("mm");
              const sTime = dayjs(evt.startTime).format("HH:mm");

              return {
                ...evt,
                serviceName: serviceName,
                sHourTime: sHourTime,
                sMinuteTime: sMinuteTime,
                sTime: sTime,
              };
            }
            return null;
          })
        );

        const filteredEvents = eventsWithServiceName.filter(
          (evt) => evt !== null
        );

        setDayEvents(filteredEvents);
        setEventsLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServiceName = async (serviceId) => {
      try {
        const response = await backendconn.get(`/service/${serviceId}`);
        const service = response.data;
        return service.name;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    fetchEvents();
  }, [filteredEvents, day]);

  function validateDay(day) {
    const nowDay = dayjs()
      .locale("pt-br")
      .format("MMDDYY");
    const currDay = day.locale("pt-br").format("MMDDYY");

    if (currDay < nowDay) {
      setDaySelected(day);
      return "Não é possível agendar nessa data";
    } else {
      setDaySelected(day);
      setShowEventModal(true);
    }
  }

  function getCurrentDayClass() {
    return day.locale("pt-br").format("DD-MM-YY") ===
      dayjs()
        .locale("pt-br")
        .format("DD-MM-YY")
      ? "bg-greensas text-white rounded-full w-7"
      : "";
  }

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="border border-gray-200 flex flex-col">
      <header className="flex flex-col items-center">
        {(isSmallScreen ? rowIdx >= 0 : rowIdx === 0) && (
          <p className="text-xs mt-1 font-semibold">
            {day
              .locale("pt-br")
              .format("ddd")
              .toUpperCase()}
          </p>
        )}
        <p
          className={`text-sm px-2 py-1 text-center ${getCurrentDayClass()}`}
          onClick={() => {
            setDaySelected(day);
            validateDay(day);
          }}
        >
          {day.locale("pt-br").format("DD")}
        </p>
      </header>
      <div
        className={`mt-4 mb-4 flex-1 cursor-pointer ${
          dayEvents.length > 3 ? "overflow-y-auto" : ""
        }`}
        style={{ maxHeight: "8rem" }}
        onClick={() => {
          validateDay(day);
        }}
      >
        {eventsLoaded ? (
          <>
            {dayEvents.length > 0
              ? dayEvents
                  .filter((evt) => {
                    const eventDate = dayjs(evt.startTime)
                      .locale("pt-br")
                      .format("MMDDYY");
                    const currentDay = day.locale("pt-br").format("MMDDYY");
                    return eventDate === currentDay;
                  })
                  .sort((a, b) => a.sTime.localeCompare(b.sTime))
                  .map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`bg-green-200 px-2 py-1 my-1 text-gray-600 text-xs rounded truncate`}
                    >
                      {evt.sHourTime}h{evt.sMinuteTime}: {evt.clientName} |{" "}
                      {evt.serviceName}
                    </div>
                  ))
              : dayjs(day).isAfter(dayjs(), "day") && (
                  <span className="material-icons-outlined cursor-pointer text-green-600 mx-1 flex items-center justify-center">
                    add
                  </span>
                )}
          </>
        ) : (
          <div className="text-gray-600 text-sm">Carregando eventos...</div>
        )}
      </div>
    </div>
  );
}
