import { ActivityIndicator, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Loader({size,color}:{size?: 'small' | 'large' | number,color:string}) {
  return (
    <View className={twMerge("items-center justify-center ",)}>
      <ActivityIndicator size={size} color={color} /> 
    </View>
  );
}
