import React from "react";

export default function LogoutButton() {
  const handleLogout = () => {
    window.open(`${process.env.REACT_APP_API_URL}/logout`, "_self");
  };
  return (
    <div className="mt-80">
      <button
        onClick={handleLogout}
        className="border p-2 rounded-full flex items-center shadow-md hover:shadow-2xl"
      >
        <span className="material-icons-outlined cursor-pointer text-green-600 mx-1">
          logout
        </span>
        <span className="pl-3 pr-7">Sair</span>
      </button>
    </div>
  );
}
