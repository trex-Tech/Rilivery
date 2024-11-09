import React from "react";
import MainNavigator from "./src/navigation/MainNavigator";
import { GlobalProvider } from "./src/context";

export default function App() {
  return (
    <GlobalProvider>
      <MainNavigator />
    </GlobalProvider>
  );
}
