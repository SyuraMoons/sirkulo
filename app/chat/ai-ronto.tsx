import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hello! I'm Ronto, your AI assistant for sustainable living and recycling consultation. How can I help you today?",
    sent: false,
    time: new Date().toLocaleTimeString().slice(0, 5),
  },
];

const AI_RESPONSES = [
  "That's a great question about recycling! Let me help you with that.",
  "Based on sustainable practices, I'd recommend considering the environmental impact first.",
  'Here are some eco-friendly alternatives you might want to explore:',
  'For waste management, the best approach would be to reduce, reuse, then recycle.',
  'I can help you find local recycling centers or sustainable businesses in your area.',
  "That's an interesting challenge. Let me suggest some creative upcycling ideas.",
  "From an environmental perspective, here's what I'd recommend:",
  'Great initiative! Sustainability starts with small steps like this.',
];

export default function AIRontoScreen() {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('recycle') || lowerMessage.includes('recycling')) {
      return 'Great question about recycling! Here are some tips: Always clean containers before recycling, check your local recycling guidelines as they vary by location, and remember that not all plastics are recyclable. Would you like specific advice about a particular material?';
    }

    if (lowerMessage.includes('plastic') || lowerMessage.includes('bottle')) {
      return 'For plastic items, look for the recycling number (1-7) on the bottom. Numbers 1 and 2 are most commonly recycled. Consider reducing plastic use by switching to reusable alternatives like glass or stainless steel containers.';
    }

    if (lowerMessage.includes('upcycle') || lowerMessage.includes('reuse')) {
      return 'Upcycling is fantastic! You can transform old items into something new and useful. For example: turn glass jars into storage containers, use old t-shirts as cleaning rags, or convert cardboard boxes into organizers. What items are you looking to upcycle?';
    }

    if (lowerMessage.includes('sustainable') || lowerMessage.includes('eco')) {
      return 'Sustainable living is all about making conscious choices. Start small: use reusable bags, choose products with minimal packaging, support local businesses, and consider the lifecycle of items before purchasing. Every small action counts!';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      return "I'm here to help with all your sustainability questions! I can assist with recycling guidelines, upcycling ideas, eco-friendly product recommendations, waste reduction strategies, and connecting you with local green businesses. What specific area interests you most?";
    }

    // Default responses
    const randomIndex = Math.floor(Math.random() * AI_RESPONSES.length);
    return (
      AI_RESPONSES[randomIndex] +
      ' Feel free to ask me anything about recycling, upcycling, or sustainable living practices!'
    );
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      // Add user message
      const userMsg: Message = {
        id: chatMessages.length + 1,
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };

      const userInput = newMessage;
      setChatMessages(prev => [...prev, userMsg]);
      setNewMessage('');
      setIsTyping(true);

      // Simulate AI thinking time
      setTimeout(() => {
        const aiResponse: Message = {
          id: chatMessages.length + 2,
          text: generateAIResponse(userInput),
          sent: false,
          time: new Date().toLocaleTimeString().slice(0, 5),
        };

        setChatMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
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
            <FontAwesome name="android" size={32} color="#386B5F" />
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Ronto AI Assistant</Text>
          <Text style={styles.headerStatus}>Online • Sustainability Consultant</Text>
        </View>
      </View>

      <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
        {chatMessages.map((message: Message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sent ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            {!message.sent && (
              <View style={styles.aiAvatar}>
                <FontAwesome name="android" size={16} color="#386B5F" />
              </View>
            )}
            <View style={styles.messageContent}>
              <Text style={[styles.messageText, !message.sent && styles.receivedMessageText]}>
                {message.text}
              </Text>
              <Text style={[styles.messageTime, !message.sent && styles.receivedMessageTime]}>
                {message.time}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageContainer, styles.receivedMessage]}>
            <View style={styles.aiAvatar}>
              <FontAwesome name="android" size={16} color="#386B5F" />
            </View>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#386B5F" />
              <Text style={styles.typingText}>Ronto is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage('How do I recycle plastic bottles?')}
          >
            <Text style={styles.quickActionText}>♻️ Recycling Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage('Give me upcycling ideas for old items')}
          >
            <Text style={styles.quickActionText}>🔄 Upcycling Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage('How to live more sustainably?')}
          >
            <Text style={styles.quickActionText}>🌱 Sustainable Living</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage('Find eco-friendly businesses near me')}
          >
            <Text style={styles.quickActionText}>🏪 Green Businesses</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Ask Ronto about sustainability..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]}
          disabled={!newMessage.trim()}
        >
          <FontAwesome name="send" size={18} color={newMessage.trim() ? '#fff' : '#ccc'} />
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    backgroundColor: '#F8FDF9',
  },
  backButton: {
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E6F3EC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#386B5F',
  },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#386B5F',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E6F3EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#386B5F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    overflow: 'hidden',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 8,
  },
  receivedMessageText: {
    color: '#222',
    backgroundColor: '#F5F6F8',
  },
  receivedMessageTime: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginRight: 0,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickActionButton: {
    backgroundColor: '#E6F3EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#386B5F',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#386B5F',
  },
});
