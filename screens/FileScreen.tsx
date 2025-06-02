import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Pressable, Modal } from 'react-native';
import { useAuth } from 'context/AuthContext';
import { getFiles } from 'appwrite/fileAction';
import { Models } from 'appwrite';
import { Loader } from 'components/Loader';
import Thumbnail from 'components/Thumbnail';
import { useNavigation } from '@react-navigation/native';



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



const FileScreen = () => {
  const { authUser }: { authUser: Models.User<any> } = useAuth();
  const [files, setFiles] = useState<Document[]>([])
  const [loading,setLoading]=useState(true)
  const [searchText,setSearchText]=useState<string>(' ');
  const [sortText,setSortText]=useState<string | undefined>(undefined)
  const [showSortMenu, setShowSortMenu] = useState(false);
  const naivgation=useNavigation<any>()

  const sortOptions = [
  {
    label: "Date (newest)",
    value: "$createdAt-desc",
  },
  {
    label: "Date (oldest)",
    value: "$createdAt-asc",
  },
  {
    label: "Name (A-Z)",
    value: "name-asc",
  },
  {
    label: "Name (Z-A)",
    value: "name-desc",
  },
  ];


  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)  
      try {
        const result = await getFiles({
          email: authUser.email,
          userId: authUser.$id,
          searchText: searchText,
          sortText: sortText,
        });
        setFiles(result.documents)
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally{
        setLoading(false)
      }
    };

    if (authUser) {
      fetchFiles();
    }
  }, [authUser,searchText,sortText]);


  if(loading)
  {
    return (
      <SafeAreaView className="flex-1  bg-white">
      <Text className="text-center font-poppins-bold mt-14 text-3xl text-light-100">Files</Text>
      <View className="flex-1 justify-center items-center bg-white">
        <Loader size="large" color="green" />
        <View className="mt-4 items-center">
          <Text className="font-poppins-bold text-brand-100 text-center mb-2">
            Fetching files...
          </Text>
          <Text className="font-poppins-medium text-brand-100 text-center">
            Please wait
          </Text>
        </View>
      </View>
    </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex h-full mt-14 mx-6">
      <Text className="text-center font-poppins-bold text-3xl text-light-100">Files</Text>
      <View className="flex-row justify-end items-center mt-4 mb-6 space-x-2">
      <Text className="text-base font-poppins-regular text-black">Sort by:</Text>
      <TouchableOpacity onPress={() => setShowSortMenu(true)}>
        <Text className="text-base font-poppins-regular text-light-200">
          {sortOptions.find((o) => o.value === sortText)?.label || 'None'}
        </Text>
      </TouchableOpacity>
    </View>

      <FlatList
        data={files}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={()=>naivgation.navigate("Details",{file:item})}>
            <Thumbnail file={item} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.$id!}
      />

      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => setShowSortMenu(false)}
        >
          <View className="bg-white px-6 py-4 rounded-t-2xl">
            <Text className="font-poppins-bold text-lg mb-2 text-black">Sort by</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className="py-2"
                onPress={() => {
                  setSortText(option.value);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  className={`font-poppins-medium text-base ${
                    sortText === option.value ? 'text-brand' : 'text-light-200'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
   
  )
};

export default FileScreen;
