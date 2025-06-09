import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SystemData } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  systemData: SystemData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemData, setSystemData] = useState<SystemData | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Subscribe to real-time data updates
        const unsubscribe = dataService.subscribeToData((data) => {
          setSystemData(data);
        });

        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
          dataService.cleanup();
        };
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await dataService.authenticateUser(email, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        
        // Subscribe to real-time data updates after login
        const unsubscribe = dataService.subscribeToData((data) => {
          setSystemData(data);
        });

        // Store unsubscribe function for cleanup
        (window as any).dataUnsubscribe = unsubscribe;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setSystemData(null);
    localStorage.removeItem('currentUser');
    
    // Cleanup data subscriptions
    if ((window as any).dataUnsubscribe) {
      (window as any).dataUnsubscribe();
      delete (window as any).dataUnsubscribe;
    }
    dataService.cleanup();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, systemData }}>
      {children}
    </AuthContext.Provider>
  );
};