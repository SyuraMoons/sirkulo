/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/src/services/api';
import { socketService } from '@/src/services/socket';

interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  activeMode: 'user' | 'business' | 'recycler';
  roles: string[];
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  switchMode: (mode: 'user' | 'business' | 'recycler') => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        dispatch({ type: 'AUTH_START' });
        const response = await apiService.getProfile();
        
        if (response.success && response.data) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
          // Connect socket after successful auth check
          socketService.connect();
        } else {
          // Token is invalid, remove it
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('refresh_token');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        await AsyncStorage.setItem('auth_token', accessToken);
        await AsyncStorage.setItem('refresh_token', refreshToken);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        // Connect socket after successful authentication
        socketService.connect();
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Login failed' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.signup(userData);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        await AsyncStorage.setItem('auth_token', accessToken);
        await AsyncStorage.setItem('refresh_token', refreshToken);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        // Connect socket after successful authentication
        socketService.connect();
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Signup failed' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Remove tokens from storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      
      // Disconnect socket
      socketService.disconnect();
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const switchMode = async (mode: 'user' | 'business' | 'recycler'): Promise<boolean> => {
    try {
      const response = await apiService.switchMode(mode);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER', payload: { activeMode: mode } });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Mode switch failed' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mode switch failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    switchMode,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User, AuthState };