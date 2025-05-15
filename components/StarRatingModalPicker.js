import { Modal, View, Text, StyleSheet, Pressable, Button } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StarRatingModalPicker = ({ modalVisible, setModalVisible, currentRating, onRatingConfirm }) => {

    const handleSelectStar = (value) => {
        onRatingConfirm(value);
        setModalVisible(false);
    };

    const handleClear = () => {
        onRatingConfirm(null);
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    return (
        <Modal
            transparent={true}
            visible={modalVisible}
            animationType="fade"
        >
            <Pressable style={styles.modalOverlay} onPress={handleCancel}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.modalTitle}>Rate this game</Text>
                    <View style={styles.starsRowModal}>
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <Pressable key={starValue} onPress={() => handleSelectStar(starValue)} style={styles.starPressable}>
                                <Ionicons
                                    name={starValue <= (currentRating || 0) ? "star" : "star-outline"}
                                    size={40}
                                    color="#FFC107" // Gold/yellow for stars
                                />
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.modalActions}>
                        <Button title="Clear Rating" onPress={handleClear} color="#FF6347" />
                        <View style={{ width: 15 }} />
                        <Button title="Cancel" onPress={handleCancel} color="#777" />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 10,
        width: '85%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
    },
    starsRowModal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    starPressable: {
        padding: 5,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 10,
    },
});

export default StarRatingModalPicker;