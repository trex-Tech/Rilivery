import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

const LoadingButton = ({ onPress, title, loading, disabled, icon }) => {
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            gap: 10
          }}
        >
          {icon}
          <Text style={styles.buttonText}>{title}</Text>
        </View>
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

export const OutlinedButton = ({ onPress, title, loading, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        outlinedStyles.button,
        loading && outlinedStyles.buttonDisabled,
        disabled && outlinedStyles.buttonDisabled,
      ]}
      onPress={loading || disabled ? null : onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={outlinedStyles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const outlinedStyles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    borderColor: "#007BFF",
    borderWidth: 1,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
