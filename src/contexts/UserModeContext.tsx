import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserMode } from '@/src/constants/chat';

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

interface UserModeProviderProps {
  children: ReactNode;
}

export function UserModeProvider({ children }: UserModeProviderProps) {
  const [mode, setMode] = useState<UserMode>('Basic');

  return <UserModeContext.Provider value={{ mode, setMode }}>{children}</UserModeContext.Provider>;
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}
