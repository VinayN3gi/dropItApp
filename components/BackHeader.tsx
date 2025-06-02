import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Ionicons from '@react-native-vector-icons/ionicons';

const BackHeader = () => {
  const navigation=useNavigation<any>()

  return (
     <View className="flex-row items-center px-4 py-3 bg-white">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  )
}

export default BackHeader