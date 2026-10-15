import { View, Text } from 'react-native'
import React from 'react'
import IconComponent from './IconComponent'
import { convertFileSize, formatDateTime, getFileType } from 'lib/utils'
import { Ionicons } from '@expo/vector-icons'

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

const Thumbnail = ({ file }: { file: Document }) => {
  const { type, extension } = getFileType(file.name);

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 mr-3">
        {/* File Icon */}
        <View className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl items-center justify-center mr-3">
          <IconComponent type={type} extension={extension} size={30} />
        </View>

        {/* File Details */}
        <View className="flex-1">
          <Text className="text-gray-900 font-poppins-semibold text-sm" numberOfLines={1}>
            {file.name}
          </Text>
          <View className="flex-row items-center mt-1 space-x-2">
            <View className="bg-gray-100 px-1.5 py-0.5 rounded mr-2">
              <Text className="text-gray-600 font-poppins-medium text-[10px] uppercase">
                {extension || type}
              </Text>
            </View>
            <Text className="text-gray-400 font-poppins-regular text-xs">
              {convertFileSize(file.size || 0)}
            </Text>
            <Text className="text-gray-300 text-xs">•</Text>
            <Text className="text-gray-400 font-poppins-regular text-xs">
              {formatDateTime(file.$createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </View>
  );
};

export default Thumbnail;