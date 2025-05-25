import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

import colors from '../theme/colors';
import styles from '../theme/AuthStyles';

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
                        styles.buttonBase,
                        styles.primaryButton,
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
                        styles.linkContainer,
                        pressed && styles.linkPressed,
                    ]}
                    onPress={() => navigation.navigate('SignUp')}
                    disabled={isLoading}
                >
                    <Text style={styles.linkText}>
                        Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
