import { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Alert,
} from 'react-native';
import { db, auth } from '../util/auth/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { debounce } from 'lodash';
import { API_KEY } from '../util/auth/rawgioAuth';

import colors from '../theme/colors';

export default function SearchGameScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState({});

    const fetchGamesFromRAWG = async (queryText) => {
        if (!queryText || queryText.trim() === '') {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(
                    queryText
                )}&page_size=10`
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            setError(error.message || "Could not fetch games. Check your API key or network.");
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedFetchGames = useCallback(debounce(fetchGamesFromRAWG, 500), []);

    const handleSearchInputChange = (text) => {
        setSearchQuery(text);
        if (text.trim().length > 2) {
            debouncedFetchGames(text);
        } else if (text.trim().length === 0) {
            setSearchResults([]);
        }
    };

    const handleAddToWishlist = async (rawgGame) => {
        if (!auth.currentUser) {
            Alert.alert("Not Logged In", "You need to be logged in to add games to your wishlist.");
            return;
        }
        if (!rawgGame || !rawgGame.id) {
            Alert.alert("Error", "Invalid game data from RAWG.");
            return;
        }

        setIsAdding(prev => ({ ...prev, [rawgGame.id]: true }));

        try {
            const wishlistRef = collection(db, 'users', auth.currentUser.uid, 'wishlist');
            const gameDataForWishlist = {
                title: rawgGame.name || 'N/A',
                createdAt: Timestamp.now(),
                imageUrl: rawgGame.background_image
            };

            await addDoc(wishlistRef, gameDataForWishlist);
            Alert.alert("Wishlist", `"${rawgGame.name}" added to your wishlist!`);

        } catch (error) {
            Alert.alert("Error", "Could not add game to wishlist. Please try again.");
        } finally {
            setIsAdding(prev => ({ ...prev, [rawgGame.id]: false }));
        }
    };

    const renderGameItem = ({ item }) => (
        <View style={styles.gameItemContainer}>
            {item.background_image && (
                <Image source={{ uri: item.background_image }} style={styles.gameImage} />
            )}
            <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{item.name}</Text>
            </View>
            <Pressable
                style={[styles.addButton, isAdding[item.id] && styles.addButtonDisabled]}
                onPress={() => handleAddToWishlist(item)}
                disabled={isAdding[item.id]}
            >
                {isAdding[item.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.addButtonText}>Add to Wishlist</Text>
                )}
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for games (e.g., Cyberpunk 2077)..."
                value={searchQuery}
                onChangeText={handleSearchInputChange}
            />

            {isLoading && searchQuery.trim().length > 0 && (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!isLoading && searchResults.length === 0 && searchQuery.trim().length > 2 && !error && (
                 <Text style={styles.noResultsText}>No games found for "{searchQuery}". Try a different search.</Text>
            )}

            <FlatList
                data={searchResults}
                renderItem={renderGameItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: colors.backgroundMain,
    },
    searchInput: {
        height: 50,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
    },
    loader: {
        marginVertical: 20,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 16,
    },
    noResultsText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
        color: colors.textSecondary,
    },
    list: {
        flex: 1,
    },
    gameItemContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundPaper,
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: colors.backgroundDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    gameImage: {
        width: 80,
        height: 100,
        borderRadius: 4,
        marginRight: 10,
        backgroundColor: colors.placeholder,
    },
    gameInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    gameTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addButtonDisabled: {
        backgroundColor: colors.primary + '77',
    },
    addButtonText: {
        color: colors.textLight,
        fontSize: 14,
        fontWeight: '600',
    },
});