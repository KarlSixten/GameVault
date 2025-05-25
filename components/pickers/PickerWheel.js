import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import colors from '../../theme/colors';

const PickerWheel = ({ values, selectedValue, onValueChange, enabled = true }) => {
    return (
        <View style={styles.pickerContainer}>
            <Picker
                values={values}
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                enabled={enabled}
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
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: colors.backgroundPaper,
    },
});

export default PickerWheel;