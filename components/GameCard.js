import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GameCard = ({ game }) => {
    if (!game) {
        return (
            <View style={styles.card}>
                <Text>Game data not available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.textContentContainer}>
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{game.title || 'No Title'}</Text>
                <Text style={styles.platform} numberOfLines={1} ellipsizeMode="tail">{game.platform || 'N/A Platform'}</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Genre:</Text>
                    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{game.genre || 'N/A'}</Text>
                </View>

                {game.status && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{game.status}</Text>
                    </View>
                )}

                {game.rating !== null && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.detailLabel}>Rating:</Text>
                        <View style={styles.starsWrapper}>
                            {[...Array(5)].map((_, index) => (
                                <Ionicons
                                    key={index}
                                    name={index < game.rating ? 'star' : 'star-outline'}
                                    size={20}
                                    color="#FFC107"
                                    style={styles.starIcon}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {game.imageUrl && (
                <Image
                    source={{ uri: game.imageUrl }}
                    style={styles.cardImage}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    textContentContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardImage: {
        width: 45,
        height: 80,
        borderRadius: 6,
        resizeMode: 'cover',
        backgroundColor: '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 3,
    },
    platform: {
        fontSize: 14,
        color: '#555555',
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 13,
        color: '#444444',
        fontWeight: '600',
        marginRight: 4,
    },
    detailValue: {
        fontSize: 13,
        color: '#666666',
        flexShrink: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 2,
    },
    starsWrapper: {
        flexDirection: 'row',
    },
    starIcon: {
        marginRight: 1,
    },
});

export default GameCard;