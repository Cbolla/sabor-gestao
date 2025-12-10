import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

const layoutStyles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
    },
    main: {
        flex: 1,
        paddingBottom: '80px', // Space for bottom nav
        overflowY: 'auto',
    },
};

export const AppLayout = ({ children, title }) => {
    return (
        <div style={layoutStyles.container}>
            <Header title={title} />
            <main style={layoutStyles.main}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default AppLayout;
