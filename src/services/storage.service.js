import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
    /**
     * Upload a file to Firebase Storage
     */
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return {
                url: downloadURL,
                path: snapshot.ref.fullPath,
                name: file.name,
                size: file.size,
                type: file.type,
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Upload payment proof
     */
    async uploadPaymentProof(file, establishmentId, expenseId, installmentId) {
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `payment_proof_${timestamp}.${extension}`;
        const path = `establishments/${establishmentId}/expenses/${expenseId}/installments/${installmentId}/${fileName}`;

        return await this.uploadFile(file, path);
    },

    /**
     * Upload product image
     */
    async uploadProductImage(file, establishmentId, productId) {
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `product_${timestamp}.${extension}`;
        const path = `establishments/${establishmentId}/products/${productId}/${fileName}`;

        return await this.uploadFile(file, path);
    },

    /**
     * Delete a file from Firebase Storage
     */
    async deleteFile(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    /**
     * Get download URL for a file
     */
    async getFileURL(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (error) {
            console.error('Error getting file URL:', error);
            throw error;
        }
    },
};

export default storageService;
