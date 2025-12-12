import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Main pages
import { DashboardPage } from '../pages/DashboardPage';
import { MenuPage } from '../pages/MenuPage';

// Lazy load other pages for better performance
const FinancePage = lazy(() => import('../pages/finance/FinancePage'));
const ExpenseListPage = lazy(() => import('../pages/finance/ExpenseListPage'));
const ExpenseDetailPage = lazy(() => import('../pages/finance/ExpenseDetailPage'));
const AddExpensePage = lazy(() => import('../pages/finance/AddExpensePage'));
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage'));
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage')); // Import added
const KitchenPage = lazy(() => import('../pages/kitchen/KitchenPage'));
const DeliveryPage = lazy(() => import('../pages/delivery/DeliveryPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
import { MigrationPage } from '../pages/MigrationPage'; // Not lazy for now

const LoadingFallback = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
    </div>
);

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />

                    {/* Finance routes */}
                    <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
                    <Route path="/finance/expenses" element={<ProtectedRoute><ExpenseListPage /></ProtectedRoute>} />
                    <Route path="/finance/expenses/:id" element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
                    <Route path="/finance/expenses/new" element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />

                    {/* Customers routes */}
                    <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />

                    {/* Products routes */}
                    <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />

                    {/* Orders routes */}
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

                    {/* Reports routes */}
                    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

                    {/* Kitchen routes */}
                    <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />

                    {/* Delivery routes */}
                    <Route path="/deliveries" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />

                    <Route path="/migration" element={<ProtectedRoute><MigrationPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                    {/* Catch all - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;
