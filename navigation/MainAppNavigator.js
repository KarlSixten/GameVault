import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LibraryScreen from '../screens/Library';
import WishlistScreen from '../screens/Wishlist';
import ProfileScreen from '../screens/Profile';
import AddGameScreen from '../screens/AddGame';
import GameDetailsScreen from '../screens/GameDetails';
import EditGameScreen from '../screens/EditGame';
import SearchGameScreen from '../screens/SearchGame';

import colors from '../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const LibraryStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();

const stackNavigatorScreenOptions = {
    headerTitleStyle: {
        fontWeight: 'bold',
        color: 'colors.textPrimary',
    },
    headerBackTitleVisible: false,
};

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

                tabBarStyle: {
                    paddingTop: 5,
                    height: 85,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
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
                    title: 'Wishlist'
                }}
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
        <WishlistStack.Navigator screenOptions={stackNavigatorScreenOptions}>
            <WishlistStack.Screen
                name="Wishlist"
                component={WishlistScreen}
                options={{ title: 'My Wishlist' }}
            />
            <WishlistStack.Screen
                name="SearchGame"
                component={SearchGameScreen}
                options={{
                    title: 'Search New Games',
                    presentation: 'modal',
                }}
            />
        </WishlistStack.Navigator>
    );
}

function LibraryStackNavigator() {
    return (
        <LibraryStack.Navigator screenOptions={stackNavigatorScreenOptions}>
            <LibraryStack.Screen
                name="LibraryList"
                component={LibraryScreen}
                options={{ title: 'My Game Library' }}
            />
            <LibraryStack.Screen
                name="AddGame"
                component={AddGameScreen}
                options={{
                    title: 'Add New Game',
                    presentation: 'modal',
                }}
            />
            <LibraryStack.Screen
                name="GameDetails"
                component={GameDetailsScreen}
                options={{ title: 'Game Details' }}
            />
            <LibraryStack.Screen
                name="EditGame"
                component={EditGameScreen}
                options={{ title: 'Edit Game Details', presentation: 'modal' }}
            />
        </LibraryStack.Navigator>
    );
}