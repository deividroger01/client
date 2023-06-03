import React, { useEffect, useState } from "react";
import GlobalContext from "./GlobalContext";
import dayjs from "dayjs";

export default function ContextWrapper(props) {
  const [user, setUser] = useState(null);
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showHome, setShowHome] = useState(false);
  const [auth, setAuth] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [showServiceListModal, setShowServiceListModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(null);
  const [showEditEventModal, setShowEditEventModal] = useState(null);
  const [isMsgService, setIsMsgService] = useState(null);
  const [isMsgEvent, setIsMsgEvent] = useState(null);

  const filteredEvents = "";

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        monthIndex,
        setMonthIndex,
        smallCalendarMonth,
        setSmallCalendarMonth,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        showEventsModal,
        setShowEventsModal,
        showServiceModal,
        setShowServiceModal,
        showReportModal,
        setShowReportModal,
        selectedEvent,
        setSelectedEvent,
        filteredEvents,
        showHome,
        setShowHome,
        auth,
        setAuth,
        isOpen,
        setIsOpen,
        showServiceListModal,
        setShowServiceListModal,
        showEditServiceModal,
        setShowEditServiceModal,
        showEditEventModal,
        setShowEditEventModal,
        isMsgService,
        setIsMsgService,
        isMsgEvent,
        setIsMsgEvent,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
