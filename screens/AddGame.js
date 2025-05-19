import { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, Alert,
    Pressable, Image, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { db, auth } from '../util/auth/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { formatDateForDisplay } from '../util/convert';
import { chooseImageSourceAlert, uploadImageFromUri } from '../components/pickers/ImagePicker';
import StarRatingModalPicker from '../components/pickers/StarRatingModalPicker';
import DateModalPicker from '../components/pickers/DateModalPicker';
import PickerWheel from '../components/pickers/PickerWheel';
import { platformOptions, genreOptions, statusOptions } from '../util/options';

import colors from '../theme/colors';

const nonCompletedStatuses = ['Playing', 'On Hold', 'Not Started', 'Dropped'];

export default function AddGameScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState(null);
    const [genre, setGenre] = useState( null);
    const [status, setStatus] = useState(null);

    const [rating, setRating] = useState(null);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);

    const [dateBeaten, setDateBeaten] = useState(null);
    const [datePickerVisible, setDatePickerVisibility] = useState(false);

    const [localImageUri, setLocalImageUri] = useState(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showDatePickerModal = () => setDatePickerVisibility(true);
    const handleDateConfirmedFromPicker = (confirmedDate) => { setDateBeaten(confirmedDate); };
    const openRatingModal = () => setRatingModalVisible(true);
    const handleRatingConfirmed = (newRatingValue) => { setRating(newRatingValue); };

    const renderStarsForDisplay = (currentRatingValue) => {
        if (currentRatingValue === null) {
            return <Text style={styles.placeholderTextPicker}>Tap to rate</Text>;
        }
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= currentRatingValue ? "star" : "star-outline"}
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
                setLocalImageUri(uri);
            } else {
                console.log("Image selection cancelled or no image picked.");
            }
        });
    };

    const handleAddGame = async () => {
        if (!title.trim() || !platform || !genre || !status) {
            Alert.alert('Missing Information', 'Please fill in all required fields (Title, Platform, Genre, Status).');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Not Authenticated', 'You must be logged in to add a game.');
            navigation.navigate('Login');
            return;
        }

        setIsSubmitting(true);

        let firestoreDateBeaten = dateBeaten;
        if (nonCompletedStatuses.includes(status)) {
            firestoreDateBeaten = null;
        } else if (dateBeaten) {
            firestoreDateBeaten = Timestamp.fromDate(new Date(dateBeaten));
        }

        try {
            let finalImageUrl = null;
            let finalImageStoragePath = null;

            if (localImageUri) {
                const uploadResult = await uploadImageFromUri(localImageUri);
                if (uploadResult) {
                    finalImageUrl = uploadResult.downloadURL;
                    finalImageStoragePath = uploadResult.storagePath;
                } else {
                    console.warn("Image upload failed or returned no result. Proceeding without custom image.");
                }
            }

            const gameData = {
                userId: currentUser.uid,
                title: title.trim(),
                platform,
                genre,
                status,
                rating: rating,
                dateBeaten: firestoreDateBeaten,
                imageUrl: finalImageUrl,
                imagePath: finalImageStoragePath,
                notes: notes.trim(),
                createdAt: Timestamp.now(),
            };

            const userGamesCollectionRef = collection(db, 'users', currentUser.uid, 'library');
            await addDoc(userGamesCollectionRef, gameData);
            Alert.alert('Game Added!', `"${title}" has been successfully added to your library.`);
            navigation.goBack();
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error', `There was an issue adding your game: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    placeholderTextColor={colors.placeholderText}
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Platform *</Text>
                <PickerWheel
                    values={platformOptions}
                    selectedValue={platform}
                    onValueChange={(itemValue) => setPlatform(itemValue)}
                />

                <Text style={styles.label}>Genre *</Text>
                <PickerWheel
                    values={genreOptions}
                    selectedValue={genre}
                    onValueChange={(itemValue) => setGenre(itemValue)}
                />

                <Text style={styles.label}>Status *</Text>
                <PickerWheel
                    values={statusOptions}
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                />

                {status !== null && !nonCompletedStatuses.includes(status) && (
                    <View>
                        <Text style={styles.label}>Date Beaten (Optional)</Text>
                        <Pressable onPress={showDatePickerModal} style={styles.pickerTrigger}>
                            <Text style={styles.pickerTriggerText}>
                                {dateBeaten ? formatDateForDisplay(dateBeaten) : "Select Date"}
                            </Text>
                            <Ionicons name="calendar-outline" size={22} color={colors.textSecondary}/>
                        </Pressable>
                    </View>
                )}

                <Text style={styles.label}>Rating (Optional)</Text>
                <Pressable onPress={openRatingModal} style={styles.pickerTrigger}>
                    {renderStarsForDisplay(rating)}
                </Pressable>

                <Text style={styles.label}>Cover Image (Optional)</Text>
                {localImageUri && (
                    <Image source={{ uri: localImageUri }} style={styles.imagePreview} resizeMode="cover" />
                )}
                <Pressable
                    onPress={handleChooseImage}
                    disabled={isSubmitting}
                    style={styles.imageSelectButton}
                >
                    <Ionicons name="image-outline" size={20} color={colors.textLight} style={{marginRight: 8}}/>
                    <Text style={styles.imageSelectButtonText}>
                        {localImageUri ? "Change Image" : "Select Image"}
                    </Text>
                </Pressable>

                <Text style={styles.label}>Personal Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any thoughts, tips, or memories..."
                    placeholderTextColor={colors.placeholderText}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.submitButtonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button, // General button style
                            styles.submitButton, // Specific submit button style
                            pressed && styles.buttonPressed,
                            isSubmitting && styles.buttonDisabled,
                        ]}
                        onPress={handleAddGame}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.textLight} />
                        ) : (
                            <Text style={styles.buttonText}>Add Game to Library</Text>
                        )}
                    </Pressable>
                </View>

                <StarRatingModalPicker
                    modalVisible={ratingModalVisible}
                    setModalVisible={setRatingModalVisible}
                    currentRating={rating}
                    onRatingConfirm={handleRatingConfirmed}
                />
                <DateModalPicker
                    isVisible={datePickerVisible}
                    currentDate={dateBeaten}
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
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        marginTop: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        borderRadius: 8,
        marginBottom: 15,
        color: colors.textPrimary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 15,
        minHeight: 50,
    },
    pickerTriggerText: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    placeholderTextPicker: {
        fontSize: 16,
        color: colors.placeholderText,
    },
    starsRow: {
        flexDirection: 'row',
    },
    starDisplay: {
        marginRight: 2,
    },
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
    submitButtonContainer: {
        marginTop: 30,
        marginBottom: 20,
    },

    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: colors.primary + '99',
    }
});