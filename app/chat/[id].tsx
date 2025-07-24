import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CHATS = [
  {
    id: '1',
    name: 'Budi Santoso',
    lastMessage: 'Apakah botol kaca masih tersedia?',
    time: '10:30',
    online: true,
  },
  {
    id: '2',
    name: 'Siti Aminah',
    lastMessage: 'Saya tertarik dengan vas bunga Anda',
    time: '09:15',
    online: false,
  },
  {
    id: '3',
    name: 'Dedi Cahyono',
    lastMessage: 'Bisa dikirim ke alamat saya?',
    time: 'Kemarin',
    online: false,
  },
];

const MOCK_MESSAGES = {
  '1': [
    { id: 1, text: 'Apakah botol kaca masih tersedia?', sent: false, time: '10:30' },
    { id: 2, text: 'Ya, masih tersedia', sent: true, time: '10:32' },
    { id: 3, text: 'Apakah Anda ingin membelinya?', sent: true, time: '10:33' },
  ],
};

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_MESSAGES[id as string] || []);
  const chat = CHATS.find(c => c.id === id);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: chatMessages.length + 1,
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarIcon}>
            <FontAwesome name="user-circle" size={40} color="#386B5F" />
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat?.name}</Text>
          <Text style={styles.headerStatus}>
            {chat?.online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.messagesList}>
        {chatMessages.map(message => (
          <View 
            key={message.id}
            style={[
              styles.messageContainer,
              message.sent ? styles.sentMessage : styles.receivedMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              !message.sent && styles.receivedMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.messageTime,
              !message.sent && styles.receivedMessageTime
            ]}>
              {message.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <FontAwesome name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backButton: {
    marginRight: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#386B5F',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F6F8',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  receivedMessageText: {
    color: '#222',
  },
  receivedMessageTime: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#386B5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});