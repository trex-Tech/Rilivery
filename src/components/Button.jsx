import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const LoadingButton = ({ onPress, title, loading, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        loading && styles.buttonDisabled,
        disabled && styles.buttonDisabled,
      ]}
      onPress={loading || disabled ? null : onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoadingButton;
