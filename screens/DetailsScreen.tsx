import { View, Text, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native'
import { useState } from 'react'
import { constructDownloadUrl, convertFileSize, formatDateTime, getFileType } from 'lib/utils';
import IconComponent from 'components/IconComponent';
import { CustomButton } from 'components/Button';
import { deleteFile } from 'appwrite/fileAction';
import { useNavigation } from '@react-navigation/native';
import { useFileContext } from 'context/FileContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

const DetailsScreen = ({ route }: { route: any }) => {
  const insets = useSafeAreaInsets();
  const { file }: { file: Document } = route.params;
  const { type, extension } = getFileType(file.name);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const { triggerRefresh } = useFileContext();

  const handleDownload = async (url: string) => {
    try {
      setLoading(true);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Can't open this URL", url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      Alert.alert('Error', 'Unable to open the download link.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to permanently delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete({ fileId: file.$id!, bucketFileId: file.bucketFileId }),
        },
      ]
    );
  };

  const handleDelete = async ({ fileId, bucketFileId }: { fileId: string; bucketFileId: string }) => {
    setDeleteLoading(true);
    try {
      await deleteFile({ fileId, bucketFileId });
      triggerRefresh();
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to delete file');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }}
      className="flex-1 bg-gray-50"
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-poppins-semibold text-base">
          File Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          {/* File Hero Card */}
          <View className="bg-white rounded-3xl p-6 items-center border border-gray-100 shadow-sm mb-6">
            <View className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center mb-4">
              <IconComponent type={type} extension={extension} size={54} />
            </View>

            <Text className="text-gray-900 font-poppins-bold text-lg text-center mb-2 px-2">
              {file.name}
            </Text>

            <View className="flex-row items-center space-x-2">
              <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 mr-2">
                <Text className="text-brand font-poppins-semibold text-xs uppercase">
                  {extension || type}
                </Text>
              </View>
              <Text className="text-gray-400 font-poppins-medium text-xs">
                {convertFileSize(file.size || 0)}
              </Text>
            </View>
          </View>

          {/* Metadata Card */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Text className="text-gray-400 font-poppins-semibold text-xs uppercase tracking-wider mb-3">
              Information
            </Text>

            <View className="py-2.5 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">File Type</Text>
              <Text className="text-gray-800 font-poppins-semibold text-xs capitalize">{type}</Text>
            </View>

            <View className="py-2.5 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">File Size</Text>
              <Text className="text-gray-800 font-poppins-semibold text-xs">{convertFileSize(file.size || 0)}</Text>
            </View>

            <View className="py-2.5 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">Uploaded On</Text>
              <Text className="text-gray-800 font-poppins-semibold text-xs">{formatDateTime(file.$createdAt)}</Text>
            </View>

            <View className="py-2.5 flex-row justify-between items-center">
              <Text className="text-gray-500 font-poppins-medium text-xs">File ID</Text>
              <Text className="text-gray-400 font-poppins-regular text-[11px] max-w-[180px]" numberOfLines={1}>
                {file.$id}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <CustomButton
              title="Download File"
              loading={loading}
              onClick={() => handleDownload(constructDownloadUrl(file.bucketFileId))}
              className="w-full shadow-sm"
            />

            <TouchableOpacity
              onPress={confirmDelete}
              disabled={deleteLoading}
              className="w-full py-3.5 mt-3 rounded-2xl items-center border border-red/40 bg-red/10"
            >
              <Text className="text-error font-poppins-semibold text-sm">
                {deleteLoading ? 'Deleting...' : 'Delete File'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;