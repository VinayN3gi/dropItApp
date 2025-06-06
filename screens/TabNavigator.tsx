import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import FileScreen from './FileScreen';

const Tab = createBottomTabNavigator();



const TabNavigator=()=>{
    return(
         <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00B386', // Highlight color for active tab
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }
          else if (route.name === 'Files') {
            iconName = focused ? 'folder' : 'folder-outline'
          }

          return <Ionicons name={iconName} size={22} color={color} />
        },
      })}
    >
        <Tab.Screen name="Home" component={HomeScreen}/>
        <Tab.Screen name="Files" component={FileScreen}/> 
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
    )
}

export default TabNavigator

function createStackNavigator() {
  throw new Error('Function not implemented.');
}
