import {useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import authService from '../services/authService';
import api from '../services/api';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = location.pathname.replace('/', '') || 'dashboard';

    const [showAlerts, setShowAlerts] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        api.get('/alerts/unread/count')
            .then(res => setAlertCount(res.data))
            .catch(() => {
            });
        api.get('/alerts/unread')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data.content || [];
                setAlerts(data);
            })
            .catch(() => {
            });
    }, [location.pathname]);

    const handleLogout = () => authService.logout();

    const navBtn = (page) => ({
        background: currentPage === page.toLowerCase() ? '#1e293b' : 'transparent',
        border: 'none',
        color: currentPage === page.toLowerCase() ? '#ffffff' : '#94a3b8',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.875rem',
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
            <div style={{display: 'flex', alignItems: 'center', gap: '2.5rem'}}>
                <span style={{fontWeight: '800', fontSize: '1.2rem', color: '#60a5fa', letterSpacing: '-0.025em'}}>
                    ICTPM-41
                </span>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    {['Dashboard', 'Fields', 'Alerts'].map((item) => (
                        <button key={item} type="button" onClick={() => navigate('/' + item.toLowerCase())}
                                style={navBtn(item)}>
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative'}}>
                {/* Bell */}
                <div style={{position: 'relative'}}>
                    <button
                        type="button"
                        onClick={() => setShowAlerts(!showAlerts)}
                        style={{
                            background: '#1e293b', border: '1px solid #334155',
                            color: '#f8fafc', cursor: 'pointer',
                            padding: '7px 10px', borderRadius: '8px',
                            fontSize: '1rem', display: 'flex', alignItems: 'center',
                        }}
                    >
                        🔔
                        {alertCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#ef4444', color: 'white', borderRadius: '50%',
                                width: '18px', height: '18px', fontSize: '0.65rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, border: '2px solid #0f172a'
                            }}>{alertCount}</span>
                        )}
                    </button>
                    {showAlerts && (
                        <div style={{
                            position: 'absolute', right: 0, top: '3.2rem', width: '320px',
                            background: '#ffffff', border: '1px solid #e2e8f0',
                            borderRadius: '12px', zIndex: 100, padding: '1rem',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{fontWeight: 800, marginBottom: '1rem', color: '#0f172a', fontSize: '0.9rem'}}>
                                Active Alerts
                            </div>
                            {alerts.length === 0 && (
                                <div style={{
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    textAlign: 'center',
                                    padding: '1rem 0'
                                }}>
                                    No unread alerts
                                </div>
                            )}
                            {alerts.map(a => (
                                <div key={a.id} style={{
                                    background: '#f8fafc', borderRadius: '8px', padding: '0.75rem',
                                    marginBottom: '0.75rem', fontSize: '0.8rem', color: '#334155',
                                    borderLeft: `4px solid ${a.riskLevel === 'EXTREME' || a.riskLevel === 'HIGH' ? '#ef4444' : '#f97316'}`,
                                }}>
                                    {a.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account */}
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    style={{
                        background: currentPage === 'profile' ? '#1e293b' : 'transparent',
                        border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer',
                        padding: '7px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem',
                    }}
                >
                    Account
                </button>

                {/* Logout */}
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        background: 'transparent', border: '1px solid #334155',
                        color: '#94a3b8', cursor: 'pointer', padding: '7px 14px',
                        borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem',
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}