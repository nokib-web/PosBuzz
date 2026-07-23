import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#d6d750',
                    colorLink: '#85861b',
                    borderRadius: 12,
                    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    colorBgLayout: '#ffffff',
                    colorBgContainer: '#ffffff',
                    colorText: '#09090b',
                    colorTextHeading: '#09090b',
                },
                components: {
                    Card: {
                        borderRadiusLG: 16,
                    },
                    Button: {
                        fontWeight: 700,
                        borderRadius: 10,
                        colorPrimaryText: '#09090b',
                    },
                    Table: {
                        borderRadius: 12,
                    },
                },
            }}
        >
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

                            {/* Redirect root to dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;
