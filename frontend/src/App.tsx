import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
                        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
                        <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />

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
                                    <div>Products Page (Coming Soon)</div>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/sales"
                            element={
                                <ProtectedRoute>
                                    <div>Sales Page (Coming Soon)</div>
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
