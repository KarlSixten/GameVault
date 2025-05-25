import { Modal, View, Text, StyleSheet, Pressable, Button } from 'react-native';
import colors from '../../theme/colors';
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
                <Pressable style={styles.modalContent} >
                    <Text style={styles.modalTitle}>Rate this game</Text>
                    <View style={styles.starsRowModal}>
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <Pressable key={starValue} onPress={() => handleSelectStar(starValue)} style={styles.starPressable}>
                                <Ionicons
                                    name={starValue <= (currentRating || 0) ? "star" : "star-outline"}
                                    size={40}
                                    color={colors.accent}
                                />
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.modalActions}>
                        <Button title="Clear Rating" onPress={handleClear} color={colors.error} />
                        <View style={styles.actionsSpacer} />
                        <Button title="Cancel" onPress={handleCancel} color={colors.textSecondary} />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.backgroundPaper,
        padding: 25,
        borderRadius: 10,
        width: '85%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
        color: colors.textPrimary,
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
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    actionsSpacer: {
        width: 15,
    }
});

export default StarRatingModalPicker;