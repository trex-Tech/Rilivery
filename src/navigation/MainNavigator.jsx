import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import RiderList from "../screens/AvailableRiders";
import DeliveryScreen from "../screens/DeliveryScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ChatScreen from "../screens/ChatScreen";
import ChatsList from "../screens/ChatsList";
import RiderVerification from "../screens/RiderVerification";
import RiderHomePage from "../screens/RiderHomePage";
import { GlobalContext } from "../context";

const Stack = createStackNavigator();

const UnAuthNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AuthenticatedNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Delivery"
          component={DeliveryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RiderList"
          component={RiderList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatsList"
          component={ChatsList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RiderVerification"
          component={RiderVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RiderHome"
          component={RiderHomePage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainNavigator = () => {
  const { isAuthenticated } = useContext(GlobalContext);
  return (
    <>{isAuthenticated ? <AuthenticatedNavigator /> : <UnAuthNavigator />}</>
  );
};

export default MainNavigator;
