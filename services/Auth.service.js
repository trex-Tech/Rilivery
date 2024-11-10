import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/axios.config";
import { useContext } from "react";
import { GlobalContext } from "../src/context";

export const RegisterUser = async (
  phone_number,
  first_name,
  last_name,
  password
) => {
  const data = {
    phone_number: phone_number,
    first_name: first_name,
    last_name: last_name,
    password: password,
  };

  const res = await api.post("/auth/register/", data);

  return res;
};

export const LoginUser = async (phone_number, password) => {
  const data = {
    phone_number: phone_number,
    password: password,
  };

  const res = await api.post("/auth/login/", data);

  return res;
};

export const Logout = () => {
  const { setIsAuthenticated } = useContext(GlobalContext);

  AsyncStorage.removeItem("access_token");
  setIsAuthenticated(false);
};
