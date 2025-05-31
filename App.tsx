import { ScrollView,Text,View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SignInScreen from 'screens/SignInScreen';
import SignUpScreen from 'screens/SignUpScreen';



SplashScreen.preventAutoHideAsync();



export default function App() {

  const [loaded,error]=useFonts({
    'Poppins-Thin': require('./assets/Poppins/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('./assets/Poppins/Poppins-ThinItalic.ttf'),
    'Poppins-ExtraLight': require('./assets/Poppins/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('./assets/Poppins/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Light': require('./assets/Poppins/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('./assets/Poppins/Poppins-LightItalic.ttf'),
    'Poppins-Regular': require('./assets/Poppins/Poppins-Regular.ttf'),
    'Poppins-Italic': require('./assets/Poppins/Poppins-Italic.ttf'),
    'Poppins-Medium': require('./assets/Poppins/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('./assets/Poppins/Poppins-MediumItalic.ttf'),
    'Poppins-SemiBold': require('./assets/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('./assets/Poppins/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Bold': require('./assets/Poppins/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('./assets/Poppins/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('./assets/Poppins/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('./assets/Poppins/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-Black': require('./assets/Poppins/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('./assets/Poppins/Poppins-BlackItalic.ttf'),
  })

   useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const Stack = createNativeStackNavigator();



  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='SignIn'
      screenOptions={{ headerShown: false }}>
         <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="SignIn" component={SignInScreen} />
         <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
