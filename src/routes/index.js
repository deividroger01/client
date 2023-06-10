import React, { useEffect, useContext } from "react";
import { Fragment } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import axios from "axios";

function RoutesApp() {
  const { user, setUser } = useContext(GlobalContext);
  const getUser = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/login/success`;
      const { data } = await axios.get(url, {
        timeout: 20000,
        withCredentials: true,
      });
      setUser(data.user);
      console.log(("user:", user));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <BrowserRouter>
      <Fragment>
        <Routes>
          <Route
            exact
            path="/"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            exact
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="*"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </Fragment>
    </BrowserRouter>
  );
}

export default RoutesApp;
