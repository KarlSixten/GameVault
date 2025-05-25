import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { seedLibrary, clearLibrary } from '../util/seedingClearing';

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert("Log Out Failed", error.message || "An unexpected error occurred.");
        }
    };

    const handleSeedLibrary = async () => {

        if (!user) {
            Alert.alert("Not Logged In", "You need to be logged in to seed the library.");
            return;
        }

        setIsLoading(true);
        try {
            await seedLibrary(user);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    const handleClearLibrary = async () => {

        if (!user) {
            Alert.alert("Not Logged In", "You need to be logged in to seed the library.");
            return;
        }

        setIsLoading(true);
        try {
            await clearLibrary(user);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    return (
        <View style={styles.container}>
            <Ionicons name="person-circle-outline" size={80} color={colors.primary} style={styles.profileIcon} />
            <Text style={styles.title}>Profile</Text>
            {user && (
                <Text style={styles.emailText}>
                    Logged in as: <Text style={styles.emailValue}>{user.email}</Text>
                </Text>
            )}

            <Pressable
                onPress={handleSeedLibrary}
                style={({ pressed }) => [
                    styles.devButton,
                    pressed && styles.buttonPressed,
                    isLoading && styles.buttonDisabled,
                ]}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.textLight} />
                ) : (
                    <>
                        <Ionicons name="leaf-outline" size={20} color={colors.textLight} />
                        <Text style={styles.devButtonText}>Seed Library (Dev)</Text>
                    </>
                )}
            </Pressable>

            <Pressable
                onPress={handleClearLibrary}
                style={({ pressed }) => [
                    styles.devButton,
                    pressed && styles.buttonPressed,
                    isLoading && styles.buttonDisabled,
                ]}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.textLight} />
                ) : (
                    <>
                        <Ionicons name="trash-outline" size={20} color={colors.textLight} />
                        <Text style={styles.devButtonText}>Clear Library (Dev)</Text>
                    </>
                )}
            </Pressable>

            <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                    styles.logoutButton,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Ionicons name="log-out-outline" size={20} color={colors.textLight} style={styles.logoutIcon} />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.backgroundMain,
    },
    profileIcon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    emailText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 30,
        textAlign: 'center',
    },
    emailValue: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 200,
        marginTop: 60
    },
    logoutButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    devButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.info,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
        minWidth: 200,
    },
    devButtonText: {
        color: colors.textLight,
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 8,
    },
    buttonDisabled: {
        backgroundColor: colors.info + '99',
    }
});