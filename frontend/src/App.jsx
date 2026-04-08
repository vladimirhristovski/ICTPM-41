import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FieldsPage from './pages/FieldsPage';
import AlertsPage from './pages/AlertsPage';

function Dashboard() {
    return <h1 style={{padding: '2rem'}}>Dashboard — coming soon</h1>;
}

function Fields() {
    return <FieldsPage />;
}

function Alerts() {
    return <AlertsPage />;
}

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
                    <ProtectedRoute><Fields/></ProtectedRoute>
                }/>
                <Route path="/alerts" element={
                    <ProtectedRoute><Alerts/></ProtectedRoute>
                }/>

                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}
