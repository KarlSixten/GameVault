import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LibraryScreen from '../screens/Library';
import WishlistScreen from '../screens/Wishlist';
import ProfileScreen from '../screens/Profile';
import AddGameScreen from '../screens/AddGame';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const LibraryStack = createNativeStackNavigator();

export default function MainAppNavigator() {
    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
  
              if (route.name === 'LibraryTab') {
                iconName = focused ? 'library' : 'library-outline';
              } else if (route.name === 'WishlistTab') {
                iconName = focused ? 'gift' : 'gift-outline';
              } else if (route.name === 'ProfileTab') {
                iconName = focused ? 'person-circle' : 'person-circle-outline';
              }
  
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: 'white',
              paddingBottom: 5,
              height: 60,
            },
          })}
        >
            <Tab.Screen
                name="LibraryTab"
                component={LibraryStackNavigator}
                options={{
                    headerShown: false,
                    title: 'Library'
                }}
            />
            <Tab.Screen
                name="WishlistTab"
                component={WishlistScreen}
                options={{ title: 'Wishlist' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

function LibraryStackNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen
        name="LibraryList"
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <LibraryStack.Screen
        name="AddGame"
        component={AddGameScreen}
        options={{
          title: 'Add New Game',
        }}
      />
    </LibraryStack.Navigator>
  );
}