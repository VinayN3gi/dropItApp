import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Input } from 'components/Input';
import { CustomButton } from 'components/Button';
import { useNavigation } from '@react-navigation/native';
import { createUser } from 'appwrite/userAction';

//Create eye icon for password

const SignUpScreen = () => {
   const navigation = useNavigation<any>();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
    const [userName,setUsername]=useState<string>('')
    const [usernameError,setUsernameError]=useState<string | undefined>(undefined)
    const [loading,setLoading]=useState<boolean>(false)

    const handleClick = async ({ email, password,userName }: { email: string; password: string,userName:string }) => {
       if(!userName.trim())
        {
          setUsernameError('Username must be provided')
        }
        else if (!email.trim()) {
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
              const user=await createUser(email,password,userName)
              if(user.success)
              {
                console.log(user.user)
              }
              else throw new Error(user.error)
          } catch (error:any) {
            console.log(error.message)
          }
          finally{
          setEmail('')
          setPassword('')
          setUsername('')
          setEmailError(undefined)
          setPasswordError(undefined)
          setUsernameError(undefined)
          setLoading(false)
        }}
      };
    
    

    
  return (
    <SafeAreaView className="flex flex-1 h-full w-full bg-white">
         <View className="flex-1 bg-white justify-start mt-20 px-6">
           {/* Logo */}
           <Image
             source={require('../assets/splash-icon.png')}
             className="w-32 h-32 self-center mb-8"
             resizeMode="contain"
           />
           {/* Inputs */}
            <Input
           label='Username'
           placeholder='Enter your username'
           value={userName}
           error={usernameError}
            onChangeText={(e)=>{
               setPasswordError(undefined)
               setEmailError(undefined)
               setUsernameError(undefined)
               setUsername(e)
             }}
           />
           <Input
             label="Email"
             placeholder="Enter your email"
             keyboardType="email-address"
             onChangeText={(e)=>{
               setPasswordError(undefined)
               setEmailError(undefined)
               setUsernameError(undefined)
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
               setUsernameError(undefined)
               setPassword(e)
             }}
             value={password}
             error={passwordError}
           />
           <CustomButton
             loading={loading}
             title="Sign In"
             className="mt-4"
             onClick={() => handleClick({ email, password,userName })}
           />
           <View className="mt-6 flex-row justify-center">
             <Text className="text-light-200 font-poppins-medium">
               Already have an account ?{' '}
             </Text>
             <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
               <Text className="text-brand font-poppins-medium">Sign In</Text>
             </TouchableOpacity>
           </View>
         </View>
       </SafeAreaView>
  )
}

export default SignUpScreen