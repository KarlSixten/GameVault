import { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, Alert,
    Pressable, Image, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { db, auth, storage } from '../util/auth/firebaseConfig';
import { updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { formatDateForDisplay, convertFirestoreTimestampToJSDate } from '../util/convert';
import { chooseImageSourceAlert, uploadImageFromUri } from '../components/pickers/ImagePicker';
import StarRatingModalPicker from '../components/pickers/StarRatingModalPicker';
import DateModalPicker from '../components/pickers/DateModalPicker';
import PickerWheel from '../components/pickers/PickerWheel';
import { platformOptions, genreOptions, statusOptions } from '../util/options';

import colors from '../theme/colors';

const nonCompletedStatuses = ['Playing', 'On Hold', 'Not Started', 'Dropped'];

export default function EditGameScreen({ route, navigation }) {
    const gameDetails = route.params?.game || {};

    const [newTitle, setNewTitle] = useState(gameDetails.title);
    const [newPlatform, setNewPlatform] = useState(gameDetails.platform);
    const [newGenre, setNewGenre] = useState(gameDetails.genre);
    const [newStatus, setNewStatus] = useState(gameDetails.status);
    const [newDateBeaten, setNewDateBeaten] = useState(convertFirestoreTimestampToJSDate(gameDetails.dateBeaten));
    const [newRating, setNewRating] = useState(gameDetails.rating);
    const [newNotes, setNewNotes] = useState(gameDetails.notes);

    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [datePickerVisible, setDatePickerVisibility] = useState(false);

    const [newLocalImageUri, setNewLocalImageUri] = useState(null);
    const currentImageUrl = gameDetails.imageUrl;

    const showDatePickerModal = () => setDatePickerVisibility(true);
    const handleDateConfirmedFromPicker = (confirmedDate) => { setNewDateBeaten(confirmedDate); };
    const openRatingModal = () => setRatingModalVisible(true);
    const handleRatingConfirmed = (newRating) => { setNewRating(newRating); };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const renderStarsForDisplay = (currentRating) => {
        if (currentRating === null) {
            return <Text style={styles.placeholderTextRating}>Tap to rate</Text>;
        }

        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= currentRating ? "star" : "star-outline"}
                    size={28}
                    color="#FFC107"
                    style={styles.starDisplay}
                />
            );
        }
        return <View style={styles.starsRow}>{stars}</View>;
    };

    const handleChooseImage = () => {
        chooseImageSourceAlert((uri) => {
            if (uri) {
                setNewLocalImageUri(uri);
            } else {
                console.log("Image selection cancelled or no image picked.");
                setNewLocalImageUri(null);
            }
        });
    };

    const handleSaveGame = async () => {
        if (!newTitle.trim() || !newPlatform.trim() || !newGenre.trim() || !newStatus.trim()) {
            Alert.alert('Missing Information', 'Please fill in all required fields (Title, Platform, Genre, Status).');
            return;
        }

        if (!auth.currentUser) {
            Alert.alert('Not Authenticated', 'You must be logged in to add a game.');
            navigation.navigate('Login');
            return;
        }

        if (!gameDetails.id) {
            Alert.alert("Error", "Cannot save game. Game ID is missing.");
            return;
        }

        setIsSubmitting(true);

        if (nonCompletedStatuses.includes(newStatus)) {
            setNewDateBeaten(null);
        }

        try {
            const dataToUpdate = {
                title: newTitle.trim(),
                platform: newPlatform,
                genre: newGenre,
                status: newStatus,
                rating: newRating,
                dateBeaten: newDateBeaten,
                notes: newNotes.trim()
            };

            if (newLocalImageUri) {
                // ------------------------------------------------------
                // DELETE OLD IMAGE IF PRESENT
                // ------------------------------------------------------
                const uploadResult = await uploadImageFromUri(newLocalImageUri);
                if (uploadResult) {
                    dataToUpdate.imageUrl = uploadResult.downloadURL;
                    dataToUpdate.imagePath = uploadResult.storagePath;
                }
            }

            const gameRef = doc(db, 'users', auth.currentUser.uid, 'library', gameDetails.id);
            await updateDoc(gameRef, dataToUpdate);
            Alert.alert("Success", "Game details updated successfully!");
            navigation.goBack();
        } catch (error) {
            console.error('Error updating document: ', error);
            Alert.alert("Error", "Could not update game details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (Object.keys(gameDetails).length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Game details not found.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., The Witcher 3"
                    placeholderTextColor={colors.placeholderText}
                    value={newTitle}
                    onChangeText={setNewTitle}
                />

                <Text style={styles.label}>Platform *</Text>
                <PickerWheel values={platformOptions} selectedValue={newPlatform} onValueChange={setNewPlatform} />
                <Text style={styles.label}>Genre *</Text>
                <PickerWheel values={genreOptions} selectedValue={newGenre} onValueChange={setNewGenre} />
                <Text style={styles.label}>Status *</Text>
                <PickerWheel values={statusOptions} selectedValue={newStatus} onValueChange={setNewStatus} />

                {!nonCompletedStatuses.includes(newStatus) && (
                    <View>
                        <Text style={styles.label}>Date Beaten (Optional)</Text>
                        <Pressable onPress={showDatePickerModal} style={styles.pickerTrigger}>
                            <Text style={styles.pickerTriggerText}>
                                {newDateBeaten ? formatDateForDisplay(newDateBeaten) : "Select Date"}
                            </Text>
                            <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                )}

                <Text style={styles.label}>Rating (Optional)</Text>
                <Pressable onPress={openRatingModal} style={styles.pickerTrigger}>
                    {renderStarsForDisplay(newRating)}
                </Pressable>

                <Text style={styles.label}>Cover Image (Optional)</Text>
                {(newLocalImageUri || currentImageUrl) && (
                    <Image source={{ uri: newLocalImageUri ? newLocalImageUri : currentImageUrl }} style={styles.imagePreview} />
                )}
                <Pressable onPress={handleChooseImage} disabled={isSubmitting} style={styles.imageSelectButton}>
                    <Text style={styles.imageSelectButtonText}>
                        {(newLocalImageUri || currentImageUrl) ? "Change Selected Image" : "Select Custom Image"}
                    </Text>
                </Pressable>

                <Text style={styles.label}>Personal Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any thoughts, tips, or memories..."
                    placeholderTextColor={colors.placeholderText}
                    value={newNotes}
                    onChangeText={setNewNotes}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.submitButtonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button, styles.submitButton,
                            pressed && styles.buttonPressed,
                            isSubmitting && styles.buttonDisabled,
                        ]}
                        onPress={handleSaveGame}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.textLight} />
                        ) : (
                            <Text style={styles.buttonText}>Save Changes</Text>
                        )}
                    </Pressable>
                </View>

                {/* Modals */}
                <StarRatingModalPicker
                    modalVisible={ratingModalVisible}
                    setModalVisible={setRatingModalVisible}
                    currentRating={newRating}
                    onRatingConfirm={handleRatingConfirmed}
                />
                <DateModalPicker
                    isVisible={datePickerVisible}
                    currentDate={newDateBeaten}
                    onDateSelected={handleDateConfirmedFromPicker}
                    onCloseModal={() => setDatePickerVisibility(false)}
                    maximumDate={new Date()}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: colors.backgroundMain,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    screenTitle: {
        fontSize: 28, fontWeight: 'bold', color: colors.textPrimary,
        textAlign: 'center', marginBottom: 30, marginTop: 10,
    },
    label: {
        fontSize: 16, marginBottom: 8, marginTop: 15,
        fontWeight: '600', color: colors.textPrimary,
    },
    input: {
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: 15, paddingVertical: 12, fontSize: 16,
        borderRadius: 8, marginBottom: 15, color: colors.textPrimary,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    pickerTrigger: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8,
        marginBottom: 15, minHeight: 50,
    },
    pickerTriggerText: { fontSize: 16, color: colors.textPrimary },
    placeholderTextPicker: { fontSize: 16, color: colors.placeholderText },
    starsRow: { flexDirection: 'row' },
    starDisplay: { marginRight: 2 },
    imagePreviewContainer: { alignItems: 'center', marginBottom: 10 },
    imagePreviewStyle: {
        width: '50%',
        aspectRatio: 9 / 16,
        backgroundColor: colors.placeholder,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imagePlaceholder: {
        width: '50%',
        aspectRatio: 9 / 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageSelectButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.secondary, paddingVertical: 12, paddingHorizontal: 20,
        borderRadius: 8, marginBottom: 10, marginTop: 8,
    },
    imageActionButtonText: { color: colors.textLight, fontSize: 16, fontWeight: '500' },
    submitButtonContainer: { marginTop: 30, marginBottom: 20 },
    button: {
        height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 3.84, elevation: 3,
    },
    submitButton: { backgroundColor: colors.primary },
    buttonText: { color: colors.textLight, fontSize: 18, fontWeight: '600' },
    buttonPressed: { opacity: 0.8 },
    buttonDisabled: { backgroundColor: colors.primary + '99' },
    errorText: { fontSize: 18, color: colors.error, textAlign: 'center', marginTop: 50, },

    imageSelectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 8,
    },
    imageSelectButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    imagePreview: {
        width: '50%',
        aspectRatio: 9 / 16,
        alignSelf: 'center',
        marginBottom: 10,
        backgroundColor: colors.placeholder,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
});