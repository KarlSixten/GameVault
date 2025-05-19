import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from '../../util/auth/firebaseConfig';

const getPermissions = async () => {
    const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions Required", "Camera permission is needed.");
            return false;
        }
    }
    const mediaLibraryPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions Required", "Media library permission is needed.");
            return false;
        }
    }
    return true;
};

export const pickImageLocal = async (sourceOption) => {
    const hasPermissions = await getPermissions();
    if (!hasPermissions) return null;

    let pickerResult;
    const imagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.7,
    };

    if (sourceOption === "camera") {
        pickerResult = await ImagePicker.launchCameraAsync(imagePickerOptions);
    } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
    }

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        console.log("Image picking was cancelled or no assets selected.");
        return null;
    }

    return pickerResult.assets[0].uri;
};

export const uploadImageFromUri = async (localUri) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated. Cannot upload image.");
    }
    if (!localUri) {
        throw new Error("No image URI provided for upload.");
    }

    try {
        const response = await fetch(localUri);
        const blob = await response.blob();

        const fileExtension = localUri.substring(localUri.lastIndexOf('.') + 1) || 'jpg';
        const imageName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
        const storagePath = `users/${userId}/gameImages/${imageName}`;
        const imageRef = ref(storage, storagePath);

        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        return { downloadURL, storagePath };
    } catch (error) {
        console.error("Error in uploadImageFromUri:", error);
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

export const chooseImageSourceAlert = (onLocalImageUriPicked) => {
    Alert.alert(
        "Select Image Source",
        "Where would you like to pick your image from?",
        [
            {
                text: "Camera",
                onPress: async () => {
                    const uri = await pickImageLocal("camera");
                    onLocalImageUriPicked(uri);
                }
            },
            {
                text: "Gallery",
                onPress: async () => {
                    const uri = await pickImageLocal("gallery");
                    onLocalImageUriPicked(uri);
                }
            },
            { text: "Cancel", style: "cancel", onPress: () => onLocalImageUriPicked(null) },
        ],
        { cancelable: true, onDismiss: () => onLocalImageUriPicked(null) }
    );
};