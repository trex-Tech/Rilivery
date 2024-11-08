import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

const ChatsList = ({ navigation }) => {
  const [chats, setChats] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadChats(); // Load chats whenever the screen is focused
    }, [])
  );

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

  const handleDeleteChats = async () => {
    Alert.alert(
      "Delete Chats",
      "Are you sure you want to clear your chat history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("chats"); // Clear chat history from AsyncStorage
              setChats([]); // Update state to reflect cleared chats
            } catch (error) {
              console.error("Failed to clear chat history:", error);
            }
          },
        },
      ]
    );
  };

  const handleChatPress = (chat) => {
    navigation.navigate("Chat", { rider: chat.rider });
  };

  const renderEmptyChatList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No Chats Available</Text>
      <Text style={styles.emptySubText}>
        Start a conversation to see your chats here.
      </Text>
    </View>
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <Image source={{ uri: item.rider.image }} style={styles.chatImage} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.rider?.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        <Text style={styles.lastMessageTime}>
          {moment(item.lastMessageTime).format("hh:mm A")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Chats</Text>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          contentContainerStyle={styles.chatList}
        />
      ) : (
        renderEmptyChatList() // Render empty chat list component
      )}
      {chats.length > 0 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteChats}
        >
          <Text style={styles.deleteButtonText}>Clear Chat History</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    backgroundColor: "#ccc", // Red color for delete button
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default ChatsList;
