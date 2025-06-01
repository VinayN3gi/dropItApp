import { View, Text } from 'react-native'
import React from 'react'
import { getFileIcon } from 'lib/utils';

const IconComponent = ({extension,type}:{extension:string | undefined,type:string}) => {
   const Icon = getFileIcon(extension, type);
  return (
    <View>
      <Icon width={40} height={40} />;
    </View>
  )
}

export default IconComponent