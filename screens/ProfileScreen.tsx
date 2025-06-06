import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Loader } from 'components/Loader';
import { getUser } from 'appwrite/userAction';
import { CustomButton } from 'components/Button';
import { logOut } from 'appwrite/fileAction';
import { useNavigation } from '@react-navigation/native';
import Attribute from 'components/Attribute';


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
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const navigation=useNavigation<any>()


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


  const handleLogout=async()=>{
    setBtnLoading(true)
    try {
      const res:any=await logOut()
      if(res)
      {
         navigation.navigate("SignIn")
      }
    } catch (error:any) {
      Alert.alert(error.message)
    }finally{
      setBtnLoading(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Text className="text-center font-poppins-bold mt-14 text-3xl text-light-100">
          Profile
        </Text>
        <View className="flex-1 justify-center items-center bg-white">
          <Loader size="large" color="green" />
          <View className="mt-4 items-center">
            <Text className="font-poppins-bold text-brand-100 text-center mb-2">
              Fetching user details...
            </Text>
            <Text className="font-poppins-medium text-brand-100 text-center">
              Please wait
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Text className="text-center font-poppins-bold mt-14 text-3xl text-light-100">
          Profile
        </Text>
        <View className="flex-1 justify-center items-center bg-white">
          <View className="mt-4 items-center">
            <Text className="font-poppins-bold text-error text-center mb-2">
              Unable to fetch User details
            </Text>
            <TouchableOpacity onPress={() => setRefresh(!refresh)}>
              <Text className="font-poppins-medium text-red text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex h-full mt-14 mx-6">
      <Text className="text-center font-poppins-bold text-3xl mb-4 text-light-100">
        Profile
      </Text>
      <View className="flex-1 justify-between">
        <View>
          <Attribute attribute="Name" value={user.name} />
          <Attribute attribute='Email' value={user.email}/>
          <Attribute attribute='Id' value={user.$id}/>
        </View>
        <View className="mb-24">
          <CustomButton title="Log Out" loading={btnLoading} onClick={() => handleLogout()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
