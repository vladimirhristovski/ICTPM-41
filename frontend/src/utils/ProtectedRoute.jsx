import {Navigate} from 'react-router-dom';
import authService from '../services/authService';

const devSkipAuth = import.meta.env.VITE_DEV_SKIP_AUTH === 'true';

export default function ProtectedRoute({children}) {
    if (!devSkipAuth && !authService.isLoggedIn()) {
        return <Navigate to="/login" replace/>;
    }
    return children;
}