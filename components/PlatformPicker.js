import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const platforms = [
    { label: 'Select a Platform...', value: '' },
    { label: 'PC (Steam, Epic, etc.)', value: 'PC' },
    { label: 'PlayStation 5 (PS5)', value: 'PS5' },
    { label: 'Xbox Series X/S', value: 'Xbox Series X/S' },
    { label: 'Nintendo Switch', value: 'Nintendo Switch' },
    { label: 'iOS', value: 'iOS' },
    { label: 'Android', value: 'Android' },
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
                {platforms.map((platform) => (
                    <Picker.Item key={platform.value} label={platform.label} value={platform.value} />
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