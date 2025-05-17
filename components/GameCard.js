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
            <Text style={styles.title}>{game.title || 'No Title'}</Text>
            <Text style={styles.platform}>{game.platform || 'N/A Platform'}</Text>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Genre:</Text>
                <Text style={styles.detailValue}>{game.genre}</Text>
            </View>

            {game.status && (
                <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{game.status}</Text>
            </View>)
            }

            {game.rating !== null && typeof game.rating === 'number' && (
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
    },
    image: {
        width: 80,
        height: 100,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    platform: {
        fontSize: 15,
        color: '#555555',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 14,
        color: '#444444',
        fontWeight: '600',
        marginRight: 5,
    },
    detailValue: {
        fontSize: 14,
        color: '#666666',
        flexShrink: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    starsWrapper: {
        flexDirection: 'row',
    },
    starIcon: {
        marginRight: 1,
    },
});

export default GameCard;