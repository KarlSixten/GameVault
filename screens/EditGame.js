import { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, Alert,
    Pressable, Image, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { db, auth, storage } from '../util/auth/firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { formatDateForDisplay, convertFirestoreTimestampToJSDate } from '../util/convert';
import { chooseImageSourceAlert, uploadImageFromUri } from '../components/pickers/ImagePicker';
import StarRatingModalPicker from '../components/pickers/StarRatingModalPicker';
import DateModalPicker from '../components/pickers/DateModalPicker';
import PickerWheel from '../components/pickers/PickerWheel';
import { platformOptions, genreOptions, statusOptions } from '../util/options';

import colors from '../theme/colors';
import styles from '../theme/AddEditGameStyles'


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
    const currentImagePath = gameDetails.imagePath;

    const showDatePickerModal = () => setDatePickerVisibility(true);
    const handleDateConfirmedFromPicker = (confirmedDate) => { setNewDateBeaten(confirmedDate); };
    const openRatingModal = () => setRatingModalVisible(true);
    const handleRatingConfirmed = (newRating) => { setNewRating(newRating); };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const renderStarsForDisplay = (currentRating) => {
        if (currentRating === null) {
            return <Text style={styles.placeholderTextPicker}>Tap to rate</Text>;
        }
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= currentRating ? "star" : "star-outline"}
                    size={28}
                    color={colors.accent}
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

        let dateBeatenToSaveWithLogic = newDateBeaten;

        if (nonCompletedStatuses.includes(newStatus)) {
            dateBeatenToSaveWithLogic = null;
            if (newDateBeaten !== null) {
                setNewDateBeaten(null);
            }
        }

        try {
            const dataToUpdate = {
                title: newTitle.trim(),
                platform: newPlatform,
                genre: newGenre,
                status: newStatus,
                rating: newRating,
                dateBeaten: dateBeatenToSaveWithLogic,
                notes: newNotes.trim()
            };

            if (newLocalImageUri) {
                const imagePathToDelete = currentImagePath;
                const imageFileRef = ref(storage, imagePathToDelete);

                if (imagePathToDelete) {
                    try {
                        await deleteObject(imageFileRef);
                    } catch (storageError) {
                        console.error(`Failed to delete image from Storage (path: ${imagePathToDelete})`, storageError);
                    }
                }

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
            >

                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Cyberpunk 2077"
                    placeholderTextColor={colors.placeholder}
                    value={newTitle}
                    onChangeText={setNewTitle}
                />

                <Text style={styles.label}>Platform *</Text>
                <PickerWheel
                    values={platformOptions}
                    selectedValue={newPlatform}
                    onValueChange={setNewPlatform}
                />

                <Text style={styles.label}>Genre *</Text>
                <PickerWheel
                    values={genreOptions}
                    selectedValue={newGenre}
                    onValueChange={setNewGenre}
                />

                <Text style={styles.label}>Status *</Text>
                <PickerWheel
                    values={statusOptions}
                    selectedValue={newStatus}
                    onValueChange={setNewStatus}
                />

                {!nonCompletedStatuses.includes(newStatus) && (
                    <View>
                        <Text style={styles.label}>Date Beaten (Optional)</Text>
                        <Pressable onPress={showDatePickerModal} style={({ pressed }) => [
                            styles.pickerTrigger,
                            pressed && styles.buttonPressed,
                        ]}>
                            <Ionicons name="calendar-outline" size={22} color={colors.textLight} style={{ marginRight: 8 }} />
                            <Text style={styles.pickerTriggerText}>
                                {newDateBeaten ? formatDateForDisplay(newDateBeaten) : "Select Date"}
                            </Text>
                        </Pressable>
                    </View>
                )}

                <Text style={styles.label}>Rating (Optional)</Text>
                <Pressable onPress={openRatingModal} style={styles.pickerTrigger}>
                    {!newRating && <Ionicons name="star-outline" size={22} color={colors.textLight} style={{ marginRight: 8 }} />}
                    {renderStarsForDisplay(newRating)}
                </Pressable>

                <Text style={styles.label}>Cover Image (Optional)</Text>
                {(newLocalImageUri || currentImageUrl) && (
                    <Image source={{ uri: newLocalImageUri ? newLocalImageUri : currentImageUrl }} style={styles.imagePreview} />
                )}
                <Pressable
                    onPress={handleChooseImage}
                    disabled={isSubmitting}
                    style={({ pressed }) => [
                        styles.pickerTrigger,
                        pressed && styles.buttonPressed,
                    ]}>
                    <Ionicons name="image-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
                    <Text style={styles.pickerTriggerText}>
                        {(newLocalImageUri || currentImageUrl) ? "Change Selected Image" : "Select Custom Image"}
                    </Text>
                </Pressable>

                <Text style={styles.label}>Personal Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any thoughts, tips, or memories..."
                    placeholderTextColor={colors.placeholder}
                    value={newNotes}
                    onChangeText={setNewNotes}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.submitButtonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button, 
                            styles.submitButton,
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