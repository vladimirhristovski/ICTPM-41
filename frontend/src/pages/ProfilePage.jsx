import Navbar from '../components/Navbar';
import authService from '../services/authService';

export default function ProfilePage() {
    const user = authService.getUser();

    const rowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.85rem 0',
        borderBottom: '1px solid #f1f5f9',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <h1 style={{ margin: '0 0 2rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                    Account Settings
                </h1>

                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        Account Info
                    </h2>

                    <div style={rowStyle}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Username</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{user?.username ?? '—'}</span>
                    </div>
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Role</span>
                        <span style={{
                            padding: '3px 12px', borderRadius: '999px',
                            background: '#eff6ff', color: '#2563eb',
                            fontSize: '0.8rem', fontWeight: 700,
                        }}>{user?.role ?? 'USER'}</span>
                    </div>
                </div>

                <div style={{
                    background: '#fff5f5',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    border: '1px solid #fecaca',
                }}>
                    <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#b91c1c' }}>
                        Sign Out
                    </h2>
                    <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        You will be redirected to the login page.
                    </p>
                    <button
                        type="button"
                        onClick={() => authService.logout()}
                        style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}