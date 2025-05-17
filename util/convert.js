export function formatDateForDisplay(date) {
    if (!date) {
        return "DD-MM-YYYY";
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

export function convertFirestoreTimestampToJSDate(timestamp) {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }
    return null;
};