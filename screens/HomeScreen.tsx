import { FlatList, SafeAreaView,Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getFiles, getTotalSpaceUsed, uploadToAppwrite} from 'appwrite/fileAction'
import { useAuth } from 'context/AuthContext'
import { ID, Models } from 'appwrite'
import Thumbnail from 'components/Thumbnail'
import { Loader } from 'components/Loader'
import { convertFileSize, formatDateTime, getUsageSummary } from 'lib/utils'
import IconComponent from 'components/IconComponent'
import { CustomButton } from 'components/Button'
import * as DocumentPicker from 'expo-document-picker'


type FileCategory = {
  latestDate: string;
  size: number;
  title: string;
  type: string;
};

export default function HomeScreen() {
  const {authUser}:{authUser:Models.User<any>}=useAuth()
  const [files,setFiles]=useState<FileCategory[]>([]);
  const [loading,setLoading]=useState<boolean>(false)
  const [btnLoading,setBtnLoading]=useState<boolean>(false)

  const pickAndUploadFile=async()=>{
    try {
      setBtnLoading(true)
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

       if (result.canceled || !result.assets?.length) {
        setBtnLoading(false);
        return;
      }

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const blob:Blob = await response.blob();
      console.log(file.name)
      console.log(blob.type,blob.type,file.uri)

      const uploaded=await uploadToAppwrite({
        uri:file.uri,
        name:file.name,
        mimeType:blob.type
      })

      console.log(uploaded)
     
      
              
    } catch (error) {
      console.log(error)
    }finally{
      setBtnLoading(false)
    }
  }

  useEffect(()=>{
    const getUsage=async()=>{
      setLoading(true)
      try {
        const res=await getTotalSpaceUsed({userId:authUser.$id,email:authUser.email})
        const summary=getUsageSummary(res)
        setFiles(summary)
      } catch (error) {
        console.log(error)
      }finally{
        setLoading(false)
      }
    }
    getUsage()
  },[])


  if (loading) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <Text className="text-center font-poppins-bold mt-14 text-3xl text-light-100">
            Home
          </Text>
          <View className="flex-1 justify-center items-center">
            <Loader size="large" color="green" />
            <View className="mt-4 items-center">
              <Text className="font-poppins-bold text-brand-100 text-center mb-2">
                Fetching details...
              </Text>
              <Text className="font-poppins-medium text-brand-100 text-center">
                Please wait
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }
  
  return (
    <SafeAreaView className='flex h-full mt-14 mx-6'>
      <Text className='text-center font-poppins-bold text-3xl mb-4 text-light-100'>Home</Text>
         <FlatList
        data={files}
        numColumns={2}
        keyExtractor={(item) => item.title}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({ item }) => (
          <View className="w-[48%] bg-white border border-gray-200 rounded-2xl p-4 shadow-md items-center justify-center">
            <View className="bg-brand/10 rounded-full p-3 mb-2">
              <IconComponent extension={undefined} type={item.type} size={30} />
            </View>

            <Text className="font-poppins-semibold text-base text-center text-black">
              {item.title}
            </Text>

            <Text className="text-sm font-poppins-regular text-light-200 mt-1">
              {convertFileSize(item.size)}
            </Text>

            <Text className="text-xs font-poppins-regular text-gray-400 mt-1 text-center">
              {item.latestDate ? `Updated: ${formatDateTime(item.latestDate)}` : 'No files yet'}
            </Text>
          </View>
        )}
      />
      <View className='absolute-bottom mb-24'>
        <CustomButton loading={btnLoading} title='Upload' onClick={()=>pickAndUploadFile()}/>
      </View>
    </SafeAreaView>
  )
}
