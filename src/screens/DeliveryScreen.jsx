import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import MapView from "react-native-maps";

const DeliveryScreen = () => {
  const [location, setLocation] = useState("");

  const handlePlaceOrder = () => {
    // Placeholder for backend order endpoint
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.5164, // Static location (Ile-Ife)
          longitude: 4.5287,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
      <Text>Enter Delivery Location:</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter location"
      />
      <Button title="Place Order" onPress={handlePlaceOrder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  map: { width: "100%", height: 200 },
  input: { borderBottomWidth: 1, marginBottom: 10 },
});

export default DeliveryScreen;
