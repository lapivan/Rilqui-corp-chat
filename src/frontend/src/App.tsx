import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { signalRService } from './features/services/signalRService';
import { ChatPage } from './features/chats/pages/ChatPage';

function App() {
    const { token, user } = useAuthStore();

    useEffect(() => {
        if (token && user) {
            signalRService.init(token);
        }
    }, [token, user]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<ChatPage />} />
                </Route>
                {/* <Route path="/" element={<ChatPage />} /> */}

                {/* Catch all - Redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;