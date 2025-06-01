import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { getFiles } from 'appwrite/fileAction'
import { useAuth } from 'context/AuthContext'
import { Models } from 'appwrite'
import Thumbnail from 'components/Thumbnail'

export default function HomeScreen() {
  const {authUser}:{authUser:Models.User<any>}=useAuth()
  /*useEffect(()=>{
    const fetchFiles=async()=>{
      try {
        const result=await getFiles({email:authUser.email,userId:authUser.$id,searchText: " ",sortText:undefined,limit:10})
        console.log(result.documents)
      } catch (error) {
        console.log(error)
      }
    }
    fetchFiles()
  },[])*/

  return (
    <SafeAreaView className='flex h-full mt-14 mx-6'>
      <Text className='text-center font-poppins-bold text-3xl mb-4 text-light-100'>Home</Text>
    </SafeAreaView>
  )
}
