import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAIChat } from '@/src/hooks/useAIChat';
import { useAuth } from '@/src/contexts/AuthContext';

export default function AIRontoScreen() {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { state: authState } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isTyping,
    error,
    isConnected,
    createConversation,
    selectConversation,
    sendMessage,
    loadConversations,
    clearError,
  } = useAIChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  // Create or select conversation on mount
  useEffect(() => {
    if (authState.isAuthenticated && conversations.length === 0 && !isLoading) {
      handleCreateConversation();
    } else if (conversations.length > 0 && !selectedConversationId) {
      const latestConversation = conversations[0];
      setSelectedConversationId(latestConversation.id);
      selectConversation(latestConversation.id);
    }
  }, [authState.isAuthenticated, conversations, selectedConversationId, isLoading]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const handleCreateConversation = async () => {
    const conversationId = await createConversation('general', 'Chat with Ronto');
    if (conversationId) {
      setSelectedConversationId(conversationId);
      selectConversation(conversationId);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentConversation) {
      const messageContent = newMessage.trim();
      setNewMessage('');
      await sendMessage(messageContent);
    }
  };

  const handleQuickAction = (message: string) => {
    setNewMessage(message);
  };

  // Show loading state if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#386B5F" />
          </TouchableOpacity>
          <Text style={styles.headerName}>Ronto AI Assistant</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to chat with Ronto</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <View style={[styles.onlineBadge, { backgroundColor: isConnected ? '#4CAF50' : '#FFA500' }]} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Ronto AI Assistant</Text>
          <Text style={styles.headerStatus}>
            {isConnected ? 'Online' : 'Connecting...'} • Sustainability Consultant
          </Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesList} 
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && !isLoading && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <FontAwesome name="android" size={48} color="#386B5F" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Ronto AI!</Text>
            <Text style={styles.welcomeText}>
              I'm your AI assistant for sustainable living and recycling consultation. 
              How can I help you today?
            </Text>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.aiAvatar}>
                <FontAwesome name="android" size={16} color="#386B5F" />
              </View>
            )}
            <View style={styles.messageContent}>
              <Text style={[
                styles.messageText, 
                message.role === 'assistant' && styles.receivedMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.messageTime, 
                message.role === 'assistant' && styles.receivedMessageTime
              ]}>
                {new Date(message.timestamp).toLocaleTimeString().slice(0, 5)}
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
            onPress={() => handleQuickAction('How do I recycle plastic bottles?')}
          >
            <Text style={styles.quickActionText}>♻️ Recycling Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('Give me upcycling ideas for old items')}
          >
            <Text style={styles.quickActionText}>🔄 Upcycling Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('How to live more sustainably?')}
          >
            <Text style={styles.quickActionText}>🌱 Sustainable Living</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('Find eco-friendly businesses near me')}
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
          editable={!isLoading && isConnected}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={[
            styles.sendButton, 
            (newMessage.trim() && !isLoading && isConnected) ? styles.sendButtonActive : null
          ]}
          disabled={!newMessage.trim() || isLoading || !isConnected}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <FontAwesome 
              name="send" 
              size={18} 
              color={(newMessage.trim() && isConnected) ? '#fff' : '#ccc'} 
            />
          )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#386B5F',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F3EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#386B5F',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
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
