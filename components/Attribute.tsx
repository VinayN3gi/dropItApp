import { Text, View } from 'react-native';
import React from 'react';
import { twMerge } from 'tailwind-merge';

const Attribute = ({
  attribute,
  value,
  className,
}: {
  attribute: string;
  value: string;
  className?: string;
}) => {
  return (
    <View
      className={twMerge(
        'flex-row items-start space-x-2 bg-gray-100 rounded-xl px-4 py-3',
        className
      )}
    >
      <Text className="text-black text-base font-poppins-medium w-20">
        {attribute}:
      </Text>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-gray-500 text-base font-poppins-medium"
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

export default Attribute;
