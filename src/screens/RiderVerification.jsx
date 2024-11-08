import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { launchCamera } from "react-native-image-picker"; // For camera functionality

const RiderVerification = ({ navigation }) => {
  const handleFacialScan = () => {
    // Logic to handle facial scan
    launchCamera({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera");
      } else if (response.error) {
        console.error("Camera error: ", response.error);
      } else {
        // Handle the scanned image
        console.log("Facial scan image: ", response.assets[0]);
      }
    });
  };

  const handleLicenseUpload = () => {
    // Logic to handle driver's license upload
    Alert.alert(
      "Upload Driver's License",
      "Functionality to upload driver's license goes here."
    );
  };

  const handleSubmit = () => {
    // Logic to handle submission of verification
    navigation.navigate("RiderHome");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Rider Verification</Text>
      <View style={styles.verificationSection}>
        <Text style={styles.sectionTitle}>Facial Scan</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleFacialScan}>
          <Text style={styles.scanButtonText}>Scan Your Face</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verificationSection}>
        <Text style={styles.sectionTitle}>Upload Driver's License</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleLicenseUpload}
        >
          <Text style={styles.uploadButtonText}>Upload License</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Verification</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  verificationSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#ff5722",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default RiderVerification;
