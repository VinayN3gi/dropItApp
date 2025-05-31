import { TextInput, TextInputProps, View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-black-200 font-poppins-regular ml-2">{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor="#A3B2C7"
        className={twMerge(
          'border-b border-light-200 rounded-xl p-2  text-black bg-light-700 font-poppins-medium',
          className
        )}
      />
    </View>
  );
}
