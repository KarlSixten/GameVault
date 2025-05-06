import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LibraryScreen from '../screens/Library';
import WishlistScreen from '../screens/Wishlist';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function MainAppNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Wishlist" component={WishlistScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}