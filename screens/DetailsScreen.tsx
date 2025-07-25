import { View, Text, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native'
import { useState } from 'react'
import BackHeader from 'components/BackHeader';
import { constructDownloadUrl, convertFileSize, formatDateTime, getFileType } from 'lib/utils';
import IconComponent from 'components/IconComponent';
import Attribute from 'components/Attribute';
import { CustomButton } from 'components/Button';
import { deleteFile } from 'appwrite/fileAction';
import { useNavigation } from '@react-navigation/native';
import { useFileContext } from 'context/FileContext';


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



const DetailsScreen = ({route}:{route:any}) => {
  const {file}:{file:Document}=route.params
  const {type,extension}=getFileType(file.name)
  const [loading,setLoading]=useState<boolean>(false)
  const [deleteLoading,setDeleteLoading]=useState<boolean>(false)
  const navigation=useNavigation<any>()
  const {refreshFlag,triggerRefresh}=useFileContext()
  const handleDownload = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    setLoading(true)
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Can't open this URL", url);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
    Alert.alert('Error', 'Unable to open the download link.');
  }finally{
    setLoading(false)
  }
  };

  const handleDelete=async({fileId,bucketFileId}:{fileId:string,bucketFileId:string})=>{
    setDeleteLoading(true)
    try {
      const deletedFile=await deleteFile({fileId:fileId,bucketFileId:bucketFileId})
      console.log(`File deleted ${deletedFile}`)
      triggerRefresh()
      navigation.goBack()
    } catch (error:any) {
      console.error(error)
      Alert.alert('Error',error.message)
    }finally{
      setDeleteLoading(false)
    }
  }



  return (
    <SafeAreaView className='flex bg-white flex-1'>
      <View className='flex h-20 bg-white mx-1 mt-10'>
        <BackHeader/>
      </View>
      <View className='flex flex-1 bg-white px-10 mt-10'>
    <IconComponent type={type} extension={extension} size={80} />
    <Attribute attribute='Name' value={file.name} className='mt-20'/>
    <Attribute attribute='Size' value={convertFileSize(file.size!)} className='mt-5'/>
    <Attribute attribute='Date' value={formatDateTime(file.$createdAt)} className='mt-5'/>
    <Attribute attribute='Type' value={type} className='mt-5'/>
    <CustomButton title='Download' loading={loading} onClick={()=>handleDownload(constructDownloadUrl(file.bucketFileId))} className='mt-20'/>
    <CustomButton title='Delete' loading={deleteLoading} onClick={()=>handleDelete({fileId:file.$id!,bucketFileId:file.bucketFileId})} className='mt-10 bg-red'/>
    </View>
    </SafeAreaView>
  )
}

export default DetailsScreen