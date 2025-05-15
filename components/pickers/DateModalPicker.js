import DateTimePickerModal from "react-native-modal-datetime-picker";

const DateModalPicker = ({ isVisible, currentDate, onDateSelected, onCloseModal, maximumDate }) => {
    
    const handleConfirm = (selectedDate) => {
        if (selectedDate) {
            const normalizedDate = new Date(selectedDate);
            normalizedDate.setHours(0, 0, 0, 0);
            onDateSelected(normalizedDate);
        }
        onCloseModal();
    };

    const handleCancel = () => {
        onCloseModal();
    };

    return (
        <DateTimePickerModal
            isVisible={isVisible}
            mode="date"
            date={currentDate || new Date()}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            maximumDate={maximumDate || new Date()}
        />
    );
};

export default DateModalPicker;