import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getAccessToken = async () => {
    const access_token = await AsyncStorage.getItem("access_token");

    console.log("Access_token:::", access_token);
    if (access_token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      console.log("There's no access token");
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <GlobalContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </GlobalContext.Provider>
  );
};
