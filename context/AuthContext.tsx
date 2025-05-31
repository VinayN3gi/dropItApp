import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser as fetchUserFromAppwrite } from 'appwrite/userAction';
import { Text, View } from 'react-native';
import { Loader } from 'components/Loader';
import { useNavigation } from '@react-navigation/native';

interface AuthContextType {
  authUser: any;
  setAuthUser: React.Dispatch<React.SetStateAction<any>>;
  getUser: () => any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  // Return the current user state
  const getUser = () => authUser;

  useEffect(() => {
    const initializeAuth = async () => {
      const res = await fetchUserFromAppwrite();
      if (res.success) {
        setAuthUser(res.user);
      } else {
        setAuthUser(null);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
      <Loader size="large" color="green" />
      
      {/* Group text inside a flexbox container */}
      <View className="mt-4 items-center">
        <Text className="font-poppins-bold text-brand-100 text-center mb-2">
          Authenticating...
        </Text>
        <Text className="font-poppins-medium text-brand-100 text-center">
          You will be automatically redirected
        </Text>
      </View>
    </View>
    );
  }

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
