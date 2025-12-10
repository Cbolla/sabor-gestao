// Simple local authentication service using localStorage

const STORAGE_KEYS = {
    CURRENT_USER: 'sabor_current_user',
    CURRENT_ESTABLISHMENT: 'sabor_current_establishment',
    USERS: 'sabor_users'
};

// Simple password hashing (for demo purposes - in production use bcrypt or similar)
const hashPassword = (password) => {
    return btoa(password); // Base64 encoding (NOT secure for production!)
};

const verifyPassword = (password, hash) => {
    return btoa(password) === hash;
};

export const localAuthService = {
    /**
     * Register a new user
     */
    async register(email, password, displayName, establishmentName) {
        try {
            // Get existing users
            const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
            const users = usersJson ? JSON.parse(usersJson) : [];

            // Check if user already exists
            if (users.find(u => u.email === email)) {
                throw new Error('Email já cadastrado');
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                email,
                password: hashPassword(password),
                displayName,
                createdAt: new Date().toISOString()
            };

            // Create establishment
            const establishment = {
                id: Date.now() + 1,
                name: establishmentName || 'Meu Estabelecimento',
                ownerId: newUser.id,
                createdAt: new Date().toISOString()
            };

            newUser.establishmentId = establishment.id;

            // Save user
            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

            // Set current user and establishment
            const userWithoutPassword = { ...newUser };
            delete userWithoutPassword.password;

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            localStorage.setItem(STORAGE_KEYS.CURRENT_ESTABLISHMENT, JSON.stringify(establishment));

            return { user: userWithoutPassword, establishment };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
            const users = usersJson ? JSON.parse(usersJson) : [];

            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (!verifyPassword(password, user.password)) {
                throw new Error('Senha incorreta');
            }

            // Get establishment
            const establishment = {
                id: user.establishmentId,
                name: 'Meu Estabelecimento',
                ownerId: user.id
            };

            // Set current user and establishment
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            localStorage.setItem(STORAGE_KEYS.CURRENT_ESTABLISHMENT, JSON.stringify(establishment));

            return { user: userWithoutPassword, establishment };
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_ESTABLISHMENT);
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        try {
            const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    /**
     * Get current establishment
     */
    getCurrentEstablishment() {
        try {
            const estJson = localStorage.getItem(STORAGE_KEYS.CURRENT_ESTABLISHMENT);
            return estJson ? JSON.parse(estJson) : null;
        } catch (error) {
            console.error('Error getting current establishment:', error);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getCurrentUser();
    }
};

export default localAuthService;
