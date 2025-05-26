# GameVault 🎮

GameVault is a mobile application built with React Native (Expo) designed to help users manage their personal video game library and wishlist. Track games you're playing, have completed, or want to play, complete with details like ratings, completion dates, personal notes, and custom cover images. The app also integrates with the RAWG Video Games Database API to allow users to search for new games and add them to their wishlist.

This project was developed as an exam project for mobile development with React Native.

## ✨ Features

* **User Authentication**: Secure login and sign-up functionality using Firebase Authentication.
* **Game Library Management**:
    * Add games with detailed information: title, platform, genre, status (e.g., Playing, Completed, On Hold), star rating, date beaten, personal notes, and a custom cover image.
    * View a list of all games in your library.
    * See detailed information for each game.
    * Edit existing game details.
    * Delete games from your library (this also removes the associated cover image from Firebase Storage).
    * Quickly mark completable games as "Completed" with today's date.
* **Wishlist Functionality**:
    * Search for games via the RAWG API.
    * Add games discovered through search to your personal wishlist.
    * View your wishlisted games.
    * Swipe gestures to move a game from the wishlist to your main library or delete it.
* **Custom Image Uploads**:
    * Pick images from the device's camera or gallery for game covers.
    * Upload selected images to Firebase Storage.
* **Developer Tools**:
    * Seed the library with sample game data.
    * Clear all games from the library (including stored images).
* **Themed Interface**: Consistent styling using a predefined color palette.

## 🛠️ Tech Stack

* **Framework**: React Native (with Expo)
* **Language**: JavaScript
* **Backend & Database**: Firebase
    * Firebase Authentication (for user management)
    * Firestore (as the primary database for game data)
    * Firebase Storage (for user-uploaded cover images)
* **Navigation**: React Navigation (Bottom Tab Navigator and Native Stack Navigator)
* **External API**: [RAWG Video Games Database API](https://rawg.io/apidocs) (for game searching)
* **Key Libraries**:
    * `@react-native-picker/picker` (for selections)
    * `expo-image-picker` (for accessing camera and gallery)
    * `react-native-modal-datetime-picker` (for date selection)
    * `react-native-swipe-list-view` (for swipeable list items in wishlist)
    * `react-firebase-hooks` (for real-time Firestore updates in lists)
    * `react-native-vector-icons/Ionicons` (for icons)
    * `@react-native-community/slider` (for the "Mark as Completed" slider)
    * `lodash` (used for debouncing search input)

## ⚙️ Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/karlsixten/GameVault.git](https://github.com/karlsixten/GameVault.git)
    cd GameVault
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # OR
    yarn install
    ```
3.  **Set up Firebase**:
    * Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    * Enable **Authentication** (Email/Password sign-in method).
    * Set up **Firestore** database.
    * Set up **Firebase Storage**.
    * Obtain your Firebase project configuration (API key, auth domain, etc.).
    * Create a file `gamevault/util/auth/firebaseConfig.js` and populate it with your Firebase configuration. A template might look like this:
        ```javascript
        // gamevault/util/auth/firebaseConfig.js
        import { initializeApp } from "firebase/app";
        import { getAuth } //, initializeAuth, getReactNativePersistence 
        from "firebase/auth";
        import { getFirestore } from "firebase/firestore";
        import { getStorage } from "firebase/storage";
        // import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // If needed for auth persistence

        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        const app = initializeApp(firebaseConfig);

        // For React Native, if you want persistent auth state:
        // const auth = initializeAuth(app, {
        //  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        // });
        // Otherwise, for simpler setup during dev:
        const auth = getAuth(app);

        const db = getFirestore(app);
        const storage = getStorage(app);

        export { auth, db, storage, app };
        ```
        *Note: For persistent login, you might need to configure `initializeAuth` with `getReactNativePersistence` and `@react-native-async-storage/async-storage`.*

4.  **Set up RAWG API Key**:
    * Sign up at [RAWG API](https://rawg.io/apidocs) to get an API key.
    * Create a file `gamevault/util/auth/rawgioAuth.js` (this file is mentioned in `.gitignore` if you create one).
    * Add your API key to this file:
        ```javascript
        // gamevault/util/auth/rawgioAuth.js
        export const API_KEY = "YOUR_RAWG_API_KEY";
        ```
        *(Ensure this file is in your `.gitignore` if you're pushing to a public repository!)*

5.  **Run the application**:
    ```bash
    npx expo start
    ```
    Then, scan the QR code with the Expo Go app on your iOS or Android device, or run on an emulator/simulator.
