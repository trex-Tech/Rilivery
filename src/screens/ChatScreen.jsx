import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal, // Import Modal
} from "react-native";

const ChatScreen = ({ route }) => {
  const { rider } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropOffLocation, setDropOffLocation] = useState("");
  const [amountToPay, setAmountToPay] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const currentUserId = "currentUser";
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadChatMessages = async () => {
      try {
        const storedChats = await AsyncStorage.getItem("chats");
        const chats = storedChats ? JSON.parse(storedChats) : [];
        const chat = chats.find((chat) => chat.rider.id === rider.id);

        if (chat) {
          setMessages(chat.messages || []);
        }
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      }
    };

    loadChatMessages();
  }, [rider]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1, // Ensure unique ID
        text: message,
        sender: currentUserId, // Set sender to current user
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setMessage("");

      // Save to AsyncStorage
      try {
        const storedChats = await AsyncStorage.getItem("chats");
        const chats = storedChats ? JSON.parse(storedChats) : [];
        const chatIndex = chats.findIndex((chat) => chat.rider.id === rider.id);

        if (chatIndex > -1) {
          chats[chatIndex].lastMessage = message;
          chats[chatIndex].messages = updatedMessages;
        } else {
          chats.push({
            rider,
            lastMessage: message,
            messages: updatedMessages,
          });
        }

        await AsyncStorage.setItem("chats", JSON.stringify(chats));
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    }
  };

  const handleCallRider = () => {
    const phoneNumber = rider.phoneNumber;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? "#fff" : "#333" },
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  const handleStartErrand = () => {
    // Logic to start the errand can be added here
    console.log("Errand started with:", {
      pickupLocation,
      dropOffLocation,
      amountToPay,
    });
    // Close the modal after starting the errand
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.header}>
          <Image source={{ uri: rider.image }} style={styles.riderImage} />
          <Text style={styles.riderName}>{rider.name}</Text>
          <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.startErrandButton}
          onPress={() => setModalVisible(true)} // Open the modal
        >
          <Text style={styles.startErrandButtonText}>Start Errand</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Modal for Errand Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close modal on back press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start an Errand</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Pickup Location"
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Drop-off Location"
              value={dropOffLocation}
              onChangeText={setDropOffLocation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount to Pay"
              value={amountToPay}
              onChangeText={setAmountToPay}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.startErrandButton}
              onPress={handleStartErrand}
            >
              <Text style={styles.startErrandButtonText}>Start Errand</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)} // Close the modal
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  riderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  riderName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  callButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  callButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  currentUserMessage: {
    backgroundColor: "#28a745",
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#333",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  startErrandButton: {
    backgroundColor: "#28a745", // Green color for start errand button
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  startErrandButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: "100%",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#FF4D4D", // Red color for close button
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default ChatScreen;
