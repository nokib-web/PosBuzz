import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/products/ProductListPage';
import CreateSalePage from './pages/sales/CreateSalePage';
import SaleHistoryPage from './pages/sales/SaleHistoryPage';

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 6,
                },
            }}
        >
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <div>Dashboard (Coming Soon)</div>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute>
                                    <ProductListPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/sales"
                            element={
                                <ProtectedRoute>
                                    <CreateSalePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/sales/history"
                            element={
                                <ProtectedRoute>
                                    <SaleHistoryPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;
