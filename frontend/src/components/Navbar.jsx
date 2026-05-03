import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = location.pathname.replace('/', '') || 'dashboard';

    const handleLogout = () => {
        authService.logout();
    };

    const navBtn = (page) => ({
        background: currentPage === page.toLowerCase() ? '#1e293b' : 'transparent',
        border: 'none',
        color: currentPage === page.toLowerCase() ? '#ffffff' : '#94a3b8',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'background 0.2s ease, color 0.2s ease',
    });

    return (
        <div style={{
            background: '#0f172a',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#60a5fa', letterSpacing: '-0.025em' }}>
                    ICTPM-41
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Dashboard', 'Fields', 'Alerts'].map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => navigate('/' + item.toLowerCase())}
                            style={navBtn(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    style={{
                        background: currentPage === 'profile' ? '#1e293b' : 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'background 0.2s ease, color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1e293b';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentPage === 'profile' ? '#1e293b' : 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    Account
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'background 0.2s ease, color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.borderColor = '#334155';
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}