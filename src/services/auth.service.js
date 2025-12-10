import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
    /**
     * Register a new user and create their establishment
     */
    async register({ email, password, displayName, establishmentName, cnpj, phone }) {
        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: displayName,
            });

            // Create establishment document
            const establishmentRef = doc(db, 'establishments', user.uid);
            await setDoc(establishmentRef, {
                name: establishmentName,
                cnpj: cnpj || '',
                phone: phone || '',
                ownerId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Create user document
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                email: email,
                displayName: displayName,
                establishmentId: user.uid,
                role: 'owner',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            return {
                user,
                establishmentId: user.uid,
            };
        } catch (error) {
            console.error('Error registering user:', error.code, error.message);
            // Check for permission errors specifically
            if (error.code === 'permission-denied') {
                console.error('CRITICAL: Firestore permission denied. Check your security rules.');
            }
            throw error;
        }
    },

    /**
     * Sign in existing user
     */
    async signIn({ email, password }) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Update last login
            const userRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userRef, {
                lastLogin: serverTimestamp(),
            }, { merge: true });

            return userCredential.user;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    },

    /**
     * Get error message in Portuguese
     */
    getErrorMessage(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este e-mail já está em uso.',
            'auth/invalid-email': 'E-mail inválido.',
            'auth/operation-not-allowed': 'Operação não permitida.',
            'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
            'auth/user-disabled': 'Esta conta foi desativada.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/invalid-credential': 'Credenciais inválidas.',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        };

        return errorMessages[error.code] || 'Ocorreu um erro. Tente novamente.';
    },
};

export default authService;
