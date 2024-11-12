import React, { useEffect, useState, useRef } from "react";
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
  Modal,
  Animated,
  PanResponder,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = ({ route }) => {
  const { rider } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [amount, setAmount] = useState();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 10; // Start dragging if moved down
      },
      onPanResponderMove: (evt, gestureState) => {
        translateY.setValue(gestureState.dy); // Update position
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down enough, close the sheet
          closeBottomSheet();
        } else {
          // Otherwise, snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openBottomSheet = () => {
    setIsVisible(true);
    Animated.spring(translateY, {
      toValue: 0, // Move to the top
      useNativeDriver: true,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(translateY, {
      toValue: 300, // Move off-screen
      duration: 200, // Adjust the duration for a quicker close
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

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

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1, // Ensure unique ID
        text: message,
        sender: "currentUser", // Set sender to current user
        timestamp: new Date().toISOString(), // Add timestamp
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
          chats[chatIndex].lastMessage = message; // Update last message
          chats[chatIndex].lastMessageTime = new Date().toISOString(); // Update last message time
          chats[chatIndex].messages = updatedMessages;
        } else {
          chats.push({
            rider,
            lastMessage: message,
            lastMessageTime: new Date().toISOString(), // Set last message time
            messages: updatedMessages,
          });
        }

        await AsyncStorage.setItem("chats", JSON.stringify(chats));
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    }
  };

  const handleSendErrands = async () => {
    const newMessage = {
      id: messages.length + 1, // Ensure unique ID
      text: "New Errand",
      pickup: pickup,
      dropoff: dropoff,
      amount: amount,
      sender: "currentUser", // Set sender to current user
      timestamp: new Date().toISOString(), // Add timestamp
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage("");
    closeBottomSheet();

    // Save to AsyncStorage
    try {
      const storedChats = await AsyncStorage.getItem("chats");
      const chats = storedChats ? JSON.parse(storedChats) : [];
      const chatIndex = chats.findIndex((chat) => chat.rider.id === rider.id);

      if (chatIndex > -1) {
        chats[chatIndex].lastMessageTime = new Date().toISOString(); // Update last message time
        chats[chatIndex].messages = updatedMessages;
      } else {
        chats.push({
          rider,
          lastMessageTime: new Date().toISOString(), // Set last message time
          messages: updatedMessages,
        });
      }

      await AsyncStorage.setItem("chats", JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chat:", error);
    }
  };
  const handleCallRider = () => {
    const phone_number = rider.phone_number;
    // console.log("phone:::", phone_number);
    Linking.openURL(`tel:${phone_number}`);
  };

  const handleStartErrand = () => {
    // Logic to start the errand
    // You can add any necessary actions here
    closeBottomSheet(); // Close the bottom sheet after starting the errand
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(); // Format as needed
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // Format as "10:30 AM"
  };

  const renderMessages = () => {
    const groupedMessages = messages.reduce((acc, message) => {
      const dateKey = formatDate(message.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(message);
      return acc;
    }, {});

    // console.log("messages:::", groupedMessages);

    return Object.keys(groupedMessages).map((dateKey) => (
      <View key={dateKey}>
        <Text style={styles.dateHeader}>{dateKey}</Text>
        {groupedMessages[dateKey].map((item) => {
          const isCurrentUser = item.sender === "currentUser"; // Check if the message is from the current user
          return (
            <View
              key={item.id}
              style={[
                styles.messageContainer,
                isCurrentUser
                  ? styles.currentUserMessage
                  : styles.otherUserMessage,
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
              <Text
                style={[
                  styles.messageText,
                  { color: isCurrentUser ? "#fff" : "#333" },
                ]}
              >
                Pick-up: {item.pickup}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: isCurrentUser ? "#fff" : "#333" },
                ]}
              >
                Drop-off: {item.dropoff}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: isCurrentUser ? "#fff" : "#333" },
                ]}
              >
                Amount paid: ₦{item.amount}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: isCurrentUser ? "#fff" : "#333" },
                ]}
              >
                Errand status: PENDING
              </Text>
              <Text style={styles.messageTime}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          );
        })}
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.header}>
          <Image source={{ uri: rider.selfie }} style={styles.riderImage} />
          <Text style={styles.riderName}>
            {rider.first_name} {rider.last_name}
          </Text>
        </View>
        <ScrollView style={{ marginHorizontal: 10 }}>
          {renderMessages()}
        </ScrollView>
        <View style={styles.inputContainer}>
          {/* <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
          /> */}
          {/* <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
            <Text style={styles.callButtonText}>Call {rider.first_name}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.startErrandButton,
            { marginHorizontal: 10, marginBottom: 10 },
          ]}
          onPress={openBottomSheet} // Open the bottom sheet
        >
          <Text style={styles.startErrandButtonText}>Start Errand</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Draggable Bottom Sheet */}
      <Modal transparent visible={isVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={styles.modalBackground}>
            <Animated.View
              style={[styles.bottomSheet, { transform: [{ translateY }] }]}
              {...panResponder.panHandlers}
            >
              <Text style={styles.sheetTitle}>Start an Errand</Text>
              <TextInput
                style={styles.bottomSheetInput}
                placeholder="Pickup Location"
                value={pickup}
                onChangeText={(text) => setPickup(text)}
              />
              <TextInput
                style={styles.bottomSheetInput}
                placeholder="Drop-off Location"
                value={dropoff}
                onChangeText={(text) => setDropoff(text)}
              />
              <TextInput
                style={styles.bottomSheetInput}
                placeholder="Amount to Pay"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => setAmount(text)}
              />
              <TouchableOpacity
                style={styles.startErrandButton}
                onPress={handleSendErrands} // Start errand logic here
              >
                <Text style={styles.startErrandButtonText}>Start Errand</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeBottomSheet} // Close the bottom sheet
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
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
    width: "100%",
    alignItems: "center",
    padding: 15,
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
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  startErrandButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    height: 300,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomSheetInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#888",
  },
  messageTime: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
    textAlign: "right",
  },
});

export default ChatScreen;
