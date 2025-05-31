import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Input } from 'components/Input';
import { CustomButton } from 'components/Button';
import { useNavigation } from '@react-navigation/native';

const handleClick = ({email,password}:{email:string,password:string}) => {
    if(!email.trim())
    {
      console.log("Email must be provided")
    }
    else if(!password.trim())
    {

    }
    else
    {
      console.log(email.trim())
    }
};

const SignInScreen = () => {
  const navigation = useNavigation<any>();
  const [email,setEmail]=useState<string>('')
  const [password,setPassword]=useState<string>('')
  const [emailError,setEmailError]=useState<string | undefined>(undefined)
  const [passwordError,setPasswordError]=useState<string | undefined>(undefined)

  return (
    <SafeAreaView className="flex flex-1 h-full w-full">
      <View className="flex-1 bg-white justify-center px-6">
        {/* Logo */}
        <Image
          source={require('../assets/splash-icon.png')}
          className="w-32 h-32 self-center mb-8"
          resizeMode="contain"
        />
        {/* Inputs */}
        <Input label="Email" placeholder="Enter your email" keyboardType="email-address" onChangeText={(e)=>setEmail(e)}/>
        <Input label="Password" placeholder="Enter your password" secureTextEntry onChangeText={(e)=>setPassword(e)}/>
        <CustomButton title="Sign In" className="mt-4" onClick={() => handleClick({ email, password })} />
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