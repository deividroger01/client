import axios from "axios";

const backendconn = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    withCredentials: true,
  },
});

export default backendconn;
