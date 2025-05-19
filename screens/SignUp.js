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

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Information", "Please enter both email and password.");
            return;
        }

        if (!passwordConfirm.trim()) {
            Alert.alert("Missing Information", "Please confirm your password.");
            return;
        }

        if (password !== passwordConfirm) {
            Alert.alert("The passwords do not match, please try again.");
            setPasswordConfirm('');
            return;
        }

        setIsLoading(true);
        try {
            await signup(email, password);
        } catch (error) {
            Alert.alert("Sign Up Failed", error.message || "An unexpected error occurred.");
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join our community of game enthusiasts!</Text>

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
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textSecondary}
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        styles.signUpButton,
                        pressed && styles.buttonPressed,
                        isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleSignUp}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.loginLinkContainer,
                        pressed && styles.linkPressed,
                    ]}
                    onPress={() => navigation.navigate('Login')}
                    disabled={isLoading}
                >
                    <Text style={styles.loginLinkText}>
                        Already have an account? <Text style={styles.loginLinkTextBold}>Login</Text>
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
    signUpButton: {
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
    loginLinkContainer: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginLinkText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    loginLinkTextBold: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    linkPressed: {
        opacity: 0.7,
    }
});