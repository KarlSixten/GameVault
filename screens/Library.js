import { useLayoutEffect } from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    FlatList,
    Text,
    ActivityIndicator,
    Button
} from 'react-native';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db, auth } from '../util/auth/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GameCard from '../components/GameCard';
import colors from '../theme/colors';

export default function LibraryScreen({ navigation }) {
    const userId = auth.currentUser?.uid;
    const firestoreCollectionPath = userId ? `users/${userId}/library` : null;

    const libraryQuery = firestoreCollectionPath ? collection(db, firestoreCollectionPath) : null;
    const [library, loading, error] = useCollection(libraryQuery);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => navigation.navigate('AddGame')}
                    style={styles.headerButton}
                >
                    <Ionicons name="add-circle-outline" size={30} color={colors.primary} />
                </Pressable>
            ),
        });
    }, [navigation]);

    if (!userId) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Text style={styles.messageText}>Please log in to view your library.</Text>
                <Button title="Go to Login" onPress={() => navigation.navigate('LoginScreen')} color={colors.primary} />
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.messageText, { marginTop: 10 }]}>Loading your library...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={[styles.messageText, styles.errorTextContent]}>
                    Error loading library.
                </Text>
                {error?.message &&<Text style={styles.messageText}>Details: {error?.message}</Text>}
            </View>
        );
    }

    if (!library || library.docs.length === 0) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Ionicons name="library-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 10 }}/>
                <Text style={styles.emptyTitle}>Your Library is Empty</Text>
                <Text style={styles.emptySubtitle}>Looks like you haven't added any games yet. Tap the '+' icon to get started!</Text>
                <Pressable
                    style={[styles.themedButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AddGame')}
                >
                    <Text style={styles.themedButtonText}>Add Your First Game</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <FlatList
                data={library.docs}
                keyExtractor={(gameDoc) => gameDoc.id}
                renderItem={({ item: gameDoc }) => {
                    const gameData = { id: gameDoc.id, ...gameDoc.data() };
                    return (
                        <Pressable onPress={() => navigation.navigate("GameDetails", { game: gameData })}>
                            <GameCard game={gameData} />
                        </Pressable>
                    );
                }}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: colors.backgroundMain,
    },
    listContentContainer: {
        paddingVertical: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    errorTextContent: {
        color: colors.error,
        marginTop: 10,
        fontWeight: '500',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    themedButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    themedButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    }
});