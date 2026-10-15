import { Alert, FlatList, Text, View, TouchableOpacity, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { getTotalSpaceUsed, uploadToAppwrite } from 'appwrite/fileAction'
import { useAuth } from 'context/AuthContext'
import { Models } from 'appwrite'
import { Loader } from 'components/Loader'
import { convertFileSize, formatDateTime, getUsageSummary, calculatePercentage } from 'lib/utils'
import IconComponent from 'components/IconComponent'
import { CustomButton } from 'components/Button'
import * as DocumentPicker from 'expo-document-picker'
import { getUser } from 'appwrite/userAction'
import { useFileContext } from 'context/FileContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

type FileCategory = {
  latestDate: string;
  size: number;
  title: string;
  type: string;
};

export default function HomeScreen({ navigation }: { navigation?: any }) {
  const insets = useSafeAreaInsets();
  const { authUser }: { authUser: Models.User<any> } = useAuth();
  const [files, setFiles] = useState<FileCategory[]>([]);
  const [totalBytesUsed, setTotalBytesUsed] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { triggerRefresh, refreshFlag, setActiveFilter } = useFileContext();

  const pickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setBtnLoading(false);
        return;
      }

      // User chose a file - now show upload loader
      setBtnLoading(true);

      const user = await getUser();
      if (!user?.user) {
        throw new Error('User session not found');
      }

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const blob: Blob = await response.blob();
      await uploadToAppwrite({
        uri: file.uri,
        name: file.name,
        mimeType: blob.type,
        accountId: user.user.$id,
      });
      triggerRefresh();
      fetchUsage();
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Failed to upload file');
    } finally {
      setBtnLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const user = await getUser();
      if (!user?.user) return;
      const res = await getTotalSpaceUsed({
        userId: user.user.$id,
        email: user.user.email,
      });
      const summary = getUsageSummary(res);
      setFiles(summary);

      const total =
        (res.document?.size || 0) +
        (res.image?.size || 0) +
        (res.video?.size || 0) +
        (res.audio?.size || 0) +
        (res.other?.size || 0);
      setTotalBytesUsed(total);
    } catch (error: any) {
      console.log('Error fetching usage:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsage();
  }, [refreshFlag]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsage();
  };

  const usedPercentage = useMemo(() => {
    return Math.min(calculatePercentage(totalBytesUsed), 100);
  }, [totalBytesUsed]);

  if (loading && !refreshing) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1 bg-gray-50 justify-center items-center px-6"
      >
        <Loader size="large" color="#43A047" />
        <Text className="font-poppins-bold text-gray-800 text-lg mt-4 text-center">
          Loading your cloud storage...
        </Text>
        <Text className="font-poppins-regular text-gray-400 text-sm mt-1 text-center">
          Fetching files and statistics
        </Text>
      </View>
    );
  }

  const categoryColors: Record<string, { bg: string; text: string; iconBg: string }> = {
    document: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    image: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    video: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    others: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  };

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom }}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#43A047']} />
        }
      >
        <View className="w-full max-w-xl self-center">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 pt-2">
            <View>
              <Text className="text-gray-400 font-poppins-medium text-xs uppercase tracking-wider">
                Cloud Storage
              </Text>
              <Text className="text-gray-900 font-poppins-bold text-2xl">
                DropIt Dashboard
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="w-11 h-11 bg-brand/10 border border-brand/20 rounded-full items-center justify-center"
            >
              <Ionicons name="person-outline" size={20} color="#43A047" />
            </TouchableOpacity>
          </View>

          {/* Storage Overview Card */}
          <View className="bg-white rounded-3xl p-5 mb-6 border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center space-x-2">
                <View className="w-8 h-8 rounded-lg bg-brand/10 items-center justify-center mr-2">
                  <Ionicons name="cloud-done-outline" size={18} color="#43A047" />
                </View>
                <Text className="font-poppins-semibold text-gray-800 text-base">
                  Available Storage
                </Text>
              </View>
              <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Text className="font-poppins-semibold text-xs text-brand">
                  {usedPercentage.toFixed(1)}% used
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <View
                style={{ width: `${Math.max(usedPercentage, 2)}%` }}
                className="h-full bg-brand rounded-full"
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="font-poppins-medium text-xs text-gray-500">
                {convertFileSize(totalBytesUsed)} of 2.0 GB
              </Text>
              <Text className="font-poppins-regular text-xs text-gray-400">
                Free Tier
              </Text>
            </View>
          </View>

          {/* Categories Title */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-poppins-semibold text-gray-900 text-lg">
              Categories
            </Text>
            <TouchableOpacity onPress={() => {
              setActiveFilter(undefined);
              navigation?.navigate('Files');
            }}>
              <Text className="font-poppins-medium text-brand text-xs">
                View all files →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Cards Grid */}
          <View className="flex-row flex-wrap justify-between">
            {files.map((item) => {
              const theme = categoryColors[item.type] || categoryColors.others;
              return (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.7}
                  onPress={() => {
                    setActiveFilter(item.type);
                    navigation?.navigate('Files');
                  }}
                  className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className={`w-11 h-11 rounded-xl items-center justify-center ${theme.iconBg}`}>
                      <IconComponent extension={undefined} type={item.type} size={22} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </View>

                  <Text className="font-poppins-semibold text-gray-800 text-base" numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text className="font-poppins-bold text-gray-900 text-sm mt-0.5">
                    {convertFileSize(item.size)}
                  </Text>

                  <Text className="font-poppins-regular text-gray-400 text-[10px] mt-2" numberOfLines={1}>
                    {item.latestDate ? `Updated ${formatDateTime(item.latestDate)}` : 'No files'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Action Upload Card */}
          <View className="mt-2 bg-emerald-50/60 border border-emerald-100 rounded-3xl p-5 items-center">
            <View className="w-12 h-12 rounded-full bg-white shadow-sm items-center justify-center mb-3">
              <Ionicons name="cloud-upload-outline" size={24} color="#43A047" />
            </View>
            <Text className="font-poppins-semibold text-gray-900 text-base text-center">
              Upload Files
            </Text>
            <Text className="font-poppins-regular text-gray-500 text-xs text-center mb-4 max-w-xs">
              Upload documents, media, or images securely to your cloud storage
            </Text>
            <CustomButton
              loading={btnLoading}
              title="Upload New File"
              onClick={pickAndUploadFile}
              className="w-full shadow-sm"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
