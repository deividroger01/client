import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function EventsButton(userDetails) {
  const user = userDetails.user;
  const { setShowEventsModal } = useContext(GlobalContext);

  return (
    <div className="mt-5">
      <button
        user={user}
        onClick={() => setShowEventsModal(true)}
        className="border py-2 px-4 rounded-full flex items-center shadow-md hover:shadow-2xl"
      >
        <span className="material-icons-outlined cursor-pointer text-green-600 mx-1">
          event
        </span>
        <span className="pl-3 pr-7">Agendamentos</span>
      </button>
    </div>
  );
}
