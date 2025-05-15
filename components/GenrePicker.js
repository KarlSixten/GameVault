import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const genres = [
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

const PlatformPicker = ({ selectedValue, onValueChange, enabled = true }) => {
    return (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                enabled={enabled}
                style={styles.picker}
                itemStyle={styles.pickerItem}
            >
                {genres.map((genre) => (
                    <Picker.Item key={genre.value} label={genre.label} value={genre.value} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    pickerContainer: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        color: '#333'
    }
});

export default PlatformPicker;