import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    startAfter,
    startAt, // Added startAt for potential use cases
    endBefore, // Added endBefore for potential use cases
} from 'firebase/firestore';
import { db } from './firebase';

export const firestoreService = {
    /**
     * Get a single document
     */
    async getDocument(collectionPath, documentId) {
        try {
            const docRef = doc(db, collectionPath, documentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    },

    /**
     * Get all documents from a collection
     */
    async getDocuments(collectionPath, constraints = []) {
        try {
            const collectionRef = collection(db, collectionPath);
            const q = constraints.length > 0
                ? query(collectionRef, ...constraints)
                : collectionRef;

            const querySnapshot = await getDocs(q);
            const documents = [];

            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            return documents;
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    },

    /**
     * Get paginated documents from a collection
     */
    async getPaginatedDocuments(collectionPath, constraints = [], lastDoc = null, itemsPerPage = 20) {
        try {
            const collectionRef = collection(db, collectionPath);
            let qConstraints = [...constraints];

            // Limit first, then startAfter if we have a cursor
            qConstraints.push(limit(itemsPerPage));

            if (lastDoc) {
                qConstraints.push(startAfter(lastDoc));
            }

            const q = query(collectionRef, ...qConstraints);
            const querySnapshot = await getDocs(q);

            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data(),
                    _doc: doc // Keep reference to the doc snapshot for next pagination cursor
                });
            });

            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            return {
                data: documents,
                lastDoc: lastVisible,
                hasMore: querySnapshot.docs.length === itemsPerPage
            };
        } catch (error) {
            console.error('Error getting paginated documents:', error);
            throw error;
        }
    },

    /**
     * Add a new document
     */
    async addDocument(collectionPath, data) {
        try {
            const collectionRef = collection(db, collectionPath);
            const docRef = await addDoc(collectionRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return docRef.id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    },

    /**
     * Set a document (create or overwrite)
     */
    async setDocument(collectionPath, documentId, data) {
        try {
            const docRef = doc(db, collectionPath, documentId);
            await setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });

            return documentId;
        } catch (error) {
            console.error('Error setting document:', error);
            throw error;
        }
    },

    /**
     * Update a document
     */
    async updateDocument(collectionPath, documentId, data) {
        try {
            const docRef = doc(db, collectionPath, documentId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });

            return documentId;
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    },

    /**
     * Delete a document
     */
    async deleteDocument(collectionPath, documentId) {
        try {
            const docRef = doc(db, collectionPath, documentId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    },

    /**
     * Listen to a single document in real-time
     */
    subscribeToDocument(collectionPath, documentId, callback) {
        const docRef = doc(db, collectionPath, documentId);

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({
                    id: docSnap.id,
                    ...docSnap.data(),
                });
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Error in document subscription:', error);
        });
    },

    /**
     * Listen to a collection in real-time
     */
    subscribeToCollection(collectionPath, constraints = [], callback) {
        const collectionRef = collection(db, collectionPath);
        const q = constraints.length > 0
            ? query(collectionRef, ...constraints)
            : collectionRef;

        return onSnapshot(q, (querySnapshot) => {
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            callback(documents);
        }, (error) => {
            console.error('Error in collection subscription:', error);
        });
    },

    /**
     * Convert Firestore Timestamp to Date
     */
    timestampToDate(timestamp) {
        if (!timestamp) return null;
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate();
        }
        if (typeof timestamp === 'string') {
            return new Date(timestamp);
        }
        return timestamp;
    },

    /**
     * Get server timestamp
     */
    getServerTimestamp() {
        return serverTimestamp();
    },
};

export default firestoreService;
