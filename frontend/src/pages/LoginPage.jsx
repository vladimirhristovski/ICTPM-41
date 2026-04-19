import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import authService from '../services/authService';

const devSkipAuth = import.meta.env.VITE_DEV_SKIP_AUTH === 'true';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({username: '', password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.login(form.username, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <div style={styles.heroBrand}>ICTPM-41</div>
                <p style={styles.heroLead}>
                    Agricultural intelligence for weather, soil moisture outlook, and fire-risk monitoring across your parcels.
                </p>
                <ul style={styles.heroList}>
                    <li>Seven-day rain and probability views on the dashboard</li>
                    <li>Per-field risk cards with crop and regional context</li>
                    <li>Central alerts for HIGH, EXTREME, and forecast-driven events</li>
                </ul>
                <p style={styles.heroFoot}>
                    Sign in to access the protected dashboard, fields registry, and alerts center.
                </p>
            </div>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome back</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p style={styles.link}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>

                {devSkipAuth && (
                    <>
                        <button
                            type="button"
                            style={styles.devButton}
                            onClick={() => navigate('/dashboard')}
                        >
                            Open dashboard without signing in
                        </button>
                        <p style={styles.devHint}>
                            Dev mode: the UI works with mock data. Set <code style={styles.code}>VITE_DEV_SKIP_AUTH=false</code> in{' '}
                            <code style={styles.code}>.env</code> when your API on port 8080 is running.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexWrap: 'wrap',
        backgroundColor: '#f0f4f8',
        gap: '2rem',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
    },
    hero: {
        flex: '1 1 320px',
        maxWidth: '440px',
        alignSelf: 'center',
        padding: '1rem 0.5rem 1rem 0',
    },
    heroBrand: {
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.03em',
        marginBottom: '0.75rem',
    },
    heroLead: {
        margin: '0 0 1.25rem',
        color: '#475569',
        fontSize: '1.05rem',
        lineHeight: 1.6,
    },
    heroList: {
        margin: '0 0 1.25rem',
        paddingLeft: '1.25rem',
        color: '#334155',
        fontSize: '0.95rem',
        lineHeight: 1.75,
    },
    heroFoot: {
        margin: 0,
        fontSize: '0.88rem',
        color: '#64748b',
        lineHeight: 1.55,
    },
    card: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '400px',
        alignSelf: 'center',
        flex: '0 1 400px',
    },
    title: {
        margin: '0 0 0.25rem',
        fontSize: '1.5rem',
        color: '#1a202c',
        textAlign: 'center',
    },
    subtitle: {
        margin: '0 0 1.5rem',
        color: '#718096',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    input: {
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '0.95rem',
        outline: 'none',
    },
    button: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: '#fff',
        fontSize: '0.95rem',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    error: {
        color: '#e53e3e',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    link: {
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#718096',
    },
    devButton: {
        width: '100%',
        marginTop: '1rem',
        padding: '0.65rem',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    devHint: {
        marginTop: '0.75rem',
        fontSize: '0.75rem',
        color: '#64748b',
        lineHeight: 1.5,
        textAlign: 'center',
    },
    code: {
        fontSize: '0.7rem',
        backgroundColor: '#e2e8f0',
        padding: '2px 6px',
        borderRadius: '4px',
    },
};