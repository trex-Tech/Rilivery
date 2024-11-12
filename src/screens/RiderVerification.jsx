import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Modal,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import ScrollableContainer from "../components/ScrollableContainer";
import * as ImagePicker from "expo-image-picker";
import LoadingButton from "../components/Button";
import { VerifyMe } from "../../services/Rider.service";
import { GlobalContext } from "../context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RiderVerification = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { setIsAuthenticated, setUserType } = useContext(GlobalContext);

  const showAlert = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const handleFacialScan = async () => {
    if (permission.granted) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };

      const takePhoto = await cameraRef.current.takePictureAsync(options);

      setCapturedImage(takePhoto);
    }
  };

  const handleLicenseUpload = async () => {
    // Request permission to access the media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      // console.log("Selected license image (base64): ", result.assets[0].base64);
      setLicenseImage(result.assets[0].base64);
    }
  };

  const sendImageToBackend = async () => {
    setLoading(true);

    const selfie = "data:image/jpg;base64," + capturedImage.base64;
    const drivers_license = "data:image/jpeg;base64," + licenseImage;

    try {
      const res = await VerifyMe(selfie, drivers_license);

      if (res.data.status === "success") {
        console.log("verify response:::", res.data.data);
        setLoading(false);
        showAlert();
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        showAlert();
      }
    }
  };

  return (
    <ScrollableContainer>
      <Text style={styles.title}>Rider Verification</Text>
      <View style={styles.verificationSection}>
        <Text style={styles.sectionTitle}>Take a Selfie</Text>
        {capturedImage ? (
          <View style={{ width: "100%", height: 400 }}>
            <Image
              source={{ uri: `data:image/jpg;base64,` + capturedImage.base64 }}
              style={{ width: "100%", height: "80%" }}
            />
            <TouchableOpacity
              style={{
                padding: 15,
                borderRadius: 5,
                alignItems: "center",
                backgroundColor: "#ccc",
                marginTop: 20,
              }}
              onPress={() => setCapturedImage(null)}
            >
              <Text style={styles.uploadButtonText}>Retake Selfie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing={"front"}
            animateShutter
            onCameraReady={() => {
              setCameraReady(true);
            }}
            ref={cameraRef}
          >
            <TouchableOpacity
              style={styles.snapButton}
              onPress={handleFacialScan}
            ></TouchableOpacity>
          </CameraView>
        )}
      </View>
      <View style={styles.verificationSection}>
        <Text style={styles.sectionTitle}>Select Driver's License</Text>
        {licenseImage !== null && (
          <View>
            <Image
              source={{ uri: "data:image/jpeg;base64," + licenseImage }}
              style={{ width: "100%", height: 200 }}
            />
          </View>
        )}
        {licenseImage !== null ? (
          <TouchableOpacity
            style={{
              padding: 15,
              borderRadius: 5,
              alignItems: "center",
              backgroundColor: "#ccc",
              marginTop: 20,
            }}
            onPress={() => setLicenseImage(null)}
          >
            <Text style={styles.uploadButtonText}>Choose a different file</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, { marginTop: 20 }]}
            onPress={handleLicenseUpload}
          >
            <Text style={styles.uploadButtonText}>Choose file</Text>
          </TouchableOpacity>
        )}
      </View>
      <LoadingButton
        onPress={sendImageToBackend}
        title="Submit Verification"
        loading={loading} // Set to true if you want to show a loading state
        disabled={!capturedImage || !licenseImage} // Disable if either image is missing
      />

      <Modal transparent={true} animationType="slide" visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ textAlign: "center", fontSize: 20 }}>
              Your details have been sent for Verification. You can now Sign In
              as A Rider.
            </Text>
            <LoadingButton
              onPress={() => {
                AsyncStorage.removeItem("access_token");
                setIsAuthenticated(false);
                setUserType("User");
              }}
              title="Sign in"
            />
            {/* Your button component */}
          </View>
        </View>
      </Modal>
    </ScrollableContainer>
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  camera: {
    height: 400,
    borderRadius: 50,
    overflow: "hidden",
    position: "relative",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
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
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  snapButton: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
    left: "50%",
    marginLeft: -50,
    zIndex: 100,
  },
  capturedImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});

export default RiderVerification;
