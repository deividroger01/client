import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function ReportButton(userDetails) {
  const user = userDetails.user;
  const { setShowReportModal } = useContext(GlobalContext);

  return (
    <div className="mt-5">
      <button
        user={user}
        onClick={() => setShowReportModal(true)}
        className="border py-2 px-4 rounded-full flex items-center shadow-md hover:shadow-2xl"
      >
        <span className="material-icons-outlined cursor-pointer text-green-600 mx-1">
          format_list_bulleted
        </span>
        <span className="pl-3 pr-7">Relatório</span>
      </button>
    </div>
  );
}
