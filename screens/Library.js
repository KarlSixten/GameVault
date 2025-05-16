import { View, Pressable, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useLayoutEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GameCard from '../components/GameCard';

export default function LibraryScreen({ navigation }) {
    const firestoreName = `users/${auth.currentUser.uid}/library`;
    const [library, loading, error] = useCollection(collection(db, firestoreName));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => navigation.navigate('AddGame')}
                    style={styles.headerButton}

                >
                    <Ionicons name="add-circle-outline" size={30} color="#007AFF" />
                </Pressable>
            ),
        });
    }, [navigation]);

    return (
        <View>
            <FlatList
                data={library?.docs}
                keyExtractor={(game) => game.id}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate("GameDetails", { game: { id: item.id, ...item.data() } })}>
                        <GameCard game={item.data()} />
                    </Pressable>
                )}
            />

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});