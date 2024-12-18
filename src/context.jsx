import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState("");
  const [riderStatus, setRiderStatus] = useState("");
  const [riderAvailable, setRiderAvailable] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const getAccessToken = async () => {
    const access_token = await AsyncStorage.getItem("access_token");

    console.log("Access_token in context:::", access_token);
    if (access_token) {
      setIsAuthenticated(true);
      setAccessToken(access_token);
    } else {
      setIsAuthenticated(false);
      console.log("There's no access token");
    }
  };

  const getUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem("user_type");
      setUserType(storedUserType);
    } catch (error) {
      console.error("Failed to load user type:", error);
    }
  };

  const getRiderStatus = async () => {
    try {
      const storedRiderStatus = await AsyncStorage.getItem("rider_status");
      setRiderStatus(storedRiderStatus);
      // console.log(storedRiderStatus);
    } catch (error) {
      console.error("Failed to load user type:", error);
    }
  };

  const getRiderAvailability = async () => {
    try {
      const storedRiderAvailable = await AsyncStorage.getItem(
        "rider_available"
      );

      if (storedRiderAvailable !== null) {
        const parsedValue = JSON.parse(storedRiderAvailable);
        setRiderAvailable(parsedValue);
        console.log("Availability:", parsedValue);
      } else {
        setRiderAvailable(false);
        console.log("Availability is off");
      }
    } catch (error) {
      console.error("Failed to load rider availability:", error);
    }
  };

  useEffect(() => {
    getRiderStatus();
    getUserType();
    getRiderAvailability();
  }, []);

  useEffect(() => {
    getAccessToken();
  }, [accessToken]);

  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userType,
        setUserType,
        riderStatus,
        setRiderStatus,
        riderAvailable,
        setRiderAvailable,
        getRiderAvailability,
        accessToken,
        setAccessToken,
        getAccessToken,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
