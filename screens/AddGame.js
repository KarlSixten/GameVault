import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert, Pressable } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

import StarRatingModalPicker from '../components/pickers/StarRatingModalPicker';
import DateModalPicker from '../components/pickers/DateModalPicker';
import PickerWheel from '../components/pickers/PickerWheel'

const platformOptions = [
    { label: 'Select a Platform...', value: '' },
    { label: 'PC (Steam, Epic, etc.)', value: 'PC' },
    { label: 'PlayStation 5 (PS5)', value: 'PS5' },
    { label: 'Xbox Series X/S', value: 'Xbox Series X/S' },
    { label: 'Nintendo Switch', value: 'Nintendo Switch' },
    { label: 'iOS', value: 'iOS' },
    { label: 'Android', value: 'Android' },
    { label: 'Other', value: 'Other' },
];

const genreOptions = [
    { label: 'Select a genre...', value: null },
    { label: 'Action', value: 'Action' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Role-Playing (RPG)', value: 'RPG' },
    { label: 'Strategy', value: 'Strategy' },
    { label: 'Simulation', value: 'Simulation' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Shooter', value: 'Shooter' },
    { label: 'Puzzle', value: 'Puzzle' },
    { label: 'Other', value: 'Other' },
];

const statusOptions = [
    { label: 'Select a status...', value: null },
    { label: 'Playing', value: 'Playing' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Completed', value: 'Completed' },
    { label: '100% Completed', value: '100%' },
    { label: 'Dropped', value: 'Dropped' },
    { label: 'Not Started', value: 'Not Started' },
];

const nonCompletedStatuses = ['Playing', 'On Hold', 'Not Started', 'Dropped'];


export default function AddGameScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState('');
    const [genre, setGenre] = useState('');
    const [status, setStatus] = useState('');

    const [rating, setRating] = useState(null);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);

    const [dateBeaten, setDateBeaten] = useState(null);
    const [datePickerVisible, setDatePickerVisibility] = useState(false);

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showDatePickerModal = () => setDatePickerVisibility(true);
    const handleDateConfirmedFromPicker = (confirmedDate) => { setDateBeaten(confirmedDate); };
    const openRatingModal = () => setRatingModalVisible(true);
    const handleRatingConfirmed = (newRating) => { setRating(newRating); };

    const formatDateForDisplay = (date) => {
        if (!date) {
            return "DD-MM-YYYY";
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // JavaScript months are 0-indexed
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

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

    const handleAddGame = async () => {
        if (!title.trim() || !platform.trim() || !genre.trim() || !status.trim()) {
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
        const gameData = {
            userId: currentUser.uid,
            title,
            platform,
            genre,
            status,
            rating: rating,
            dateBeaten: dateBeaten ? Timestamp.fromDate(dateBeaten) : null,
            notes: notes.trim(),
            createdAt: Timestamp.fromDate(new Date()),
        };

        try {
            const userGamesCollectionRef = collection(db, 'users', currentUser.uid, 'library');
            await addDoc(userGamesCollectionRef, gameData);
            Alert.alert('Game Added!', `${title} has been successfully added to your library.`);
            navigation.goBack();
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error', `There was an issue adding your game: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} placeholder="e.g., Elden Ring" value={title} onChangeText={setTitle} />

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
                <Pressable onPress={showDatePickerModal}>
                    <View style={styles.datePickerInput}>
                        <Text style={styles.datePickerText}>{formatDateForDisplay(dateBeaten)}</Text>
                    </View>
                </Pressable>
                </View>
            )}


            <Text style={styles.label}>Rating (Optional)</Text>
            <Pressable onPress={openRatingModal}>
                <View style={styles.ratingInput}>
                    {renderStarsForDisplay(rating)}
                </View>
            </Pressable>

            <Text style={styles.label}>Personal Notes (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Any thoughts, tips, or memories..." value={notes} onChangeText={setNotes} multiline numberOfLines={4} />

            <View style={styles.buttonContainer}>
                <Button title="Add Game to Library" onPress={handleAddGame} disabled={isSubmitting} color="#007bff" />
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
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 16, marginBottom: 5, marginTop: 15, fontWeight: 'bold', color: '#333' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, borderRadius: 6, marginBottom: 10, color: '#333' },
    textArea: { height: 100, textAlignVertical: 'top' },
    datePickerInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, borderRadius: 6, marginBottom: 10, justifyContent: 'center', minHeight: 48 },
    datePickerText: { fontSize: 16, color: '#333' },
    buttonContainer: { marginTop: 20 },
    ratingInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginBottom: 10, justifyContent: 'center', alignItems: 'flex-start', minHeight: 48 },
    placeholderTextRating: { fontSize: 16, color: '#aaa' },
    starsRow: { flexDirection: 'row' },
    starDisplay: { marginRight: 2 },
});