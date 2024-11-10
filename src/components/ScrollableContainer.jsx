import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const ScrollableContainer = ({ children }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
});

export default ScrollableContainer;
