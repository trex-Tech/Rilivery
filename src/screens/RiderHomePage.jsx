import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Logout } from "../../services/Auth.service";
import { GlobalContext } from "../context";

const RiderHomePage = () => {
  const [activeTab, setActiveTab] = useState("availableErrands"); // Default tab

  const { setIsAuthenticated, setUserType } = useContext(GlobalContext);

  const renderContent = () => {
    switch (activeTab) {
      case "availableErrands":
        return <AvailableErrands />;
      case "messages":
        return <Messages />;
      case "earnings":
        return <Earnings />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationText}>
          Awaiting verification from the admin. Please check back later.
        </Text>
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setActiveTab("availableErrands")}
        >
          <AntDesign name="shoppingcart" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setActiveTab("messages")}
        >
          <AntDesign name="message1" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setActiveTab("earnings")}
        >
          <FontAwesome6 name="sack-dollar" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => {
            AsyncStorage.removeItem("access_token");
            setIsAuthenticated(false);
            setUserType("User");
          }}
        >
          <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Example components for each tab
const AvailableErrands = () => {
  const [loading, setLoading] = useState(false);
  const errands = [
    // {
    //   id: "1",
    //   title: "Grocery Delivery",
    //   description:
    //     "Pick up groceries from the store and deliver to the customer.",
    //   distance: "2.5 km",
    //   image: "https://example.com/grocery.jpg", // Placeholder image URL
    // },
    // {
    //   id: "2",
    //   title: "Package Drop-off",
    //   description: "Drop off a package at the post office.",
    //   distance: "1.2 km",
    //   image: "https://example.com/package.jpg", // Placeholder image URL
    // },
    // {
    //   id: "3",
    //   title: "Food Delivery",
    //   description: "Deliver food from the restaurant to the customer.",
    //   distance: "3.0 km",
    //   image: "https://example.com/food.jpg", // Placeholder image URL
    // },
  ];

  const renderErrandItem = ({ item }) => (
    <TouchableOpacity
      style={styles.errandCard}
      onPress={() => handleAcceptErrand(item)}
    >
      <Image source={{ uri: item.image }} style={styles.errandImage} />
      <View style={styles.errandDetails}>
        <Text style={styles.errandTitle}>{item.title}</Text>
        <Text style={styles.errandDescription}>{item.description}</Text>
        <Text style={styles.errandDistance}>{item.distance}</Text>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>Accept Errand</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyErrands = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Available Errands</Text>
        <Text style={styles.message}>
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
      <Text style={styles.title}>Available Errands</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : errands.length === 0 ? (
        <EmptyErrands />
      ) : (
        <FlatList
          data={errands}
          renderItem={renderErrandItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.errandList}
        />
      )}
    </View>
  );
};

const Messages = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const storedChats = await AsyncStorage.getItem("chats");
        if (storedChats) {
          setChats(JSON.parse(storedChats));
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    loadChats();
  }, []);

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
});

export default RiderHomePage;
