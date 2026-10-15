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
import { useAuth } from 'context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SignInScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { login, checkAuth } = useAuth();

  const handleClick = async ({ email, password }: { email: string; password: string }) => {
    if (!email.trim()) {
      setEmailError('Email must be provided');
    } else if (!password.trim()) {
      setPasswordError('Password must be provided');
    } else if (password.length < 8) {
      setPasswordError('Password must have at least 8 characters');
    } else {
      setLoading(true);
      try {
        const result = await login(email, password);
        if (!result.success) {
          throw new Error(result.error);
        }
      } catch (error: any) {
        if (error?.message?.toLowerCase().includes('session is active')) {
          await checkAuth();
        } else {
          Alert.alert('Sign In Failed', error.message || 'Login failed');
        }
      } finally {
        setEmail('');
        setPassword('');
        setEmailError(undefined);
        setPasswordError(undefined);
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
              {/*<Image
                source={require('../assets/splash-icon.png')}
                className="w-24 h-24 mb-3"
                resizeMode="contain"
              /> */}
              <Text className="text-gray-900 font-poppins-bold text-2xl text-center">
                Welcome Back
              </Text>
              <Text className="text-gray-400 font-poppins-regular text-sm text-center mt-1">
                Access your cloud files anywhere, anytime
              </Text>
            </View>

            {/* Form Inputs */}
            <View className="space-y-1 mb-2">
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(e) => {
                  setPasswordError(undefined);
                  setEmailError(undefined);
                  setEmail(e);
                }}
                value={email}
                error={emailError}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={true}
                onChangeText={(e) => {
                  setPasswordError(undefined);
                  setEmailError(undefined);
                  setPassword(e);
                }}
                value={password}
                error={passwordError}
              />
            </View>

            <CustomButton
              loading={loading}
              title="Sign In"
              className="mt-4 shadow-sm"
              onClick={() => handleClick({ email, password })}
            />

            {/* Footer */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-500 font-poppins-medium text-sm">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text className="text-brand font-poppins-bold text-sm">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;