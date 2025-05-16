import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PickerWheel = ({ values, selectedValue, onValueChange, enabled = true }) => {
    return (
        <View style={styles.pickerContainer}>
            <Picker
                values={values}
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                enabled={enabled}
                style={styles.picker}
                itemStyle={styles.pickerItem}
            >
                {values.map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
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

export default PickerWheel;