import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { BranchProvider } from './contexts/BranchContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductListPage from './pages/products/ProductListPage';
import CreateSalePage from './pages/sales/CreateSalePage';
import SaleHistoryPage from './pages/sales/SaleHistoryPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import SupplierListPage from './pages/suppliers/SupplierListPage';
import PromotionListPage from './pages/promotions/PromotionListPage';
import UserManagementPage from './pages/users/UserManagementPage';
import StoreOutletsPage from './pages/outlets/StoreOutletsPage';

// Protected Route Wrapper Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Ant Design Config Provider Wrapper for Live #d6d750 Lime Themeing
function AntdConfigWrapper({ children }: { children: React.ReactNode }) {
    const { isDark } = useTheme();

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#d6d750',
                    colorLink: '#85861b',
                    colorLinkHover: '#c2c438',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    borderRadius: 12,
                },
                components: {
                    Button: {
                        colorPrimary: '#d6d750',
                        algorithm: true,
                    },
                    Card: {
                        colorBgContainer: isDark ? '#141416' : '#ffffff',
                    },
                    Table: {
                        colorBgContainer: 'transparent',
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <CurrencyProvider>
                <BranchProvider>
                    <AntdConfigWrapper>
                        <AuthProvider>
                            <Router>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />

                                    {/* Protected Routes inside MainLayout */}
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout />
                                            </ProtectedRoute>
                                        }
                                    >
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/products" element={<ProductListPage />} />
                                        <Route path="/sales/new" element={<CreateSalePage />} />
                                        <Route path="/sales" element={<SaleHistoryPage />} />
                                        <Route path="/customers" element={<CustomerListPage />} />
                                        <Route path="/suppliers" element={<SupplierListPage />} />
                                        <Route path="/promotions" element={<PromotionListPage />} />
                                        <Route path="/users" element={<UserManagementPage />} />
                                        <Route path="/outlets" element={<StoreOutletsPage />} />

                                        {/* Default Fallback Redirect */}
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    </Route>
                                </Routes>
                            </Router>
                        </AuthProvider>
                    </AntdConfigWrapper>
                </BranchProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}

export default App;
