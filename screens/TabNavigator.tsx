import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import FileScreen from './FileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#43A047',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 65 + Math.min(insets.bottom, 12),
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : Math.max(insets.bottom, 8),
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Files') {
            iconName = focused ? 'folder' : 'folder-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Files" component={FileScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
