import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Loader } from './Loader';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  onClick:()=>void;
  loading:boolean
}

export function CustomButton({ title, className,loading,onClick, ...props }: ButtonProps) {
  return (
    <TouchableOpacity onPress={()=>onClick()}
      {...props}
      disabled={loading}
      className={twMerge(
        'bg-brand text-center py-3 rounded-2xl items-center h-14',
        className
      )}
    >
      {!loading && <Text className="text-white font-poppins-bold">{title}</Text>}
      {loading && <Loader size="large" color='white'/>}
    </TouchableOpacity>
  );
}
