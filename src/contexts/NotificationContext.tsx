/**
 * Notification Context
 * Manages notifications state and provides notification methods
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
  imageUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
    orderUpdates: boolean;
    paymentAlerts: boolean;
    listingNotifications: boolean;
    messageNotifications: boolean;
    priceAlerts: boolean;
    securityAlerts: boolean;
    promotionalOffers: boolean;
  };
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: number[] }
  | { type: 'SET_PREFERENCES'; payload: any }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: number };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    orderUpdates: true,
    paymentAlerts: true,
    listingNotifications: true,
    messageNotifications: true,
    priceAlerts: true,
    securityAlerts: true,
    promotionalOffers: false,
  },
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        isLoading: false,
        error: null,
      };
    }

    case 'ADD_NOTIFICATION': {
      const newNotifications = [action.payload, ...state.notifications];
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: newNotifications,
        unreadCount,
      };
    }

    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        action.payload.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount,
      };
    }

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };

    default:
      return state;
  }
};

interface NotificationContextType {
  state: NotificationState;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationIds: number[]) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  updatePreferences: (preferences: any) => Promise<boolean>;
  registerDeviceToken: (token: string, platform: 'ios' | 'android' | 'web') => Promise<boolean>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { state: authState } = useAuth();

  // Load notifications when user logs in
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadNotifications();
      loadPreferences();
    } else {
      // Clear notifications when user logs out
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    }
  }, [authState.isAuthenticated]);

  const loadNotifications = async () => {
    if (!authState.isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getNotifications({ limit: 50 });
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.notifications || [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load notifications' });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
    }
  };

  const loadPreferences = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const response = await apiService.getNotificationPreferences();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_PREFERENCES', payload: response.data });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const markAsRead = async (notificationIds: number[]): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      const response = await apiService.markNotificationsAsRead(notificationIds);
      
      if (response.success) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationIds });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to mark notifications as read' });
        return false;
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notifications as read' });
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    const unreadIds = state.notifications.filter(n => !n.isRead).map(n => n.id);
    return markAsRead(unreadIds);
  };

  const updatePreferences = async (preferences: any): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      const response = await apiService.updateNotificationPreferences(preferences);
      
      if (response.success) {
        dispatch({ type: 'SET_PREFERENCES', payload: preferences });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update preferences' });
        return false;
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
      return false;
    }
  };

  const registerDeviceToken = async (token: string, platform: 'ios' | 'android' | 'web'): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      const response = await apiService.registerDeviceToken(token, platform);
      
      if (response.success) {
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to register device token' });
        return false;
      }
    } catch (error) {
      console.error('Error registering device token:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register device token' });
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: NotificationContextType = {
    state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    registerDeviceToken,
    clearError,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export type { Notification, NotificationState };