import React, { useEffect, useState, useRef, useContext } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCKET_URL } from "../../config";
import { GlobalContext } from "../context";
import { fetchRiderErrands, SendErrand } from "../../services/User.service";
import LoadingButton, { OutlinedButton } from "../components/Button";
import Ionicons from "@expo/vector-icons/Ionicons";

const ChatScreen = ({ route }) => {
  const { rider } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [amount, setAmount] = useState();
  const [item, setItem] = useState("");
  const { accessToken } = useContext(GlobalContext);
  const errandSocket = new WebSocket(`${SOCKET_URL}/?token=${accessToken}`);
  const [sendErrandLoading, setSendErrandLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const scrollViewRef = useRef(null);
  const [chatLoading, setChatloading] = useState(false);

  useEffect(() => {
    if (!chatLoading) {
      scrollViewRef.current?.scrollToEnd({ animated: true }); // Scroll to the bottom when loading is complete
    }
  }, [messages, chatLoading]);

  // useEffect(() => {
  //   if (!accessToken)
  //     return console.log("❌️ Chat Socket Server: No Token Provided.");

  //   errandSocket.onopen = () =>
  //     console.log("⚡️ Chat Socket Server Connected.");
  //   errandSocket.onclose = () => {
  //     console.log("❌️Chat Socket Server Disconnected.");
  //   };
  //   errandSocket.onerror = (error) =>
  //     console.log("⚠️ Chat Socket Server Error: ", error);
  //   errandSocket.onmessage = (data) =>
  //     console.log("message from socket:::", data);

  //   return () => {
  //     errandSocket.close();
  //   };
  // }, [accessToken]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 10;
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
      toValue: 500, // Move off-screen
      duration: 200, // Adjust the duration for a quicker close
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const loadChatMessages = async () => {
    setChatloading(true);
    try {
      // const storedChats = await AsyncStorage.getItem("chats");
      // const chats = storedChats ? JSON.parse(storedChats) : [];
      // const chat = chats.find((chat) => chat.rider.id === rider.id);
      const res = await fetchRiderErrands(rider.id);

      if (res.data.status === "success") {
        // console.log("errands res:::", res.data.data);
        setMessages(res.data.data || []);
        setChatloading(false);
      }

      // if (chat) {
      //   setMessages(chat.messages || []);
      // }
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      setChatloading(false);
    }
  };
  useEffect(() => {
    loadChatMessages();
    // console.log(rider);
  }, [rider]);

  useEffect(() => {
    const fetchUserFromAsyncStorage = async () => {
      const user = await AsyncStorage.getItem("user_data");
      const parsedUser = JSON.parse(user);

      console.log("User in chat screen:::", parsedUser);
      setCurrentUser(parsedUser);
    };
    fetchUserFromAsyncStorage();
  }, []);

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
    setSendErrandLoading(true);
    if (
      pickup === "" ||
      dropoff === "" ||
      amount === undefined ||
      item === ""
    ) {
      setSendErrandLoading(false);
      Alert.alert("Please fill your Errand details");
    } else {
      const newMessage = {
        id: messages.length + 1, // Ensure unique ID
        pickup_location: pickup,
        drop_off_location: dropoff,
        price: amount,
        item: item,
        sender: "currentUser",
        created_at: new Date().toISOString(), // Add timestamp
      };

      const res = await SendErrand(pickup, dropoff, amount, rider.id, item);

      if (res.data.status === "success") {
        console.log(res.data);
        setSendErrandLoading(false);
        const updatedMessages = [...messages, newMessage];
        loadChatMessages();
        setMessage("");
        closeBottomSheet();

        // Save to AsyncStorage
        // try {
        //   const storedChats = await AsyncStorage.getItem("chats");
        //   const chats = storedChats ? JSON.parse(storedChats) : [];
        //   const chatIndex = chats.findIndex(
        //     (chat) => chat.rider.id === rider.id
        //   );

        //   if (chatIndex > -1) {
        //     chats[chatIndex].lastMessageTime = new Date().toISOString(); // Update last message time
        //     chats[chatIndex].messages = updatedMessages;
        //   } else {
        //     chats.push({
        //       rider,
        //       lastMessageTime: new Date().toISOString(), // Set last message time
        //       messages: updatedMessages,
        //     });
        //   }

        //   await AsyncStorage.setItem("chats", JSON.stringify(chats));
        // } catch (error) {
        //   console.error("Failed to save chat:", error);
        // }
      }
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
    if (chatLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />; // Show loader if chat is loading
    }

    if (messages.length === 0) {
      return (
        <View style={styles.emptyMessageContainer}>
          <Text style={styles.emptyMessageText}>No errands available.</Text>
        </View>
      ); // Show empty message if there are no messages
    }

    const groupedMessages = messages.reduce((acc, message) => {
      const dateKey = formatDate(message.created_at);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(message);
      return acc;
    }, {});

    const sortedDateKeys = Object.keys(groupedMessages).sort().reverse();

    return sortedDateKeys.map((dateKey) => (
      <View key={dateKey}>
        <Text style={styles.dateHeader}>{dateKey}</Text>
        {groupedMessages[dateKey]
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((item) => {
            const isCurrentUser =
              item.user?.id === currentUser.id || item.sender === "currentUser";
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
                  New Errand
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    { color: isCurrentUser ? "#fff" : "#333" },
                  ]}
                >
                  Item to pickup: {item.item}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    { color: isCurrentUser ? "#fff" : "#333" },
                  ]}
                >
                  Pickup Location: {item.pickup_location}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    { color: isCurrentUser ? "#fff" : "#333" },
                  ]}
                >
                  Dropoff Location: {item.drop_off_location}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    { color: isCurrentUser ? "#fff" : "#333" },
                  ]}
                >
                  Amount paid: ₦{item.price}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    { color: isCurrentUser ? "#fff" : "#333" },
                  ]}
                >
                  Errand status: {item.status_display}
                </Text>
                <Text style={styles.messageTime}>
                  {formatTime(item.created_at || item.timestamp)}
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
        <ScrollView style={{ marginHorizontal: 10 }} ref={scrollViewRef}>
          {renderMessages()}
        </ScrollView>
        {/* <View style={styles.inputContainer}> */}
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
        {/* <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
            <Text style={styles.callButtonText}>Call {rider.first_name}</Text>
          </TouchableOpacity> */}
        {/* </View> */}

        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 10,
            marginBottom: 10,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <LoadingButton
              title={`Call ${rider.first_name}`}
              onPress={handleCallRider}
              icon={<Ionicons name="call-outline" size={24} color="white" />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <OutlinedButton title={"Start Errand"} onPress={openBottomSheet} />
          </View>
        </View>
      </SafeAreaView>

      {/* Draggable Bottom Sheet */}
      <Modal transparent visible={isVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={styles.modalBackground}>
            <Animated.View
              style={[styles.bottomSheet, { transform: [{ translateY }] }]}
              {...panResponder.panHandlers}
            >
              <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <Text style={styles.sheetTitle}>Start an Errand</Text>
                <Text style={{ marginTop: 20 }}>Item to Pickup</Text>
                <TextInput
                  style={styles.bottomSheetInput}
                  placeholder="Item to pickup"
                  value={item}
                  onChangeText={(text) => setItem(text)}
                />
                <Text style={{}}>Pickup Location</Text>
                <TextInput
                  style={styles.bottomSheetInput}
                  placeholder="Pickup Location"
                  value={pickup}
                  onChangeText={(text) => setPickup(text)}
                />
                <Text>Drop-off Location</Text>
                <TextInput
                  style={styles.bottomSheetInput}
                  placeholder="Drop-off Location"
                  value={dropoff}
                  onChangeText={(text) => setDropoff(text)}
                />
                <Text>Amount to pay</Text>
                <TextInput
                  style={styles.bottomSheetInput}
                  placeholder="Amount to Pay"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => setAmount(text)}
                />
                {/* <TouchableOpacity
                  style={styles.startErrandButton}
                  onPress={handleSendErrands} // Start errand logic here
                >
                  <Text style={styles.startErrandButtonText}>Start Errand</Text>
                </TouchableOpacity> */}
                <LoadingButton
                  title={"Send"}
                  loading={sendErrandLoading}
                  onPress={handleSendErrands}
                />
                {/* <TouchableOpacity
                style={styles.closeButton}
                onPress={closeBottomSheet} // Close the bottom sheet
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity> */}
              </KeyboardAvoidingView>
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
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
  },
  currentUserMessage: {
    backgroundColor: "#007BFF",
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
    height: 500,
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
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#888",
  },
});

export default ChatScreen;
