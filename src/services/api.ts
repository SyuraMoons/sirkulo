/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async switchMode(mode: 'user' | 'business' | 'recycler') {
    return this.makeRequest('/auth/switch-mode', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/me');
  }

  // Cart methods
  async getCart() {
    return this.makeRequest('/cart');
  }

  async addToCart(listingId: number, quantity: number = 1) {
    return this.makeRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ listingId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.makeRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number) {
    return this.makeRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.makeRequest('/cart', {
      method: 'DELETE',
    });
  }

  // Listings methods
  async getListings(params?: {
    search?: string;
    wasteType?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getListingById(id: number) {
    return this.makeRequest(`/listings/${id}`);
  }

  async createListing(listingData: {
    title: string;
    description: string;
    wasteType: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    location: string;
  }) {
    return this.makeRequest('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  // Messaging methods
  async getConversations() {
    return this.makeRequest('/messaging/conversations');
  }

  async getConversation(id: string) {
    return this.makeRequest(`/messaging/conversations/${id}`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.makeRequest(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type: 'text' }),
    });
  }

  async createConversation(participantId: number, type: string = 'general') {
    return this.makeRequest('/messaging/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId, type }),
    });
  }

  // AI Chat methods
  async createAIConversation(type: string = 'general', title?: string) {
    return this.makeRequest('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ type, title }),
    });
  }

  async getAIConversations() {
    return this.makeRequest('/ai/conversations');
  }

  async getAIConversation(id: string) {
    return this.makeRequest(`/ai/conversations/${id}`);
  }

  async sendAIMessage(conversationId: string, content: string) {
    return this.makeRequest(`/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Orders methods
  async createOrder() {
    return this.makeRequest('/orders', {
      method: 'POST',
    });
  }

  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getOrder(id: number) {
    return this.makeRequest(`/orders/${id}`);
  }

  // Rating methods
  async createRating(listingId: number, rating: number, comment?: string) {
    return this.makeRequest('/ratings', {
      method: 'POST',
      body: JSON.stringify({ listingId, rating, comment }),
    });
  }

  async getListingRatings(listingId: number, params?: {
    minRating?: number;
    maxRating?: number;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/ratings/listing/${listingId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getListingRatingStats(listingId: number) {
    return this.makeRequest(`/ratings/listing/${listingId}/stats`);
  }

  async getUserRatings() {
    return this.makeRequest('/ratings/my-ratings');
  }

  async canUserRateListing(listingId: number) {
    return this.makeRequest(`/ratings/can-rate/${listingId}`);
  }

  // Notification methods
  async getNotifications(params?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async markNotificationsAsRead(notificationIds: number[]) {
    return this.makeRequest('/notifications/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async registerDeviceToken(token: string, platform: 'ios' | 'android' | 'web') {
    return this.makeRequest('/notifications/device-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  async getNotificationPreferences() {
    return this.makeRequest('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: any) {
    return this.makeRequest('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Search methods
  async searchListings(params: {
    query?: string;
    wasteTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    maxQuantity?: number;
    unit?: string;
    isNegotiable?: boolean;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    sortBy?: string;
    limit?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return this.makeRequest(`/search/listings?${queryParams.toString()}`);
  }

  async getSearchSuggestions(query: string, limit?: number, type?: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (limit) queryParams.append('limit', limit.toString());
    if (type) queryParams.append('type', type);
    
    return this.makeRequest(`/search/suggestions?${queryParams.toString()}`);
  }

  async getPopularSearches(limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    return this.makeRequest(`/search/popular${limit ? `?${queryParams.toString()}` : ''}`);
  }

  async getFilterOptions() {
    return this.makeRequest('/search/filters');
  }

  // Payment methods
  async createPayment(orderData: {
    orderId: number;
    paymentMethod: string;
    bankCode?: string;
    ewalletType?: string;
    customer: {
      givenNames: string;
      surname?: string;
      email: string;
      mobileNumber?: string;
    };
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }) {
    return this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getPayments() {
    return this.makeRequest('/payments');
  }

  async getPayment(id: string) {
    return this.makeRequest(`/payments/${id}`);
  }

  async getPaymentMethods() {
    return this.makeRequest('/payments/methods');
  }

  async getPaymentStats() {
    return this.makeRequest('/payments/stats');
  }

  // File upload methods
  async uploadImage(imageFile: FormData) {
    const token = await this.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: imageFile,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uploadMultipleImages(imageFiles: FormData) {
    const token = await this.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseURL}/upload/images`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: imageFiles,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('Multiple image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserImages() {
    return this.makeRequest('/upload/my-images');
  }

  async deleteImage(id: string) {
    return this.makeRequest(`/upload/image/${id}`, {
      method: 'DELETE',
    });
  }

  // Enhanced messaging methods
  async getConversationMessages(conversationId: string, params?: {
    search?: string;
    messageType?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/messaging/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async sendMessageWithAttachments(data: {
    conversationId: string;
    content?: string;
    type: 'text' | 'image' | 'file';
    attachments?: Array<{
      url: string;
      filename: string;
      mimeType: string;
      size: number;
    }>;
  }) {
    return this.makeRequest('/messaging/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(conversationId: string, messageIds?: number[], markAllAsRead?: boolean) {
    return this.makeRequest('/messaging/messages/read', {
      method: 'PUT',
      body: JSON.stringify({ conversationId, messageIds, markAllAsRead }),
    });
  }

  async contactSeller(listingId: number, message: string) {
    return this.makeRequest(`/messaging/contact-seller/${listingId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;