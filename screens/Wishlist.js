import { View, StyleSheet, Pressable, ActivityIndicator, Text, Button, Alert } from 'react-native';
import { db, auth } from '../util/auth/firebaseConfig'
import { useCollection } from 'react-firebase-hooks/firestore';
import { doc, deleteDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { useLayoutEffect } from 'react'
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

import colors from '../theme/colors';

import GameCard from '../components/GameCard';

export default function WishlistScreen({ navigation }) {
    const userId = auth.currentUser?.uid;
    const firestoreCollectionPath = userId ? `users/${userId}/wishlist` : null;
    const wishlistQuery = firestoreCollectionPath ? collection(db, firestoreCollectionPath) : null;
    const [wishlist, loading, error] = useCollection(wishlistQuery);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => navigation.navigate("SearchGame")}
                    style={styles.headerButton}

                >
                    <Ionicons name="add-circle-outline" size={30} color="#007AFF" />
                </Pressable>
            ),
        });
    }, [navigation]);

    if (!userId) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Text style={styles.messageText}>Please log in to view your wishlist.</Text>
                <Button title="Go to Login" onPress={() => navigation.navigate('LoginScreen')} color={colors.primary} />
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.messageText, { marginTop: 10 }]}>Loading your wishlist...</Text>
            </View>
        );
    }

    if (error) {
        console.error("Error fetching wishlist:", error);
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={[styles.messageText, styles.errorTextContent]}>
                    Error loading wishlist.
                </Text>
                <Text style={styles.messageText}>Details: {error.message}</Text>
            </View>
        );
    }

    if (!wishlist || wishlist.docs.length === 0) {
        return (
            <View style={[styles.screenContainer, styles.centeredMessageContainer]}>
                <Ionicons name="gift-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>Your wishlist is Empty</Text>
                <Text style={styles.emptySubtitle}>Looks like you haven't wished for any games yet. Tap the '+' icon to get started!</Text>
                <Pressable
                    style={[styles.themedButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('SearchGame')}
                >
                    <Text style={styles.themedButtonText}>Add Your First Wish</Text>
                </Pressable>
            </View>
        );
    }

    const renderGameCard = ({ item }) => (
        <View style={styles.rowFront}>
            <GameCard game={item.data()} />
        </View>
    );

    const renderHiddenActions = ({ item }) => (
        <View style={styles.rowBack}>
            <Pressable
                style={[styles.hiddenButton, styles.addLibraryButton]}
                onPress={() => {
                    handleAddToLibrary(item.data());
                }}
            >
                <Text style={styles.hiddenButtonText}>Add to Library</Text>
            </Pressable>

            <Pressable
                style={[styles.hiddenButton, styles.deleteButton]}
                onPress={() => {
                    handleDeleteFromWishlist(item.id, item.data());
                }}
            >
                <Text style={styles.hiddenButtonText}>Delete</Text>
            </Pressable>
        </View>
    );

    const handleAddToLibrary = (gameDetails) => {

        console.log("Added to library", gameDetails)

        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Not Authenticated', 'You must be logged in to add a game.');
            navigation.navigate('Login');
            return;
        }


        const gameData = {
            userId: currentUser.uid,
            title: gameDetails.title,
            imageUrl: gameDetails.imageUrl,
            createdAt: Timestamp.now(),
            userId: currentUser.uid,
            platform: 'PC',         // placeholder
            genre: 'Action',        // placeholder
            status: 'Not Started',  // placeholder
            rating: null, 
            notes: ''
        };

        Alert.alert(
            "Confirm Add to Library",
            `Do you want to add "${gameDetails.title}" to your library?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Add",
                    style: "default",
                    onPress: async () => {
                        try {

                            const libraryRef = collection(db, 'users', auth.currentUser.uid, 'library');
                            await addDoc(libraryRef, gameData);

                            Alert.alert("Success", `"${gameDetails.title}" has been added to your library.`);
                        } catch (error) {
                            console.log(error);

                            Alert.alert("Error", "Could not add game. Please try again.");
                        } finally {
                        }
                    },
                    style: "default"
                }
            ]
        );

    }

    const handleDeleteFromWishlist = (gameId, gameDetails) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete "${gameDetails.title}"? This action cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {

                            const gameFirestoreRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', gameId);
                            await deleteDoc(gameFirestoreRef);

                            Alert.alert("Success", `"${gameDetails.title}" has been deleted from your wishlist.`);
                        } catch (error) {
                            Alert.alert("Error", "Could not delete game. Please try again.");
                        } finally {
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    }

    return (
        <View style={styles.container}>
            <SwipeListView
                data={wishlist?.docs}
                keyExtractor={(item) => item.id}
                renderItem={renderGameCard}
                renderHiddenItem={renderHiddenActions}
                leftOpenValue={150}
                rightOpenValue={-100}
                previewRowKey={wishlist?.docs && wishlist.docs.length > 0 ? wishlist.docs[0].id : ''}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                disableRightSwipe={false}
                disableLeftSwipe={false}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    listContentContainer: {
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: 20,
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
        lineHeight: 24,
    },
    errorTextContent: {
        color: colors.error,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    themedButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    themedButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
    rowFront: {
        backgroundColor: colors.backgroundMain,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: colors.backgroundMain,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    hiddenButton: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
    },
    addLibraryButton: {
        backgroundColor: colors.success,
        width: 150,
        left: 0,
    },
    deleteButton: {
        backgroundColor: colors.error,
        width: 100,
        right: 0,
    },
    hiddenButtonText: {
        color: colors.textLight,
        fontWeight: 'bold',
    },
});