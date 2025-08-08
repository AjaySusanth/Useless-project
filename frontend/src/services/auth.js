import axios from "axios";

const API_URL = "https://useless-project-py4u.onrender.com/api/auth"; // adjust for your backend

export const signup = async (data) => {
  return axios.post(`${API_URL}/signup`, data, { withCredentials: true });
};

export const login = async (data) => {
  return axios.post(`${API_URL}/login`, data, { withCredentials: true });
};

export const logout = async () => {
  return axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};
