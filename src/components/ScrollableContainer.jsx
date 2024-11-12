import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

const ScrollableContainer = ({ children, onRefresh, refreshing }) => {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.scrollView}
    >
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1
  },
  content: {
    padding: 20,
  },
});

export default ScrollableContainer;
