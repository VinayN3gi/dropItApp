import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  onClick:()=>void;
}

export function CustomButton({ title, className,onClick, ...props }: ButtonProps) {
  return (
    <TouchableOpacity onPress={()=>onClick()}
      {...props}
      className={twMerge(
        'bg-brand text-center py-3 rounded-2xl items-center ',
        className
      )}
    >
      <Text className="text-white font-poppins-bold">{title}</Text>
    </TouchableOpacity>
  );
}
