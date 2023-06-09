import React from "react";

const GlobalContext = React.createContext({
  user: null,
  setUser: () => {},
  monthIndex: 0,
  setMonthIndex: (index) => {},
  smallCalendarMonth: 0,
  setSmallCalendarMonth: (index) => {},
  daySelected: null,
  setDaySelected: (day) => {},
  showEventModal: false,
  setShowEventModal: () => {},
  showEventsModal: false,
  setShowEventsModal: () => {},
  showServiceModal: false,
  setShowServiceModal: () => {},
  showReportModal: false,
  setShowReportModal: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  filteredEvents: [],
  showHome: false,
  setShowHome: () => [],
  auth: [],
  setAuth: () => [],
  isOpen: false,
  setIsOpen: () => {},
  showServiceListModal: false,
  setShowServiceListModal: () => {},
  showEditServiceModal: null,
  setShowEditServiceModal: () => {},
  showEditEventModal: null,
  setShowEditEventModal: () => {},
  isMsgService: null,
  setIsMsgService: () => {},
  isMsgEvent: null,
  setIsMsgEvent: () => {},
});

export default GlobalContext;
