import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Input } from 'components/Input';
import { CustomButton } from 'components/Button';
import { useNavigation } from '@react-navigation/native';
import { Loader } from 'components/Loader';
import { logIn } from 'appwrite/userAction';
import { useAuth } from 'context/AuthContext';



const SignInScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [loading,setLoading]=useState<boolean>(false)
  const { authUser, setAuthUser } = useAuth(); 

   useEffect(() => {
    if (authUser) {
      navigation.replace('Tabs'); 
    }
  }, [authUser]);



  const handleClick = async ({ email, password }: { email: string; password: string }) => {
    if (!email.trim()) {
      setEmailError('Email must be provided')
    } else if (!password.trim()) {
      setPasswordError('Password must be provided')
    }
    else if(password.length < 8)
      {
        setPasswordError('Password must have 8 characters')
      } 
    else {
      setLoading(true)
      try {
        const user=await logIn(email,password)
        if(user.success)
        {
          navigation.navigate('Home')
        }
        else
        {
          throw new Error(user.error)
        }
      } catch (error:any) {
        console.log(error.message)
      }
      finally{
      setEmail('')
      setPassword('')
      setEmailError(undefined)
      setPasswordError(undefined)
      setLoading(false)
    }}
  };

  return (
    <SafeAreaView className="flex flex-1 h-full w-full bg-white">
      <View className="flex-1 bg-white justify-start mt-40 px-6">
        {/* Logo */}
        <Image
          source={require('../assets/splash-icon.png')}
          className="w-32 h-32 self-center mb-8"
          resizeMode="contain"
        />
        {/* Inputs */}
        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          onChangeText={(e)=>{
            setPasswordError(undefined)
            setEmailError(undefined)
            setEmail(e)
          }}
          value={email}
          error={emailError}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          onChangeText={(e)=>{
            setPasswordError(undefined)
            setEmailError(undefined)
            setPassword(e)
          }}
          value={password}
          error={passwordError}
        />
        <CustomButton
          loading={loading}
          title="Sign In"
          className="mt-4"
          onClick={() => handleClick({ email, password })}
        />
        <View className="mt-6 flex-row justify-center">
          <Text className="text-light-200 font-poppins-medium">
            Don't have an account ?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-brand font-poppins-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;