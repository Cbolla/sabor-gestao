import React, { createContext, useContext, useState, useEffect } from 'react';
import { localAuthService } from '../services/localAuth.service';

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
        // Check if user is already logged in
        const currentUser = localAuthService.getCurrentUser();
        const currentEstablishment = localAuthService.getCurrentEstablishment();

        if (currentUser) {
            setUser(currentUser);
            setEstablishment(currentEstablishment);
        }

        setLoading(false);
    }, []);

    const signIn = async (email, password) => {
        try {
            const { user: loggedUser, establishment: userEstablishment } = await localAuthService.login(email, password);
            setUser(loggedUser);
            setEstablishment(userEstablishment);
            return { user: loggedUser, establishment: userEstablishment };
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    };

    const signUp = async (email, password, displayName, establishmentName) => {
        try {
            const { user: newUser, establishment: newEstablishment } = await localAuthService.register(
                email,
                password,
                displayName,
                establishmentName
            );
            setUser(newUser);
            setEstablishment(newEstablishment);
            return { user: newUser, establishment: newEstablishment };
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await localAuthService.logout();
            setUser(null);
            setEstablishment(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
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
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

