import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LibraryScreen from '../screens/Library';
import WishlistScreen from '../screens/Wishlist';
import ProfileScreen from '../screens/Profile';
import AddGameScreen from '../screens/AddGame';
import GameDetailsScreen from '../screens/GameDetails';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditGameScreen from '../screens/EditGame';
import SearchGameScreen from '../screens/SearchGame';

const Tab = createBottomTabNavigator();
const LibraryStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();

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
                component={WishlistStackNavigator}
                options={{ 
                  headerShown: false,
                  title: 'Wishlist' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

function WishlistStackNavigator() {
  return (
    <WishlistStack.Navigator>
      <WishlistStack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'Wishlist' }}
      />
      <WishlistStack.Screen
        name="SearchGame"
        component={SearchGameScreen}
        options={{
          title: 'Search Games'}}
      />
    </WishlistStack.Navigator>
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
          title: 'Add New Game'}}
      />
      <LibraryStack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{ title: 'Details'}} 
      />
      <LibraryStack.Screen
        name="EditGame"
        component={EditGameScreen} 
        options={{ title: 'Edit Game'}}
      />
      
    </LibraryStack.Navigator>
  );
}