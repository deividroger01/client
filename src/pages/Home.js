import React, { useState, useContext, useEffect } from "react";

import "../App.css";
import { getMonth } from "../util";

import CalendarHeader from "../components/CalendarHeader";
import Sidebar from "../components/Sidebar";
import Month from "../components/Month";
import GlobalContext from "../context/GlobalContext";
import CreateEventModal from "../components/CreateEventModal";
import EventsModal from "../components/EventsModal";
import ServiceListModal from "../components/ServiceListModal";
import CreateServiceModal from "../components/CreateServiceModal";
import EditServiceModal from "../components/EditServiceModal";
import MsgService from "../components/MsgService";
import MsgEvent from "../components/MsgEvent";
import EditEventModal from "../components/EditEventModal";
import ReportModal from "../components/ReportModal";

export default function Home(userDetails) {
  const user = userDetails.user;
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const {
    monthIndex,
    showEventsModal,
    showEventModal,
    showServiceListModal,
    showServiceModal,
    showEditServiceModal,
    showEditEventModal,
    showReportModal,
    isMsgService,
    isMsgEvent,
  } = useContext(GlobalContext);
  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  return (
    <React.Fragment>
      {showEventModal && <CreateEventModal />}
      {showEventsModal && <EventsModal />}
      {showServiceListModal && <ServiceListModal />}
      {showEditServiceModal && <EditServiceModal />}
      {showEditEventModal && <EditEventModal />}
      {showServiceModal && <CreateServiceModal />}
      {isMsgService && <MsgService />}
      {isMsgEvent && <MsgEvent />}
      {showReportModal && <ReportModal />}
      <div className="h-screen flex flex-col">
        <CalendarHeader user={user} />
        <div className="flex flex-1 flex-col sm:flex-row">
          <Sidebar user={user} className="flex-1 flex flex-col" />
          {window.innerWidth >= 640 ? (
            <Month month={currentMonth} className="block sm:hidden" />
          ) : null}
        </div>
      </div>
    </React.Fragment>
  );
}
