import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert } from 'react-native';

export default function AddGameScreen({ navigation }) {
    // Required fields
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState(''); // Create picker for this
    const [genre, setGenre] = useState(''); // Could be multi-select or tags input
    const [status, setStatus] = useState(''); // E.g., 'Playing', 'Completed', 'On Hold', 'Backlog' - Picker for this needed

    // Optional fields
    const [rating, setRating] = useState(''); // 1-5 star component
    const [dateBeaten, setDateBeaten] = useState(''); // Could be a DatePicker
    const [notes, setNotes] = useState('');

    async function handleAddGame() {
        if (!title.trim() || !platform.trim() || !genre.trim() || !status.trim()) {
            Alert.alert('Missing Information', 'Please fill in all required fields (Title, Platform, Genre, Status).');
            return;
        }

        const gameData = {
            title,
            platform,
            genre,
            status,
            rating: rating || null,
            dateBeaten: dateBeaten || null,
            notes: notes || '',
            addedDate: new Date().toISOString(),
        };

        Alert.alert('Game Added (Simulated)', `${title} has been added to your library.`);

        navigation.goBack();

        setTitle('');
        setPlatform('');
        setGenre('');
        setStatus('');
        setRating('');
        setDateBeaten('');
        setNotes('');
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Elden Ring"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Platform *</Text>
            <TextInput // Replace with Picker or custom platform selector later
                style={styles.input}
                placeholder="e.g., PS5, PC, Nintendo Switch"
                value={platform}
                onChangeText={setPlatform}
            />

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

            <Button title="Add Game to Library" onPress={handleAddGame} />
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
});