import { View, Text } from 'react-native'
import React from 'react'
import { getFileIcon } from 'lib/utils';

const IconComponent = ({extension,type,size}:{extension:string | undefined,type:string,size:number}) => {
  const Icon = getFileIcon(extension, type)
  return (
    <View className='flex justify-center items-center'>
      <Icon width={size} height={size} />
    </View>
  )
}

export default IconComponent