import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useAuth } from 'context/AuthContext';
import { getFiles } from 'appwrite/fileAction';
import { Models } from 'appwrite';
import { Loader } from 'components/Loader';
import Thumbnail from 'components/Thumbnail';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFileContext } from 'context/FileContext';
import { getUser } from 'appwrite/userAction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

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


const normalizeType = (t?: string) => {
  if (!t) return undefined;
  if (t === 'others') return 'other';
  if (t === 'documents') return 'document';
  if (t === 'images') return 'image';
  if (t === 'media' || t === 'video,audio') return 'media';
  return t;
};

const FileScreen = ({ navigation }: { navigation?: any }) => {
  const insets = useSafeAreaInsets();
  const { authUser }: { authUser: Models.User<any> } = useAuth();
  const { refreshFlag, activeFilter, setActiveFilter } = useFileContext();

  const [files, setFiles] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [sortText, setSortText] = useState<string>('$createdAt-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  // Local filter state — seeded from context when tab is focused
  const [type1, setType1] = useState<string | undefined>(normalizeType(activeFilter));

  const sortOptions = [
    { label: 'Newest First', value: '$createdAt-desc', icon: 'time-outline' },
    { label: 'Oldest First', value: '$createdAt-asc', icon: 'hourglass-outline' },
    { label: 'Name (A to Z)', value: 'name-asc', icon: 'text-outline' },
    { label: 'Name (Z to A)', value: 'name-desc', icon: 'text-outline' },
  ];

  const typeOptions = [
    { label: 'All Files', value: undefined, icon: 'grid-outline' },
    { label: 'Documents', value: 'document', icon: 'document-text-outline' },
    { label: 'Images', value: 'image', icon: 'image-outline' },
    { label: 'Media', value: 'media', icon: 'film-outline' },
    { label: 'Videos', value: 'video', icon: 'videocam-outline' },
    { label: 'Audios', value: 'audio', icon: 'musical-notes-outline' },
    { label: 'Others', value: 'other', icon: 'folder-outline' },
  ];

  // When the Files tab gains focus, sync the filter set from HomeScreen via context
  useFocusEffect(
    useCallback(() => {
      const normalized = normalizeType(activeFilter);
      setType1(normalized);
    }, [activeFilter])
  );

  // When user manually picks a pill, clear the context filter so it doesn't override later
  const handleSetType = (val: string | undefined) => {
    setType1(val);
    setActiveFilter(undefined);
  };

  const fetchFiles = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      let email = authUser?.email;
      let userId = authUser?.$id;

      if (!userId || !email) {
        const userRes = await getUser();
        if (!userRes?.user) return;
        email = userRes.user.email;
        userId = userRes.user.$id;
      }

      // Expand 'media' into video + audio for the query
      const queryType1 = type1 === 'media' ? 'video' : type1;
      const queryType2 = type1 === 'media' ? 'audio' : undefined;

      const result = await getFiles({
        email,
        userId,
        searchText: searchText.trim(),
        sortText,
        type1: queryType1,
        type2: queryType2,
      });
      setFiles(result?.documents || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [authUser, sortText, type1, refreshFlag]);

  const isSearchMount = useRef(true);

  // Debounced search trigger
  useEffect(() => {
    if (isSearchMount.current) {
      isSearchMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      fetchFiles();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchText]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFiles(true);
  };

  const currentSortLabel = useMemo(() => {
    return sortOptions.find((o) => o.value === sortText)?.label || 'Newest';
  }, [sortText]);


  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom }}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 w-full max-w-xl self-center px-5">
        {/* Screen Header */}
        <View className="flex-row justify-between items-center mb-4 pt-2">
          <View>
            <Text className="text-gray-400 font-poppins-medium text-xs uppercase tracking-wider">
              Storage Explorer
            </Text>
            <Text className="text-gray-900 font-poppins-bold text-2xl">
              All Files
            </Text>
          </View>
          <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Text className="text-brand font-poppins-semibold text-xs">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-2xl border border-gray-200/80 px-3.5 py-2.5 flex-row items-center shadow-sm mb-3">
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search files by name..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2 font-poppins-regular text-sm text-gray-800 p-0"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Filter Pills */}
        {/*<View className="mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2, paddingRight: 10 }}
          >
            {typeOptions.map((opt) => {
              const active = type1 === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => handleSetType(opt.value)}
                  className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 border ${
                    active
                      ? 'bg-brand border-brand shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={14}
                    color={active ? '#ffffff' : '#64748B'}
                  />
                  <Text
                    className={`ml-1.5 font-poppins-medium text-xs ${
                      active ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View> */}

        {/* Filter and Sort summary row */}
        <View className="flex-row justify-between items-center mb-3 px-1">
          <Text className="text-xs font-poppins-medium text-gray-400">
            {typeOptions.find((o) => o.value === type1)?.label || 'All Files'}
          </Text>

          <TouchableOpacity
            onPress={() => setShowSortMenu(true)}
            className="flex-row items-center bg-white px-3 py-1 rounded-full border border-gray-200"
          >
            <Ionicons name="swap-vertical-outline" size={14} color="#43A047" />
            <Text className="text-xs font-poppins-medium text-gray-700 ml-1">
              {currentSortLabel}
            </Text>
          </TouchableOpacity>
        </View> 

        {/* Files List / Loading State */}
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Loader size="large" color="#43A047" />
            <Text className="font-poppins-semibold text-gray-800 text-sm mt-3 text-center">
              Fetching files...
            </Text>
          </View>
        ) : files.length === 0 ? (
          <View className="flex-1 justify-center items-center py-16 px-6">
            <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
              <Ionicons name="folder-open-outline" size={32} color="#43A047" />
            </View>
            <Text className="text-gray-800 text-center text-lg font-poppins-semibold">
              No files found
            </Text>
            <Text className="text-gray-400 text-center text-xs font-poppins-regular mt-1 max-w-xs">
              {searchText
                ? `No results matching "${searchText}". Try another search term.`
                : 'No files uploaded yet in this category.'}
            </Text>
            {(searchText.length > 0 || type1 !== undefined) && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  handleSetType(undefined);
                }}
                className="mt-4 px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl"
              >
                <Text className="text-brand font-poppins-medium text-xs">
                  Reset filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={files}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#43A047']} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation?.navigate('Details', { file: item })}
              >
                <Thumbnail file={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.$id || Math.random().toString()}
          />
        )}
      </View>

      {/* Modern Sort Bottom Sheet */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowSortMenu(false)}
        >
          <View className="bg-white px-6 pt-5 pb-8 rounded-t-3xl max-w-xl w-full self-center">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-4" />
            <Text className="font-poppins-bold text-lg mb-3 text-gray-900">
              Sort Files By
            </Text>
            {sortOptions.map((option) => {
              const active = sortText === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-row items-center justify-between py-3.5 border-b border-gray-100 ${
                    active ? 'bg-emerald-50/50 -mx-2 px-2 rounded-xl' : ''
                  }`}
                  onPress={() => {
                    setSortText(option.value);
                    setShowSortMenu(false);
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={active ? '#43A047' : '#94A3B8'}
                    />
                    <Text
                      className={`font-poppins-medium text-sm ml-3 ${
                        active ? 'text-brand font-poppins-semibold' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark-circle" size={20} color="#43A047" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FileScreen;
