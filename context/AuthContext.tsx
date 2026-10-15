import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUser as fetchUserFromAppwrite, logIn as appwriteLogIn, logOut as appwriteLogOut } from 'appwrite/userAction';
import { Text, View } from 'react-native';
import { Loader } from 'components/Loader';

interface AuthContextType {
  authUser: any;
  isLoading: boolean;
  setAuthUser: React.Dispatch<React.SetStateAction<any>>;
  getUser: () => any;
  checkAuth: () => Promise<any>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  // Return the current user state
  const getUser = () => authUser;

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetchUserFromAppwrite();
      if (res.success && res.user) {
        setAuthUser(res.user);
        return res.user;
      } else {
        setAuthUser(null);
        return null;
      }
    } catch {
      setAuthUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await appwriteLogIn(email, password);
    if (res.success && res.user) {
      setAuthUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await appwriteLogOut();
    setAuthUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isLoading,
        setAuthUser,
        getUser,
        checkAuth,
        login,
        logout,
      }}
    >
      {children}
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            zIndex: 9999,
          }}
        >
          <Loader size="large" color="#43A047" />
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text className="font-poppins-bold text-gray-800 text-center mb-2">
              Authenticating...
            </Text>
            <Text className="font-poppins-medium text-gray-400 text-center">
              Checking your session
            </Text>
          </View>
        </View>
      )}
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

