import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLayoutEffect } from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LibraryScreen({ navigation }) {

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
            <Text>This is the library screen</Text>
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