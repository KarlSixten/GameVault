import { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, Alert,
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
import styles from '../theme/AddEditGameStyles'

const nonCompletedStatuses = ['Playing', 'On Hold', 'Not Started', 'Dropped'];

export default function AddGameScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState(null);
    const [genre, setGenre] = useState(null);
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
                    placeholderTextColor={colors.placeholder}
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
                    onValueChange={setStatus}
                />

                {status !== null && !nonCompletedStatuses.includes(status) && (
                    <View>
                        <Text style={styles.label}>Date Beaten (Optional)</Text>
                        <Pressable onPress={showDatePickerModal} style={({ pressed }) => [
                            styles.pickerTrigger,
                            pressed && styles.buttonPressed,
                        ]}>
                            <Ionicons name="calendar-outline" size={22} color={colors.textLight} style={{ marginRight: 8 }} />
                            <Text style={styles.pickerTriggerText}>
                                {dateBeaten ? formatDateForDisplay(dateBeaten) : "Select Date"}
                            </Text>
                        </Pressable>
                    </View>
                )}

                <Text style={styles.label}>Rating (Optional)</Text>
                <Pressable onPress={openRatingModal} style={({ pressed }) => [
                    styles.pickerTrigger,
                    pressed && styles.buttonPressed,
                ]}>
                    {!rating && <Ionicons name="star-outline" size={22} color={colors.textLight} style={{ marginRight: 8 }} />}
                    {renderStarsForDisplay(rating)}
                </Pressable>

                <Text style={styles.label}>Cover Image (Optional)</Text>
                {localImageUri && (
                    <Image source={{ uri: localImageUri }} style={styles.imagePreview} resizeMode="cover" />
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
                        {localImageUri ? "Change Image" : "Select Image"}
                    </Text>
                </Pressable>

                <Text style={styles.label}>Personal Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any thoughts, tips, or memories..."
                    placeholderTextColor={colors.placeholder}
                    value={notes}
                    onChangeText={setNotes}
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