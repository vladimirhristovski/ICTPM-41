import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FieldsPage from './pages/FieldsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                <Route path="/dashboard" element={
                    <ProtectedRoute><DashboardPage/></ProtectedRoute>
                }/>
                <Route path="/fields" element={
                    <ProtectedRoute><FieldsPage/></ProtectedRoute>
                }/>
                <Route path="/alerts" element={
                    <ProtectedRoute><AlertsPage/></ProtectedRoute>
                }/>
                <Route path="/profile" element={
                    <ProtectedRoute><ProfilePage/></ProtectedRoute>
                }/>

                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}