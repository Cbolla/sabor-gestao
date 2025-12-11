import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { where } from 'firebase/firestore'; // Import where
import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestore.service';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [establishment, setEstablishment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get establishment data for this user
                    // Assuming 1 user = 1 establishment for now (or stored in user profile)
                    // We need to find the establishment where ownerId == firebaseUser.uid
                    const establishments = await firestoreService.getDocuments('establishments', [
                        where('ownerId', '==', firebaseUser.uid)
                    ]);

                    let userEstablishment = establishments[0] || null;

                    // AUTO-FIX: If user exists but no establishment (e.g. error during signup), create one now.
                    if (!userEstablishment) {
                        console.log("Establishment missing. Auto-repairing account...");
                        const newEstData = {
                            name: firebaseUser.displayName || 'Meu Restaurante',
                            ownerId: firebaseUser.uid,
                            email: firebaseUser.email,
                            createdAt: new Date(),
                            settings: { currency: 'BRL', timezone: 'America/Sao_Paulo' }
                        };
                        const newEstId = await firestoreService.addDocument('establishments', newEstData);
                        userEstablishment = { id: newEstId, ...newEstData };
                    }

                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName
                    });
                    setEstablishment(userEstablishment);
                } catch (error) {
                    console.error("Error fetching establishment:", error);
                }
            } else {
                setUser(null);
                setEstablishment(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // State update handled by onAuthStateChanged
            return true;
        } catch (error) {
            console.error('Error signing in:', error);
            throw new Error(getErrorMessage(error.code));
        }
    };

    const signUp = async (email, password, displayName, establishmentName) => {
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile
            await updateProfile(user, { displayName });

            // 3. Create Establishment
            const establishmentData = {
                name: establishmentName,
                ownerId: user.uid,
                email: email,
                createdAt: new Date(),
                settings: {
                    currency: 'BRL',
                    timezone: 'America/Sao_Paulo'
                }
            };

            const establishmentId = await firestoreService.addDocument('establishments', establishmentData);

            // Force state update effectively handled by effect, but for immediate return:
            return {
                user: { ...user, displayName },
                establishment: { id: establishmentId, ...establishmentData }
            };

        } catch (error) {
            console.error('Error signing up:', error);
            throw new Error(getErrorMessage(error.code));
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Este email já está em uso.';
            case 'auth/invalid-email':
                return 'Email inválido.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email ou senha incorretos.';
            case 'auth/weak-password':
                return 'A senha deve ter pelo menos 6 caracteres.';
            default:
                return 'Ocorreu um erro. Tente novamente.';
        }
    };

    const value = {
        user,
        establishment,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        hasEstablishment: !!establishment,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

