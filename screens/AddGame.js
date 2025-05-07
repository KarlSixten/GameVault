import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { db, auth } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function AddGameScreen({ navigation }) {
    // Required fields
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState('');
    const [genre, setGenre] = useState(''); // Could be multi-select or tags input
    const [status, setStatus] = useState(''); // E.g., 'Playing', 'Completed', 'On Hold', 'Backlog' - Picker for this needed

    // Optional fields
    const [rating, setRating] = useState(''); // 1-5 star component
    const [dateBeaten, setDateBeaten] = useState(''); // Could be a DatePicker
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const platforms = [
        { label: 'Select a Platform...', value: '' }, // Placeholder item
        { label: 'PC (Steam, Epic, etc.)', value: 'PC' },
        { label: 'PlayStation 5 (PS5)', value: 'PS5' },
        { label: 'Xbox Series X/S', value: 'Xbox Series X/S' },
        { label: 'Nintendo Switch', value: 'Nintendo Switch' },
        { label: 'iOS', value: 'iOS' },
        { label: 'Android', value: 'Android' },
        { label: 'Other', value: 'Other' },
    ];

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
            rating: rating.trim() === '' ? null : rating,
            dateBeaten: dateBeaten.trim() === '' ? null : dateBeaten,
            notes: notes.trim(),
            createdAt: Timestamp.fromDate(new Date()),
        };

        try {
            const userGamesCollectionRef = collection(db, 'users', currentUser.uid, 'library');

            const docRef = await addDoc(userGamesCollectionRef, gameData);
            console.log('Document written with ID: ', docRef.id);

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
            <TextInput
                style={styles.input}
                placeholder="e.g., Elden Ring"
                value={title}
                onChangeText={setTitle}
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={platform}
                    onValueChange={(itemValue, itemIndex) => setPlatform(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem} // For iOS item styling
                >
                    {platforms.map((p) => (
                        <Picker.Item key={p.value} label={p.label} value={p.value} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Genre(s)/Tag(s) *</Text>
            <TextInput // Replace with a tag input or multi-select picker later
                style={styles.input}
                placeholder="e.g., Action RPG, Open World"
                value={genre}
                onChangeText={setGenre}
            />

            <Text style={styles.label}>Status *</Text>
            <TextInput // Replace with Picker: Playing, Completed, On Hold, Backlog, Dropped
                style={styles.input}
                placeholder="e.g., Playing, Completed"
                value={status}
                onChangeText={setStatus}
            />

            <Text style={styles.label}>Rating (Optional)</Text>
            <TextInput // Replace with a star rating component or number input
                style={styles.input}
                placeholder="e.g., 5/5, 9/10"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric" // Example if it's a simple number
            />

            <Text style={styles.label}>Date Beaten (Optional)</Text>
            <TextInput // Replace with a DatePicker component
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dateBeaten}
                onChangeText={setDateBeaten}
            />

            <Text style={styles.label}>Personal Notes (Optional)</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any thoughts, tips, or memories..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
            />

            <Button
                title="Add Game to Library"
                onPress={handleAddGame}
                disabled={isSubmitting}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        fontSize: 16,
        borderRadius: 6,
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top', // For Android
    },
    pickerContainer: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
        color: '#000',
    },
});