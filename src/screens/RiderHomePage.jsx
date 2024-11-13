import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Logout } from "../../services/Auth.service";
import { GlobalContext } from "../context";
import ScrollableContainer from "../components/ScrollableContainer";
import {
  GetProfileDtails,
  ToggleAvailability,
} from "../../services/Rider.service";
import { SOCKET_URL } from "../../config";

const RiderHomePage = () => {
  const [activeTab, setActiveTab] = useState("availableErrands"); // Default tab
  const [ErrandListRefresh, setErrandListRefresh] = useState(false);
  const [verifiedRefresh, setVerifiedRefresh] = useState(false);
  const {
    setIsAuthenticated,
    riderStatus,
    riderAvailable,
    getRiderAvailability,
    setRiderAvailable,
    accessToken,
  } = useContext(GlobalContext);
  const [verified, setVerified] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const getRiderCurrentProfile = async () => {
    const res = await GetProfileDtails();

    if (res.data.status === "success") {
      // console.log("Current status:::", res.data.data);
      setRiderAvailable(res.data.data.is_online);
    }
  };

  useEffect(() => {
    getRiderCurrentProfile();
  }, []);

  const onErrandListRefresh = async () => {
    setErrandListRefresh(true);
    getRiderAvailability();
    getRiderCurrentProfile();
    setErrandListRefresh(false);
  };

  const onVerifiedRefresh = async () => {
    setVerifiedRefresh(true);
    setVerifiedRefresh(false);
  };

  const toggleAvailability = async () => {
    const currentAvailability = riderAvailable;

    const result = await ToggleAvailability();

    if (result.data) {
      setIsAvailable(!currentAvailability);
      console.log(result.data);
      setRiderAvailable(result.data.data.online);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "availableErrands":
        return <AvailableErrands accessToken={accessToken} />;
      case "messages":
        return <Messages />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {riderStatus === "approved" ? (
        <ScrollableContainer
          refreshing={ErrandListRefresh}
          onRefresh={onErrandListRefresh}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.availabilityText}>
              {riderAvailable ? "Online" : "Offline"}
            </Text>
            <Switch
              value={riderAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: "#767577", true: "#007BFF" }}
              thumbColor={riderAvailable ? "#fff" : "#f4f3f4"}
              style={styles.switch}
            />
          </View>
          <View style={styles.contentContainer}>{renderContent()}</View>
        </ScrollableContainer>
      ) : (
        <ScrollableContainer
          refreshing={verifiedRefresh}
          onRefresh={onVerifiedRefresh}
        >
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>
              Awaiting verification from the admin. Please refresh this page in
              1 hour to check for updates on your Verification.
            </Text>
          </View>
        </ScrollableContainer>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setActiveTab("availableErrands")}
        >
          <AntDesign name="shoppingcart" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setActiveTab("messages")}
        >
          <AntDesign name="message1" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => {
            AsyncStorage.removeItem("access_token");
            setIsAuthenticated(false);
            AsyncStorage.removeItem("user_type");
            AsyncStorage.removeItem("rider_available");
          }}
        >
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Example components for each tab
const AvailableErrands = ({ accessToken }) => {
  const [loading, setLoading] = useState(false);
  const [errands, setErrands] = useState([]);

  const errandSocket = new WebSocket(`${SOCKET_URL}/?token=${accessToken}`);

  useEffect(() => {
    if (!accessToken) {
      console.log("❌️ Rider Socket Server: No Token Provided.");
      return;
    }

    errandSocket.onopen = () => {
      console.log("⚡️ Rider Socket Server Connected.");
    };

    errandSocket.onclose = () => {
      console.log("❌️ Rider Socket Server Disconnected.");
    };

    errandSocket.onerror = (error) => {
      console.log("⚠️ Rider Socket Server Error: ", error);
    };

    errandSocket.onmessage = (event) => {
      console.log("event:::", event.data);
      setErrands((prevErrands) => [...prevErrands, JSON.parse(event.data)]);
      // const data = JSON.parse(event.data); // Parse the incoming message
      // console.log("message from socket:::", data);

      // Assuming the data contains an errand object
      // if (data.type === "new_errand") {
      //   // Check the type of message
      //   setErrands((prevErrands) => [...prevErrands, data.errand]); // Update state with new errand
      // }
    };

    return () => {
      errandSocket.close();
    };
  }, [accessToken]);

  const renderErrandItem = ({ item }) => {
    console.log("errands:::", errands);
    return (
      <TouchableOpacity
        style={styles.errandCard}
        // onPress={() => handleAcceptErrand(item)}
      >
        <View style={styles.errandDetails}>
          <Text style={styles.errandTitle}>Errand Owner: Kelly Owoju</Text>
          <Text style={styles.errandTitle}>Errand Item: My Laptop</Text>
          <Text style={styles.errandTitle}>From: {item.pickup_location}</Text>
          <Text style={styles.errandTitle}>To: {item.drop_off_location}</Text>

          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept Errand</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyErrands = () => {
    return (
      <View style={{}}>
        <Text style={styles.title}>No Available Errands</Text>
        <Text style={{ textAlign: "center" }}>
          It looks like there are no errands available at the moment. Please
          check back later!
        </Text>
      </View>
    );
  };

  const handleAcceptErrand = (errand) => {
    // Logic to accept the errand
    console.log("Accepted errand:", errand);
  };

  return (
    <View style={{ width: "100%" }}>
      {errands.length === 0 ? (
        <EmptyErrands />
      ) : (
        <FlatList
          data={errands}
          renderItem={renderErrandItem}
          keyExtractor={(item) => item.errand_id}
          contentContainerStyle={styles.errandList}
        />
      )}
    </View>
  );
};

const Messages = () => {
  const [chats, setChats] = useState([]);

  // useEffect(() => {
  //   const loadChats = async () => {
  //     try {
  //       const storedChats = await AsyncStorage.getItem("chats");
  //       if (storedChats) {
  //         setChats(JSON.parse(storedChats));
  //       }
  //     } catch (error) {
  //       console.error("Failed to load chats:", error);
  //     }
  //   };

  //   loadChats();
  // }, []);

  const handleChatPress = (chat) => {
    // Logic to navigate to the chat screen with the selected user
    console.log("Chat with:", chat);
    // You can navigate to the chat screen here
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <Image source={{ uri: item.rider.image }} style={styles.chatImage} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.rider.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
        />
      ) : (
        <Text style={styles.emptyText}>No messages available.</Text>
      )}
    </View>
  );
};

const Earnings = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabTitle}>Earnings</Text>
    {/* Add your logic to display earnings here */}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  verificationContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationText: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  footerButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  errandList: {
    paddingBottom: 20,
  },
  errandCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
    flexDirection: "row",
    padding: 15,
  },
  errandImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  errandDetails: {
    flex: 1,
    justifyContent: "center",
  },
  errandTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  errandDescription: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
  },
  errandDistance: {
    fontSize: 12,
    color: "#999",
  },
  acceptButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  availabilityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  switch: {
    transform: [{ scale: 1.5 }],
  },
});

export default RiderHomePage;
