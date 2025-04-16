
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// User type definition
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  experience?: string;
  availability?: string[];
  preferences?: {
    position?: string;
    boatType?: string[];
    crewSize?: string[];
  };
  onboardingCompleted: boolean;
}

// Auth context interface
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<string>;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, we'll just create a dummy user
      // In a real app, this would validate credentials with a backend
      const mockUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        onboardingCompleted: false
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Successfully logged in!');
      
      // Redirect based on onboarding status
      if (!mockUser.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, create a new user
      const mockUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        onboardingCompleted: false
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Account created successfully!');
      
      return mockUser.id;
    } catch (error) {
      toast.error('Failed to create account');
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('You have been logged out');
    navigate('/');
  };

  // Update user profile
  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Value object for the context provider
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
