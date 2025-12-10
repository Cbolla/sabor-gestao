import Dexie from 'dexie';

// Initialize Dexie database
class SaborGestaoDatabase extends Dexie {
    constructor() {
        super('SaborGestaoDB');

        this.version(1).stores({
            users: '++id, email, establishmentId',
            establishments: '++id, ownerId',
            customers: '++id, establishmentId, name, createdAt',
            products: '++id, establishmentId, name, category, createdAt',
            orders: '++id, establishmentId, orderNumber, status, createdAt'
        });
    }
}

const db = new SaborGestaoDatabase();

export const dbService = {
    /**
     * Get a single document by ID
     */
    async getDocument(tableName, documentId) {
        try {
            const doc = await db.table(tableName).get(documentId);
            return doc || null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    },

    /**
     * Get all documents from a table with optional filters
     */
    async getDocuments(tableName, filters = {}) {
        try {
            let collection = db.table(tableName);

            // Apply filters
            if (filters.where) {
                collection = collection.where(filters.where.field).equals(filters.where.value);
            }

            // Apply sorting
            if (filters.orderBy) {
                collection = collection.orderBy(filters.orderBy.field);
                if (filters.orderBy.direction === 'desc') {
                    collection = collection.reverse();
                }
            }

            const results = await collection.toArray();
            return results;
        } catch (error) {
            console.error('Error getting documents:', error);
            throw error;
        }
    },

    /**
     * Get paginated documents
     */
    async getPaginatedDocuments(tableName, filters = {}, offset = 0, limit = 20) {
        try {
            let results = [];

            // Get filtered data
            if (filters.where) {
                results = await db.table(tableName)
                    .where(filters.where.field)
                    .equals(filters.where.value)
                    .toArray();
            } else {
                results = await db.table(tableName).toArray();
            }

            // Apply sorting in memory
            if (filters.orderBy) {
                const field = filters.orderBy.field;
                const direction = filters.orderBy.direction || 'asc';

                results.sort((a, b) => {
                    const aVal = a[field];
                    const bVal = b[field];

                    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            // Get total count
            const total = results.length;

            // Apply pagination
            const paginatedResults = results.slice(offset, offset + limit);

            return {
                data: paginatedResults,
                offset: offset + paginatedResults.length,
                hasMore: offset + paginatedResults.length < total
            };
        } catch (error) {
            console.error('Error getting paginated documents:', error);
            throw error;
        }
    },

    /**
     * Add a new document
     */
    async addDocument(tableName, data) {
        try {
            const id = await db.table(tableName).add({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    },

    /**
     * Update a document
     */
    async updateDocument(tableName, documentId, data) {
        try {
            await db.table(tableName).update(documentId, {
                ...data,
                updatedAt: new Date()
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
    async deleteDocument(tableName, documentId) {
        try {
            await db.table(tableName).delete(documentId);
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    },

    /**
     * Search documents (simple text search)
     */
    async searchDocuments(tableName, searchField, searchTerm, filters = {}) {
        try {
            let collection = db.table(tableName);

            // Apply establishment filter if provided
            if (filters.where) {
                collection = collection.where(filters.where.field).equals(filters.where.value);
            }

            const results = await collection.toArray();

            // Client-side filtering for search
            if (searchTerm) {
                const filtered = results.filter(item =>
                    item[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return filtered;
            }

            return results;
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    },

    /**
     * Clear all data from a table
     */
    async clearTable(tableName) {
        try {
            await db.table(tableName).clear();
            return true;
        } catch (error) {
            console.error('Error clearing table:', error);
            throw error;
        }
    },

    /**
     * Get database instance (for advanced queries)
     */
    getDB() {
        return db;
    }
};

export default dbService;
