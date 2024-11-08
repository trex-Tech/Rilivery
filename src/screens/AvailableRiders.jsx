// RiderList.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const RiderList = ({ riders, onSelect }) => (
  <View>
    {riders.map((rider, index) => (
      <View key={index} style={styles.riderCard}>
        <Text>{rider.name}</Text>
        <Button title="Choose Rider" onPress={() => onSelect(rider)} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  riderCard: { padding: 10, borderBottomWidth: 1 },
});

export default RiderList;
