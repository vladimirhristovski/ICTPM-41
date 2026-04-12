import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import authService from '../services/authService';

const devSkipAuth = import.meta.env.VITE_DEV_SKIP_AUTH === 'true';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({username: '', email: '', password: '', confirm: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.register(form.username, form.email, form.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <div style={styles.heroBrand}>ICTPM-41</div>
                <p style={styles.heroLead}>
                    Create an account to store your credentials securely and reach the same monitoring tools as existing farm operators.
                </p>
                <ul style={styles.heroList}>
                    <li>One login for dashboard, fields, and alerts</li>
                    <li>Designed for teams tracking multiple regions and crops</li>
                    <li>After registration you can sign in from any supported browser</li>
                </ul>
                <p style={styles.heroFoot}>
                    Already registered? Use the link below the form to return to sign-in.
                </p>
            </div>
            <div style={styles.card}>
                <h2 style={styles.title}>Create account</h2>
                <p style={styles.subtitle}>Choose a username, email, and password</p>

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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
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
                    <input
                        style={styles.input}
                        type="password"
                        name="confirm"
                        placeholder="Confirm password"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={styles.link}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>

                {devSkipAuth && (
                    <>
                        <button
                            type="button"
                            style={styles.devButton}
                            onClick={() => navigate('/dashboard')}
                        >
                            Open dashboard without registering
                        </button>
                        <p style={styles.devHint}>
                            Dev mode skips the API. Turn it off in <code style={styles.code}>.env</code> for real accounts.
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
};