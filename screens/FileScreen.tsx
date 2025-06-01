import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';
import { useAuth } from 'context/AuthContext';
import { getFiles } from 'appwrite/fileAction';
import { Models } from 'appwrite';
import { Loader } from 'components/Loader';
import Thumbnail from 'components/Thumbnail';


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
  const [loading,setLoading]=useState(false)
  const [searchText,setSearchText]=useState<string>(' ');
  const [sortText,setSortText]=useState<string | undefined>(undefined)

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
       <SafeAreaView className="flex-1 mt-14 mx-6">
      <Text className="text-center font-poppins-bold text-3xl text-light-100">Files</Text>
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
    );
  }

  return (
    <SafeAreaView className='flex h-full mt-14 mx-6'>
         <Text className='text-center font-poppins-bold text-3xl mb-20 text-light-100 '>Files</Text>
         <FlatList
         data={files}
         renderItem={({ item }) => <Thumbnail file={item} />}
         keyExtractor={(item) => item.$id!}
         />
    </SafeAreaView>
  );
};

export default FileScreen;
