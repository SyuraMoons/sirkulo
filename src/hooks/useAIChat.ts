/**
 * Real-time AI Chat Hook
 * Provides real-time AI chat functionality with Socket.IO integration
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/src/services/api';
import { socketService } from '@/src/services/socket';
import { useAuth } from '@/src/contexts/AuthContext';

interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface AIConversation {
  id: string;
  type: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: AIMessage;
}

interface UseAIChatReturn {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  messages: AIMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  createConversation: (type?: string, title?: string) => Promise<string | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  clearError: () => void;
}

export const useAIChat = (): UseAIChatReturn => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { state: authState } = useAuth();

  // Socket connection status
  useEffect(() => {
    const unsubscribe = socketService.onConnection((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  // Real-time message handling
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const unsubscribeMessages = socketService.onAIMessage((message: AIMessage) => {
      if (currentConversation && message.conversationId === currentConversation.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    const unsubscribeTyping = socketService.onTyping((data) => {
      if (currentConversation && data.conversationId === currentConversation.id && !data.userId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [authState.isAuthenticated, currentConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await apiService.getAIConversations();
      
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (error) {
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  // Create new conversation
  const createConversation = useCallback(async (type: string = 'general', title?: string): Promise<string | null> => {
    if (!authState.isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await apiService.createAIConversation(type, title);
      
      if (response.success && response.data) {
        const newConversation = response.data;
        setConversations(prev => [newConversation, ...prev]);
        return newConversation.id;
      } else {
        setError(response.error || 'Failed to create conversation');
        return null;
      }
    } catch (error) {
      setError('Failed to create conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  // Select conversation and load messages
  const selectConversation = useCallback(async (conversationId: string) => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      setMessages([]);
      setCurrentConversation(null);
      
      const response = await apiService.getAIConversation(conversationId);
      
      if (response.success && response.data) {
        setCurrentConversation(response.data.conversation);
        setMessages(response.data.messages || []);
        
        // Join the conversation room for real-time updates
        socketService.joinAIConversation(conversationId);
      } else {
        setError(response.error || 'Failed to load conversation');
      }
    } catch (error) {
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!authState.isAuthenticated || !currentConversation) return;

    try {
      // Add user message immediately for better UX
      const userMessage: AIMessage = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversation.id,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send via API for persistence
      const response = await apiService.sendAIMessage(currentConversation.id, content);
      
      if (response.success) {
        // Also send via socket for real-time AI response
        socketService.sendAIMessage(currentConversation.id, content);
      } else {
        setError(response.error || 'Failed to send message');
        // Remove the temporary message on failure
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      }
    } catch (error) {
      setError('Failed to send message');
    }
  }, [authState.isAuthenticated, currentConversation]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadConversations();
    }
  }, [authState.isAuthenticated, loadConversations]);

  return {
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
  };
};