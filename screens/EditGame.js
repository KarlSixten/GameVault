import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert, Pressable } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDateForDisplay, convertFirestoreTimestampToJSDate } from '../util/convert';

import StarRatingModalPicker from '../components/pickers/StarRatingModalPicker';
import DateModalPicker from '../components/pickers/DateModalPicker';
import PickerWheel from '../components/pickers/PickerWheel'

import { platformOptions, genreOptions, statusOptions } from '../util/options';

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

    const handleSaveGame = async () => {
        if (!newTitle || !newPlatform || !newGenre || !newStatus) {
            Alert.alert("Missing Fields", "Please fill in all required fields (*).");
            return;
        }
        if (!auth.currentUser || !gameDetails.id) {
            Alert.alert("Error", "Cannot save game. User not logged in or game ID is missing.");
            return;
        }

        setIsSubmitting(true);
        
        const gameRef = doc(db, 'users', auth.currentUser.uid, 'library', gameDetails.id);

        if (nonCompletedStatuses.includes(newStatus)) {
            setNewDateBeaten(null);
        }

        const dataToUpdate = {
            title: newTitle.trim(),
            platform: newPlatform,
            genre: newGenre,
            status: newStatus,
            rating: newRating,
            notes: newNotes.trim(),
            dateBeaten: newDateBeaten
        };

        try {
            await updateDoc(gameRef, dataToUpdate);
            Alert.alert("Success", "Game details updated successfully!");
            navigation.goBack();
        } catch (error) {
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} placeholder="e.g., Elden Ring" value={newTitle} onChangeText={setNewTitle} />

            <Text style={styles.label}>Platform *</Text>
            <PickerWheel
                values={platformOptions}
                selectedValue={newPlatform}
                onValueChange={(itemValue) => setNewPlatform(itemValue)}
            />

            <Text style={styles.label}>Genre *</Text>
            <PickerWheel
                values={genreOptions}
                selectedValue={newGenre}
                onValueChange={(itemValue) => setNewGenre(itemValue)}
            />

            <Text style={styles.label}>Status *</Text>
            <PickerWheel
                values={statusOptions}
                selectedValue={newStatus}
                onValueChange={(itemValue) => setNewStatus(itemValue)}
            />

            {newStatus !== null && !nonCompletedStatuses.includes(newStatus) && (
                <View>
                    <Text style={styles.label}>Date Beaten (Optional)</Text>
                    <Pressable onPress={showDatePickerModal}>
                        <View style={styles.datePickerInput}>
                            <Text style={styles.datePickerText}>{formatDateForDisplay(newDateBeaten)}</Text>
                        </View>
                    </Pressable>
                </View>
            )}


            <Text style={styles.label}>Rating (Optional)</Text>
            <Pressable onPress={openRatingModal}>
                <View style={styles.ratingInput}>
                    {renderStarsForDisplay(newRating)}
                </View>
            </Pressable>

            <Text style={styles.label}>Personal Notes (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Any thoughts, tips, or memories..." value={newNotes} onChangeText={setNewNotes} multiline numberOfLines={4} />

            <View style={styles.buttonContainer}>
                <Button title="Save Game" onPress={handleSaveGame} disabled={isSubmitting} color="#007bff" />
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