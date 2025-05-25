import { StyleSheet } from "react-native";
import colors from "./colors";

export default StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: colors.backgroundMain,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        marginTop: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    input: {
        backgroundColor: colors.backgroundPaper,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        borderRadius: 8,
        marginBottom: 15,
        color: colors.textPrimary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 8,
    },
    pickerTriggerText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    placeholderTextPicker: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    starsRow: {
        flexDirection: 'row',
    },
    starDisplay: {
        marginRight: 2,
    },
    imagePreview: {
        width: '50%',
        aspectRatio: 9 / 16,
        alignSelf: 'center',
        marginBottom: 10,
        backgroundColor: colors.placeholder,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    submitButtonContainer: {
        marginTop: 30,
        marginBottom: 20,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: colors.primary + '99',
    }
});