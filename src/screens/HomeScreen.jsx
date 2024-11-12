import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { GlobalContext } from "../context";
import { FetchAllOnlineRiders } from "../../services/User.service";
import { ActivityIndicator } from "react-native-paper";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { Logout } from "../../services/Auth.service";

const ridersData = [
  {
    id: "1",
    name: "Alice Johnson",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "online",
    phoneNumber: "1234567890",
  },
  {
    id: "2",
    name: "Bob Smith",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "offline",
    phoneNumber: "0987654321",
  },
  {
    id: "3",
    name: "Charlie Brown",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "online",
    phoneNumber: "1122334455",
  },
  {
    id: "4",
    name: "Diana Prince",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "offline",
    phoneNumber: "5566778899",
  },
];

const HomeScreen = ({ navigation }) => {
  const { setIsAuthenticated, setUserType } = useContext(GlobalContext);
  const refRBSheet = useRef();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRiders();
    setRefreshing(false);
  };

  const fetchRiders = async () => {
    setLoading(true);

    const res = await FetchAllOnlineRiders();

    if (res.data.status === "success") {
      // console.log("Riders:::", res.data.data);
      setRiders(res.data.data.riders);
      setLoading(false);
    }
  };

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007BFF" />
    </View>
  );

  useEffect(() => {
    fetchRiders();
  }, []);

  const renderRider = ({ item }) => (
    <TouchableOpacity
      style={styles.riderCard}
      onPress={() => navigation.navigate("Chat", { rider: item })} // Pass the entire rider object
    >
      <Image source={{ uri: item.selfie }} style={styles.riderImage} />
      <Text style={styles.riderName}>
        {item.first_name} {item.last_name}
      </Text>
      <View style={[styles.statusIndicator, styles.online]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.title}>Available Riders</Text>
      <Text style={styles.subtitle}>
        Choose a rider to start a chat and arrange your delivery.
      </Text>
      <FlatList
        data={loading ? [] : riders} // Show an empty array if loading
        renderItem={loading ? renderLoadingIndicator : renderRider} // Render loading indicator or riders
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color="#007BFF" /> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={{ marginHorizontal: Platform.OS === "ios" ? 20 : 0 }}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.becomeRiderButton}
            onPress={() => refRBSheet.current.open()}
          >
            <Text style={styles.buttonText}>Become a Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatsButton}
            onPress={() => navigation.navigate("ChatsList")}
          >
            <Text style={styles.buttonText}>My Errands</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            AsyncStorage.removeItem("access_token");
            setIsAuthenticated(false);
            setUserType("User");
          }}
        >
          <Text style={styles.deleteButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Modal for Becoming a Rider */}
      <RBSheet
        ref={refRBSheet}
        height={300}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          },
        }}
      >
        <Text style={styles.modalTitle}>Become a Rider</Text>
        <Text style={styles.modalText}>
          Join our team of riders and earn money by delivering packages. Enjoy
          flexible hours, competitive pay, and the opportunity to work in your
          community.
        </Text>
        <TouchableOpacity
          onPress={() => {
            refRBSheet.current.close();
            navigation.navigate("RiderVerification");
          }}
          style={styles.verifyButton}
        >
          <Text style={styles.buttonText}>Verify Your Information</Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingTop: 20,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Add padding to avoid overlap with buttons
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    paddingBottom: 60, // Add padding to avoid overlap with the button
  },
  riderCard: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  riderImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Make the image circular
    marginBottom: 5,
  },
  riderName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5, // Make the status indicator circular
    marginTop: 5,
  },
  online: {
    backgroundColor: "#3dba3d",
  },
  offline: {
    backgroundColor: "gray",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  becomeRiderButton: {
    flex: 2, // Take more space
    marginRight: 10,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  chatsButton: {
    flex: 1, // Take less space
    marginLeft: 10,
    backgroundColor: "#28a745", // Green color for the chats button
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};

export default HomeScreen;
