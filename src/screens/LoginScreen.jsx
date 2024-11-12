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
import { LoginUser } from "../../services/Auth.service";
import LoadingButton from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../context";
import Feather from "@expo/vector-icons/Feather";

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // State to hold error messages
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setUserType } = useContext(GlobalContext);
  const [isVisible, setIsVisible] = useState(false);

  const validateInputs = () => {
    const newErrors = {};
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters long.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleLogin = async () => {
    setLoading(true);
    if (validateInputs()) {
      const formattedPhoneNumber = phoneNumber.startsWith("+234")
        ? phoneNumber
        : `+234${phoneNumber}`;

      console.log("data:::", formattedPhoneNumber, password);
      try {
        const res = await LoginUser(formattedPhoneNumber, password);
        console.log("login res:::", res.data);
        if (res.data.status === "success") {
          setLoading(false);
          setIsAuthenticated(true);
          setUserType(res.data.data.user_type);
          await AsyncStorage.setItem("access_token", res.data.data.access);

          // console.log("Token saved::", res.data.data.access);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.log("errorrrrr:::", error.response.data.data.non_field_errors);
        if (error.response.data.data.non_field_errors) {
          Alert.alert(error.response.data.data.non_field_errors[0]);
        }
      }
    } else {
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
      <Text style={styles.title}>Login</Text>
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
      <View style={styles.input}>
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: null }));
          }}
          placeholder="Password"
          secureTextEntry={!isVisible}
          style={{ width: "80%" }}
        />
        <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
          {isVisible ? (
            <Feather name="eye-off" size={24} color="black" />
          ) : (
            <Feather name="eye" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}
      <LoadingButton title={"Log in"} onPress={handleLogin} loading={loading} />
      <Text style={styles.signupText}>
        Don't have an account?
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("SignUp")}
        >
          {" "}
          Sign up
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
    flexDirection: "row",
    justifyContent: "space-between",
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
  signupText: {
    marginTop: 20,
    color: "#666",
  },
  signupLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff0000",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default LoginScreen;
