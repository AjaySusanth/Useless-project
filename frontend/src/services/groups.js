import axios from "axios";

const API_URL = "http://localhost:5000/api/groups"; // adjust to your backend

export const createGroup = (data) => {
  return axios.post(`${API_URL}/`, data, { withCredentials: true });
};

export const joinGroup = (data) => {
  return axios.post(`${API_URL}/join`, data, { withCredentials: true });
};

export const getMyGroups = () => {
  return axios.get(`${API_URL}/mine`, { withCredentials: true });
};
