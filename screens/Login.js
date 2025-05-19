import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors.js';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Information", "Please enter both email and password.");
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert("Login Failed", error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardAvoidingContainer}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to continue to your game library.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        styles.loginButton,
                        pressed && styles.buttonPressed,
                        isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.signUpLinkContainer,
                        pressed && styles.linkPressed, // Optional: style for when pressed
                    ]}
                    onPress={() => navigation.navigate('SignUp')} // Ensure 'SignUp' route exists
                    disabled={isLoading}
                >
                    <Text style={styles.signUpLinkText}>
                        Don't have an account? <Text style={styles.signUpLinkTextBold}>Sign Up</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingBottom: 20,
        backgroundColor: colors.backgroundMain,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: colors.surface,
        height: 50,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: colors.textPrimary,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
    },
    loginButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: colors.primary + '99',
    },
    signUpLinkContainer: {
        marginTop: 25,
        alignItems: 'center',
    },
    signUpLinkText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    signUpLinkTextBold: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    linkPressed: {
        opacity: 0.7,
    }
});