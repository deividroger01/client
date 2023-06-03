import React from "react";
import googleIcon from "../assets/google-logo.png";

export default function Login() {
  const GOOGLE_AUTH_URL = `${process.env.REACT_APP_API_URL}/auth/google`;

  const handleLogin = async () => {
    try {
      await window.open(GOOGLE_AUTH_URL, "_self");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-greensas h-screen flex justify-center items-center">
      <div className="w-90 h-80 p-5 bg-white rounded-lg flex flex-col justify-center items-center">
        <h1 className="p-5 text-greensas text-center text-4xl">
          Boas vindas ao SAS Calendar
        </h1>
        <p className=" p-3 text-gray-400 text-center mb-4">
          Para acessar, entre com a sua conta Google no botão abaixo
        </p>
        <button
          onClick={handleLogin}
          className="border p-3 rounded-full flex items-center shadow-md hover:shadow-2xl text-black-200 font-semibold"
        >
          <img src={googleIcon} alt="Google Icon" className="w-6 h-6 mr-2" />
          <span>Autenticar com o Google</span>
        </button>
      </div>
    </div>
  );
}
