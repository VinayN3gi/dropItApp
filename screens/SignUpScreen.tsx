import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { Input } from 'components/Input';
import { CustomButton } from 'components/Button';
import { useNavigation } from '@react-navigation/native';
import { createUser } from 'appwrite/userAction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from 'context/AuthContext';

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [userName, setUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { setAuthUser } = useAuth();

  const handleClick = async ({
    email,
    password,
    userName,
  }: {
    email: string;
    password: string;
    userName: string;
  }) => {
    if (!userName.trim()) {
      setUsernameError('Username must be provided');
    } else if (!email.trim()) {
      setEmailError('Email must be provided');
    } else if (!password.trim()) {
      setPasswordError('Password must be provided');
    } else if (password.length < 8) {
      setPasswordError('Password must have at least 8 characters');
    } else {
      setLoading(true);
      try {
        const user = await createUser(email, password, userName);
        if (user.success && user.user) {
          setAuthUser(user.user);
        } else {
          throw new Error(user.error);
        }
      } catch (error: any) {
        Alert.alert('Sign Up Failed', error.message);
      } finally {
        setEmail('');
        setPassword('');
        setUsername('');
        setEmailError(undefined);
        setPasswordError(undefined);
        setUsernameError(undefined);
        setLoading(false);
      }
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-white"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md self-center">
            {/* Logo & Brand Header */}
            <View className="items-center mb-8">
              <Image
                source={require('../assets/splash-icon.png')}
                className="w-24 h-24 mb-3"
                resizeMode="contain"
              />
              <Text className="text-gray-900 font-poppins-bold text-2xl text-center">
                Create Account
              </Text>
              <Text className="text-gray-400 font-poppins-regular text-sm text-center mt-1">
                Get started with 2 GB free cloud storage
              </Text>
            </View>

            {/* Inputs */}
            <View className="space-y-1 mb-2">
              <Input
                label="Username"
                placeholder="Choose a display name"
                value={userName}
                error={usernameError}
                onChangeText={(e) => {
                  setPasswordError(undefined);
                  setEmailError(undefined);
                  setUsernameError(undefined);
                  setUsername(e);
                }}
              />
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(e) => {
                  setPasswordError(undefined);
                  setEmailError(undefined);
                  setUsernameError(undefined);
                  setEmail(e);
                }}
                value={email}
                error={emailError}
              />
              <Input
                label="Password"
                placeholder="At least 8 characters"
                secureTextEntry={true}
                onChangeText={(e) => {
                  setPasswordError(undefined);
                  setEmailError(undefined);
                  setUsernameError(undefined);
                  setPassword(e);
                }}
                value={password}
                error={passwordError}
              />
            </View>

            <CustomButton
              loading={loading}
              title="Create Account"
              className="mt-4 shadow-sm"
              onClick={() => handleClick({ email, password, userName })}
            />

            {/* Footer */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-500 font-poppins-medium text-sm">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text className="text-brand font-poppins-bold text-sm">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;