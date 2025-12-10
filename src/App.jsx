import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import './assets/styles/global.css';
import './assets/styles/cards.css';
import './assets/styles/animations.css';

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
