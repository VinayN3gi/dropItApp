import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Loader } from 'components/Loader';
import { getUser } from 'appwrite/userAction';
import { useAuth } from 'context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type User = {
  $createdAt: string;
  $id: string;
  $updatedAt: string;
  accessedAt: string;
  email: string;
  emailVerification: boolean;
  labels: string[];
  mfa: boolean;
  name: string;
  passwordUpdate: string;
  phone: string;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  registration: string;
  status: boolean;
};

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { logout } = useAuth();

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const res = await getUser();
        if (res.success) {
          setUser(res.user);
        } else throw new Error(res.error);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refresh]);

  const confirmLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of DropIt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  const handleLogout = async () => {
    setBtnLoading(true);
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Logout failed');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1 bg-gray-50 justify-center items-center px-6"
      >
        <Loader size="large" color="#43A047" />
        <Text className="font-poppins-bold text-gray-800 text-lg mt-4 text-center">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1 bg-gray-50 justify-center items-center px-6"
      >
        <Ionicons name="alert-circle-outline" size={48} color="#FF7474" />
        <Text className="font-poppins-bold text-gray-800 text-lg mt-3 text-center">
          Unable to fetch user details
        </Text>
        <TouchableOpacity
          onPress={() => setRefresh(!refresh)}
          className="mt-4 px-6 py-2.5 bg-brand rounded-xl shadow-sm"
        >
          <Text className="font-poppins-semibold text-white text-sm">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom }}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          {/* Header */}
          <View className="mb-6 pt-2">
            <Text className="text-gray-400 font-poppins-medium text-xs uppercase tracking-wider">
              Account
            </Text>
            <Text className="text-gray-900 font-poppins-bold text-2xl">
              User Profile
            </Text>
          </View>

          {/* User Hero Card */}
          <View className="bg-white rounded-3xl p-6 items-center border border-gray-100 shadow-sm mb-6">
            <View className="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand/20 items-center justify-center mb-3">
              <Text className="text-brand font-poppins-bold text-3xl">
                {userInitial}
              </Text>
            </View>

            <Text className="text-gray-900 font-poppins-bold text-xl text-center">
              {user.name}
            </Text>

            <Text className="text-gray-400 font-poppins-regular text-sm text-center mt-0.5">
              {user.email}
            </Text>

            <View className="flex-row items-center mt-3 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Ionicons name="shield-checkmark" size={14} color="#43A047" />
              <Text className="text-brand font-poppins-medium text-xs ml-1.5">
                Active Storage Account
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Text className="text-gray-400 font-poppins-semibold text-xs uppercase tracking-wider mb-3">
              Account Details
            </Text>

            <View className="py-3 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">Name</Text>
              <Text className="text-gray-800 font-poppins-semibold text-xs">{user.name}</Text>
            </View>

            <View className="py-3 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">Email</Text>
              <Text className="text-gray-800 font-poppins-semibold text-xs">{user.email}</Text>
            </View>

            <View className="py-3 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">Account Tier</Text>
              <Text className="text-brand font-poppins-semibold text-xs">Free Cloud (2 GB)</Text>
            </View>

            <View className="py-3 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">User ID</Text>
              <Text className="text-gray-400 font-poppins-regular text-[11px] max-w-[180px]" numberOfLines={1}>
                {user.$id}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={confirmLogout}
            disabled={btnLoading}
            className="w-full py-4 rounded-2xl items-center justify-center flex-row bg-red/10 border border-red/40"
          >
            <Ionicons name="log-out-outline" size={18} color="#FF7474" />
            <Text className="text-error font-poppins-semibold text-sm ml-2">
              {btnLoading ? 'Signing out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
