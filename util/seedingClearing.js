import { Alert } from 'react-native';
import { db, storage } from './auth/firebaseConfig';
import { collection, doc, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';



export async function seedLibrary(user) {
    const sampleGames = [
        {
            title: "The Legend of Zelda: Breath of the Wild",
            platform: "Nintendo Switch",
            genre: "Adventure",
            status: "Completed",
            rating: 5,
            dateBeaten: Timestamp.fromDate(new Date(2020, 4, 15)),
            notes: "Amazing open-world experience!",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Cyberpunk 2077",
            platform: "PC",
            genre: "RPG",
            status: "Playing",
            rating: 4,
            dateBeaten: null,
            notes: "Night City is vast and immersive. Some bugs but compelling story.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Stardew Valley",
            platform: "PC",
            genre: "Simulation",
            status: "On Hold",
            rating: 5,
            dateBeaten: null,
            notes: "Relaxing and addictive farming sim.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/f/fd/Logo_of_Stardew_Valley.png",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Elden Ring",
            platform: "PS5",
            genre: "RPG",
            status: "Not Started",
            rating: null,
            dateBeaten: null,
            notes: "Heard great things, excited to start.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Forza Horizon 5",
            platform: "Xbox Series X/S",
            genre: "Sports",
            status: "Playing",
            rating: 5,
            dateBeaten: null,
            notes: "Stunning visuals and fun arcade racing in Mexico.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/86/Forza_Horizon_5_cover_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Hades",
            platform: "PC",
            genre: "Action", // Action RPG / Roguelike
            status: "Completed",
            rating: 5,
            dateBeaten: Timestamp.fromDate(new Date(2022, 0, 10)), // Jan 10th, 2022
            notes: "Incredible story, gameplay, and art style. Masterpiece.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Hades_cover_art.jpg/220px-Hades_cover_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Among Us",
            platform: "iOS",
            genre: "Puzzle",
            status: "Dropped",
            rating: 3,
            dateBeaten: null,
            notes: "Fun with friends for a while, but moved on.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Civilization VI",
            platform: "PC",
            genre: "Strategy",
            status: "On Hold",
            rating: 4,
            dateBeaten: null,
            notes: "One more turn... always. Will get back to my Roman empire.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Civilization_VI_cover_art.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Call of Duty: Mobile",
            platform: "Android", // New platform
            genre: "Shooter", // New genre
            status: "Playing",
            rating: 4,
            dateBeaten: null,
            notes: "Good for quick matches on the go.",
            imageUrl: null,
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        },
        {
            title: "Portal 2",
            platform: "PC",
            genre: "Puzzle",
            status: "100%",
            rating: 5,
            dateBeaten: Timestamp.fromDate(new Date(2019, 5, 1)), // June 1st, 2019
            notes: "A true classic. Thinking with portals never gets old. Co-op is fantastic too.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg",
            imagePath: null,
            createdAt: Timestamp.now(),
            userId: user.uid,
        }
    ];

    try {
        const libraryRef = collection(db, 'users', user.uid, 'library');
        const batch = writeBatch(db);

        sampleGames.forEach(game => {
            const newGameRef = doc(libraryRef);
            batch.set(newGameRef, game);
        });

        await batch.commit();
        Alert.alert("Library Seeded!", `${sampleGames.length} games have been added to your library.`);
    } catch (error) {
        Alert.alert("Seeding Failed", "Could not add sample games to the library. " + error.message);
    }
}

export async function clearLibrary(user) {
    if (!user) {
        Alert.alert("Not Logged In", "You need to be logged in to clear the library.");
        return;
    }

    Alert.alert(
        "Confirm Clear Library",
        "Are you sure you want to delete ALL games from your library? This action cannot be undone and will also delete associated images.",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear Library",
                style: "destructive",
                onPress: async () => {
                    try {
                        const libraryColRef = collection(db, 'users', user.uid, 'library');
                        const querySnapshot = await getDocs(libraryColRef);

                        if (querySnapshot.empty) {
                            Alert.alert("Library Empty", "There are no games in your library to clear.");
                            return;
                        }

                        const batch = writeBatch(db);
                        let imageDeletePromises = [];

                        querySnapshot.forEach((docSnapshot) => {
                            const gameData = docSnapshot.data();
                            if (gameData.imagePath) {
                                const imageFileRef = ref(storage, gameData.imagePath);
                                imageDeletePromises.push(
                                    deleteObject(imageFileRef).catch(error => {
                                        console.warn(`Failed to delete image ${gameData.imagePath}:`, error);
                                    })
                                );
                            }
                            batch.delete(docSnapshot.ref);
                        });

                        await Promise.all(imageDeletePromises);
                        await batch.commit();

                        Alert.alert("Library Cleared", "All games have been removed from your library.");
                    } catch (error) {
                        Alert.alert("Clearing Failed", "Could not clear the library. " + error.message);
                    }
                }
            }
        ]
    );
}
