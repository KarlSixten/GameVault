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

import colors from '../theme/colors.js';
import styles from '../theme/AuthStyles.js';

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
                        styles.buttonBase,
                        styles.primaryButton,
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
                        styles.linkContainer,
                        pressed && styles.linkPressed,
                    ]}
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                >
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkTextBold}>Login</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}