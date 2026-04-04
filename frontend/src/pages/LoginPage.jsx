import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import authService from '../services/authService';

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
            <div style={styles.card}>
                <h2 style={styles.title}>ICTPM-41</h2>
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
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
    },
    card: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '400px',
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