import { TextInput, TextInputProps, View, Text, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | undefined;
  secureTextEntry?:boolean ;
  className?: string;
}

export function Input({ label, error,secureTextEntry ,className, ...props }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;
  return (
   <View className="mb-4">
      {label && <Text className="text-black-200 font-poppins-regular ml-2 mb-1">{label}</Text>}
      <View className="flex-row items-center border-b border-light-200 rounded-xl bg-light-700 px-2">
        <TextInput
          {...props}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor="#A3B2C7"
          className={twMerge(
            'flex-1 p-2 text-black font-poppins-medium',
            className
          )}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-error mb-1 font-poppins-regular ml-2 mt-1">{error}</Text>
      )}
    </View>
  );
}
