import React, { useContext, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import LoadingButton from "../components/Button";
import { RegisterUser } from "../../services/Auth.service";
import axios from "axios";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../context";

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated } = useContext(GlobalContext);

  const [errors, setErrors] = useState({}); // State to hold error messages

  const validateInputs = () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters long.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleRegister = async () => {
    setLoading(true);
    if (validateInputs()) {
      try {
        const res = await RegisterUser(
          phoneNumber,
          firstName,
          lastName,
          password
        );
        if (res.data.status === "success") {
          setLoading(false);
          setIsAuthenticated(true);
          AsyncStorage.setItem("access_token", res.data.data.access);

          console.log("Token saved::", res.data.data.access);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    } else {
      Alert.alert(
        "Registration Failed",
        "Please fix the errors and try again."
      );
      setLoading(false);
      return;
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/100" }} // Random logo
        style={styles.logo}
      />
      <Text style={styles.title}>Create an Account</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setErrors((prev) => ({ ...prev, firstName: null }));
        }}
        placeholder="First Name"
      />
      {errors.lastName && (
        <Text style={styles.errorText}>{errors.firstName}</Text>
      )}
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setErrors((prev) => ({ ...prev, lastName: null }));
        }}
        placeholder="Last Name"
      />
      {errors.lastName && (
        <Text style={styles.errorText}>{errors.lastName}</Text>
      )}
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setErrors((prev) => ({ ...prev, phoneNumber: null }));
        }}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
      {errors.phoneNumber && (
        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
      )}
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: null }));
        }}
        placeholder="Password"
        secureTextEntry
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}
      <LoadingButton
        title={"Register"}
        onPress={handleRegister}
        loading={loading}
      />
      <Text style={styles.loginText}>
        Already have an account?
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          {" "}
          Log in
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    color: "#666",
  },
  loginLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff0000",
    marginBottom: 10,
    fontSize: 14,
    textAlign: "left",
  },
});

export default RegisterScreen;
