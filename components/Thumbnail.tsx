import { View, Text } from 'react-native'
import React from 'react'
import IconComponent from './IconComponent'
import { convertFileSize, formatDateTime, getFileType } from 'lib/utils'
import { Models } from 'appwrite'
type Document = {
  $collectionId?: string;
  $createdAt?: string;
  $databaseId?: string;
  $id?: string;
  $permissions?: string[];
  $updatedAt?: string;
  accountId: string;
  bucketFileId: string;
  extension?: string;
  name: string;
  owners?: string[] | null;
  size?: number;
  type: string;
  url: string;
  users?: string[];
};


const Thumbnail = ({file}:{file:Document}) => {
    const {type,extension}=getFileType(file.name)
  return (
     <View className="bg-white rounded-2xl p-4 shadow-md mb-6">
      <View className="flex-row items-center space-x-4">
        {/* File Icon */}
        <View className="bg-gray-100 p-3 rounded-xl mr-4">
          <IconComponent type={type} extension={extension} />
        </View>

        {/* File Details */}
        <View className="flex-1">
          <Text className="text-black font-poppins-medium text-base" numberOfLines={1}>
            {file.name}
          </Text>
          <View className="flex-row justify-between mt-1">
            <Text className="text-gray-500 font-poppins-light text-sm">{formatDateTime(file.$createdAt!)}</Text>
            <Text className="text-gray-500 font-poppins-light text-sm">{convertFileSize(file.size!)}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Thumbnail