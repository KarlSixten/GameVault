import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Alert, Button, Pressable, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, auth, storage } from '../util/auth/firebaseConfig';
import { ref, deleteObject } from "firebase/storage";
import { useState, useLayoutEffect, useCallback } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { convertFirestoreTimestampToJSDate } from "../util/convert";

import colors from "../theme/colors";

const formatFirebaseDate = (timestamp) => {
    if (!timestamp) {
        return;
    }
    const jsDate = convertFirestoreTimestampToJSDate(timestamp);

    return jsDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function GameDetailsScreen({ route, navigation }) {
    const gameIdFromRoute = route.params?.game?.id;

    const [gameDetails, setGameDetails] = useState(route.params?.game || {});

    const [isUpdating, setIsUpdating] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);

    const [formattedDateBeaten, setFormattedDateBeaten] = useState(formatFirebaseDate(gameDetails.dateBeaten));
    const [formattedDateAdded, setFormattedDateAdded] = useState(formatFirebaseDate(gameDetails.createdAt));

    const nonCompletedStatuses = ['Playing', 'On Hold', 'Not Started', 'Dropped'];
    const gameIsCompletable = gameDetails && gameDetails.id && nonCompletedStatuses.includes(gameDetails.status) && !gameDetails.dateBeaten;

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchGameDetails = async () => {
                try {
                    const gameRef = doc(db, 'users', auth.currentUser.uid, 'library', gameIdFromRoute);

                    const docSnap = await getDoc(gameRef);

                    if (docSnap.exists()) {
                        const fetchedData = { id: docSnap.id, ...docSnap.data() };
                        setGameDetails(fetchedData);
                        setFormattedDateBeaten(formatFirebaseDate(fetchedData.dateBeaten));
                        setFormattedDateAdded(formatFirebaseDate(fetchedData.createdAt));
                    } else {
                        Alert.alert("Not Found", "This game was not found in your library.");
                        setGameDetails(null);
                    }
                } catch (error) {
                    Alert.alert("Fetch Error", "Could not load game details. An error occurred.");
                    setGameDetails(null);
                }
            };

            if (isActive) {
                fetchGameDetails();
            }

            return () => {
                isActive = false;
            };
        }, [gameIdFromRoute])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => navigation.navigate('EditGame', { game: gameDetails })}
                    style={styles.headerButton}

                >
                    <Ionicons name="create-outline" size={30} color={colors.primary} />
                </Pressable>
            ),
        });
    }, [navigation, gameDetails]);

    const handleCompleteGame = async () => {
        if (!gameDetails.id || !auth.currentUser) {
            Alert.alert("Error", "Cannot update game. Missing game ID or user not logged in.");
            return;
        }

        const gameRef = doc(db, 'users', auth.currentUser.uid, 'library', gameDetails.id);

        setIsUpdating(true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newDateBeatenTimestamp = Timestamp.fromDate(today);

        try {
            await updateDoc(gameRef, {
                status: 'Completed',
                dateBeaten: newDateBeatenTimestamp
            });
            Alert.alert("Success", `${gameDetails.title} marked as Completed!`);

            setGameDetails(prevDetails => ({
                ...prevDetails,
                status: 'Completed',
                dateBeaten: {
                    seconds: newDateBeatenTimestamp.seconds,
                    nanoseconds: newDateBeatenTimestamp.nanoseconds
                }
            }));
            setFormattedDateBeaten(formatFirebaseDate(newDateBeatenTimestamp));

        } catch (error) {
            console.error("Error updating game status:", error);
            Alert.alert("Error", "Could not update game status. Please try again.");
        } finally {
            setIsUpdating(false);
            setSliderValue(0);
        }
    }

    const handleDeleteGame = async () => {
        if (!gameDetails?.id || !auth.currentUser) {
            Alert.alert("Error", "Cannot delete game. Missing game ID or user not logged in.");
            return;
        }

        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete "${gameDetails.title}"? This action cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsUpdating(true);
                        try {
                            const imagePathToDelete = gameDetails.imagePath;

                            if (imagePathToDelete) {
                                const imageFileRef = ref(storage, imagePathToDelete);

                                try {
                                    await deleteObject(imageFileRef);
                                } catch (storageError) {
                                    console.error(`Failed to delete image from Storage (path: ${imagePathToDelete})`, storageError);
                                }
                            }

                            const gameFirestoreRef = doc(db, 'users', auth.currentUser.uid, 'library', gameDetails.id);
                            await deleteDoc(gameFirestoreRef);

                            Alert.alert("Success", `"${gameDetails.title}" has been deleted.`);
                            navigation.goBack();

                        } catch (error) {
                            console.error("[DELETE_GAME] Critical error during delete game process:", error);
                            Alert.alert("Error", "Could not delete game. Please try again.");
                        } finally {
                            setIsUpdating(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (Object.keys(gameDetails).length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Game details not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>

            {gameDetails.imageUrl ? (
                <View style={styles.imageOuterContainer}>
                    <Image
                        source={{ uri: gameDetails.imageUrl }}
                        style={styles.gameImage}
                    />
                </View>
            ) : (
                <View style={styles.imageOuterContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={80} color="#c0c0c0" />
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                </View>
            )}
            <Text style={styles.gameTitle}>{gameDetails.title}</Text>

            <View style={styles.section}>
                <InfoRow label="Platform" value={gameDetails.platform} iconName="game-controller-outline" />
                <InfoRow label="Genre" value={gameDetails.genre} iconName="pricetags-outline" />
                <InfoRow label="Status" value={gameDetails.status} iconName="checkmark-circle-outline" />
            </View>

            {gameDetails.rating !== null && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Rating</Text>
                    <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Ionicons
                                key={index}
                                name={index < gameDetails.rating ? 'star' : 'star-outline'}
                                size={28}
                                color={colors.accent}
                                style={styles.starIcon}
                            />
                        ))}
                    </View>
                </View>
            )}

            {(formattedDateBeaten || formattedDateAdded) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dates</Text>
                    {formattedDateBeaten && formattedDateBeaten !== "Invalid Date" && (
                        <InfoRow label="Date Beaten" value={formattedDateBeaten} iconName="calendar-outline" />
                    )}
                    {formattedDateAdded && formattedDateAdded !== "Invalid Date" && (
                        <InfoRow label="Date Added" value={formattedDateAdded} iconName="time-outline" />
                    )}
                </View>
            )}


            {gameDetails.notes.trim() !== "" && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Notes</Text>
                    <Text style={styles.notesText}>{gameDetails.notes}</Text>
                </View>
            )}

            {gameIsCompletable && !isUpdating && (
                <View style={[styles.section, styles.sliderSection]}>
                    <Text style={styles.sliderLabel}>Mark as Completed Today?</Text>
                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderHintText}>Slide to confirm</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={sliderValue}
                            onValueChange={setSliderValue}
                            onSlidingComplete={(value) => {
                                if (value === 100) {
                                    handleCompleteGame();
                                } else {
                                    setSliderValue(0);
                                }
                            }}
                            minimumTrackTintColor={colors.secondary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.secondary}
                        />
                    </View>
                </View>
            )}
            {isUpdating && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text>Updating...</Text>
                </View>
            )}
            <Pressable onPress={handleDeleteGame} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete from library</Text>
            </Pressable>
        </ScrollView>
    );
}

const InfoRow = ({ label, value, iconName }) => (
    <View style={styles.infoRow}>
        {iconName && <Ionicons name={iconName} size={20} color="#555" style={styles.infoIcon} />}
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.backgroundMain,
    },
    container: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    gameTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: colors.backgroundPaper,
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        borderColor: colors.border,
        borderWidth: 1
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,

    },
    infoIcon: {
        marginRight: 8,
        color: colors.textSecondary,
    },
    infoLabel: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '500',
        marginRight: 5,
    },
    infoValue: {
        fontSize: 15,
        color: colors.textPrimary,
        flexShrink: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        marginRight: 2,
    },
    notesText: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginTop: 30,
    },
    sliderSection: {
        borderRadius: 8,
    },
    sliderLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    sliderContainer: {
        alignItems: 'stretch',
    },
    sliderHintText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOuterContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    gameImage: {
        width: 160,
        height: 284,
        borderRadius: 8,
        backgroundColor: colors.placeholder,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: 160,
        height: 284,
        borderRadius: 8,
        backgroundColor: colors.backgroundPaper,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: colors.placeholder,
        fontSize: 14,
    },
    deleteButton: {
        marginTop: 100,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.error,
    },
    deleteButtonText: {
        color: colors.textLight,
        fontSize: 20,
        fontWeight: '600',
    }
});