import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function CreateEventButton() {
  const { setShowEventModal } = useContext(GlobalContext);
  return (
    <div className="mt-5">
      <button
        onClick={() => setShowEventModal(true)}
        className="border py-2 px-4 rounded-full flex items-center shadow-md hover:shadow-2xl"
      >
        <span className="material-icons-outlined cursor-pointer text-green-600 mx-1">
          add
        </span>
        <span className="pl-3 pr-7">Agendar</span>
      </button>
    </div>
  );
}
