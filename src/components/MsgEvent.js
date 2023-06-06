import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function MsgEvent() {
  const { isMsgEvent, setIsMsgEvent, setShowEventsModal } = useContext(
    GlobalContext
  );

  const setIsModalOpen = () => {
    setIsMsgEvent(null);
    setTimeout(() => {
      setShowEventsModal(true);
    }, 2000);
  };

  if (isMsgEvent) {
    const msg = isMsgEvent[0].msg;
    const screen = isMsgEvent[0].screen;

    return (
      <div
        className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
          isMsgEvent ? "block" : "hidden"
        }`}
      >
        <div className="relative w-full max-w-6xl mx-auto mt-10">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
              <h3 className=" text-lg font-medium text-white text-center	">
                {screen}
              </h3>
              <button
                className="text-white hover:text-red-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                onClick={setIsModalOpen}
              >
                <span className="material-icons-outlined cursor-pointer mx-2">
                  close
                </span>
              </button>
            </div>
            <div className="flex justify-center items-center w-full h-full">
              <p className="text-black">{msg}</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex items-center sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                className="h-full w-full flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={setIsModalOpen}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return;
}
