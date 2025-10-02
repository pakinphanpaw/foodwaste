import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://10.0.2.2:5000"; // Android Emulator
// const API_BASE = "http://localhost:5000"; // iOS Simulator

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password }); 
  return res.data;
};

export const register = async (username, password, role) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { username, password, role });
  return res.data;
};

export const getAvailableFoods = async () => {
  const res = await axios.get(`${API_BASE}/food/available`);
  return res.data;
};


export const updateFood = async (id, updates) => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.put(`${API_BASE}/food/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const getMyFoods = async () => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.get(`${API_BASE}/food/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addFood = async (foodData) => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.post(`${API_BASE}/food`, foodData, {
    headers: { Authorization: `Bearer ${token}` },
    "Content-Type": "application/json; charset=utf-8",
  });
  return res.data;
};
