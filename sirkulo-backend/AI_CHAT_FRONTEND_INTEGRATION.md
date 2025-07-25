/**
 * AI Chat Frontend Integration Guide
 * Complete Socket.IO client implementation for real-time AI chat
 */

import { io, Socket } from 'socket.io-client';

// Types for AI Chat events
export interface AIConversation {
  id: string;
  type: string;
  title: string;
  status: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationData {
  type?: 'general' | 'product_inquiry' | 'order_support' | 'recommendation' | 'technical_support';
  title?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * AI Chat Socket Client Class
 * Handles all real-time AI chat functionality
 */
export class AIChatSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Connect to AI chat namespace
   */
  public connect(token: string, serverUrl: string = 'http://localhost:3000'): void {
    this.socket = io(`${serverUrl}/ai-chat`, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🤖 Connected to AI Chat');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🤖 Disconnected from AI Chat:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🤖 AI Chat connection error:', error);
      this.emit('connection_error', error);
    });

    // AI Chat specific events
    this.socket.on('ai:conversation-created', (conversation: AIConversation) => {
      this.emit('conversation_created', conversation);
    });

    this.socket.on('ai:conversation-updated', (data: any) => {
      this.emit('conversation_updated', data);
    });

    this.socket.on('ai:conversation-archived', (data: { conversationId: string }) => {
      this.emit('conversation_archived', data);
    });

    this.socket.on('ai:message-received', (message: AIMessage) => {
      this.emit('message_received', message);
    });

    this.socket.on('ai:assistant-typing', (data: { conversationId: string; isTyping: boolean }) => {
      this.emit('assistant_typing', data);
    });

    this.socket.on('ai:user-typing', (data: { userId: number; userEmail: string; isTyping: boolean }) => {
      this.emit('user_typing', data);
    });

    this.socket.on('ai:user-joined', (data: { userId: number; userEmail: string }) => {
      this.emit('user_joined', data);
    });

    this.socket.on('ai:user-left', (data: { userId: number; userEmail: string }) => {
      this.emit('user_left', data);
    });
  }

  /**
   * Create a new conversation
   */
  public createConversation(
    data: CreateConversationData,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:create-conversation', data, callback);
  }

  /**
   * Join a conversation
   */
  public joinConversation(
    conversationId: string,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:join-conversation', { conversationId }, callback);
  }

  /**
   * Leave a conversation
   */
  public leaveConversation(
    conversationId: string,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:leave-conversation', { conversationId }, callback);
  }

  /**
   * Send a message
   */
  public sendMessage(
    data: SendMessageData,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:send-message', data, callback);
  }

  /**
   * Start typing indicator
   */
  public startTyping(conversationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('ai:typing-start', { conversationId });
  }

  /**
   * Stop typing indicator
   */
  public stopTyping(conversationId: string): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('ai:typing-stop', { conversationId });
  }

  /**
   * Get user conversations
   */
  public getConversations(
    options: { status?: string; limit?: number; offset?: number } = {},
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:get-conversations', options, callback);
  }

  /**
   * Get specific conversation
   */
  public getConversation(
    conversationId: string,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:get-conversation', { conversationId }, callback);
  }

  /**
   * Archive conversation
   */
  public archiveConversation(
    conversationId: string,
    callback?: (response: any) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('ai:archive-conversation', { conversationId }, callback);
  }

  /**
   * Add event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect from socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// React Hook for AI Chat
export function useAIChat(token: string, serverUrl?: string) {
  const [client] = useState(() => new AIChatSocketClient());
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  useEffect(() => {
    // Connect to AI chat
    client.connect(token, serverUrl);

    // Setup event listeners
    client.on('connected', () => setIsConnected(true));
    client.on('disconnected', () => setIsConnected(false));

    client.on('conversation_created', (conversation: AIConversation) => {
      setConversations(prev => [conversation, ...prev]);
    });

    client.on('conversation_updated', (data: any) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === data.conversationId 
            ? { ...conv, ...data, updatedAt: data.updatedAt }
            : conv
        )
      );
    });

    client.on('conversation_archived', (data: { conversationId: string }) => {
      setConversations(prev => 
        prev.filter(conv => conv.id !== data.conversationId)
      );
      if (currentConversation?.id === data.conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    });

    client.on('message_received', (message: AIMessage) => {
      setMessages(prev => {
        // Remove temporary message if it exists
        const filtered = prev.filter(msg => !msg.id.startsWith('temp-'));
        return [...filtered, message];
      });
    });

    client.on('assistant_typing', (data: { conversationId: string; isTyping: boolean }) => {
      if (currentConversation?.id === data.conversationId) {
        setIsAssistantTyping(data.isTyping);
      }
    });

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [token, serverUrl]);

  const createConversation = useCallback((data: CreateConversationData) => {
    return new Promise((resolve, reject) => {
      client.createConversation(data, (response: any) => {
        if (response.success) {
          resolve(response.conversation);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [client]);

  const joinConversation = useCallback((conversationId: string) => {
    return new Promise((resolve, reject) => {
      client.joinConversation(conversationId, (response: any) => {
        if (response.success) {
          // Get conversation details
          client.getConversation(conversationId, (convResponse: any) => {
            if (convResponse.success) {
              setCurrentConversation(convResponse.conversation);
              setMessages(convResponse.conversation.messages || []);
              resolve(convResponse.conversation);
            } else {
              reject(new Error(convResponse.error));
            }
          });
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [client]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    // Add temporary message immediately
    const tempMessage: AIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      status: 'sending',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    return new Promise((resolve, reject) => {
      client.sendMessage({ conversationId, content }, (response: any) => {
        if (response.success) {
          resolve(response.messages);
        } else {
          // Remove temp message on error
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
          reject(new Error(response.error));
        }
      });
    });
  }, [client]);

  const loadConversations = useCallback(() => {
    client.getConversations({}, (response: any) => {
      if (response.success) {
        setConversations(response.conversations);
      }
    });
  }, [client]);

  return {
    isConnected,
    conversations,
    currentConversation,
    messages,
    isAssistantTyping,
    createConversation,
    joinConversation,
    sendMessage,
    loadConversations,
    startTyping: (conversationId: string) => client.startTyping(conversationId),
    stopTyping: (conversationId: string) => client.stopTyping(conversationId),
    archiveConversation: (conversationId: string) => client.archiveConversation(conversationId)
  };
}

// Example usage in React component:
/*
function AIChatComponent() {
  const { 
    isConnected, 
    conversations, 
    currentConversation, 
    messages, 
    isAssistantTyping,
    createConversation,
    joinConversation,
    sendMessage,
    loadConversations
  } = useAIChat(userToken);

  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, loadConversations]);

  const handleSendMessage = async (content: string) => {
    if (currentConversation) {
      try {
        await sendMessage(currentConversation.id, content);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation({
        type: 'general',
        title: 'New AI Chat'
      });
      await joinConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      
      <div>
        <h3>Conversations</h3>
        {conversations.map(conv => (
          <div key={conv.id} onClick={() => joinConversation(conv.id)}>
            {conv.title}
          </div>
        ))}
        <button onClick={handleCreateConversation}>New Chat</button>
      </div>

      {currentConversation && (
        <div>
          <h3>{currentConversation.title}</h3>
          <div>
            {messages.map(msg => (
              <div key={msg.id}>
                <strong>{msg.role}:</strong> {msg.content}
              </div>
            ))}
            {isAssistantTyping && <div>AI is typing...</div>}
          </div>
          
          <input 
            type="text" 
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e.target.value);
                e.target.value = '';
              }
            }}
            placeholder="Type your message..."
          />
        </div>
      )}
    </div>
  );
}
*/