import {memo, useCallback, useEffect, useState} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const SEVERITY_BADGE = {
    EXTREME: {bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', accent: '#ef4444'},
    HIGH: {bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', accent: '#f97316'},
    INFO: {bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', accent: '#3b82f6'},
};

function toSeverity(riskLevel) {
    if (riskLevel === 'EXTREME') return 'EXTREME';
    if (riskLevel === 'HIGH') return 'HIGH';
    return 'INFO';
}

const AlertCard = memo(function AlertCard({alert, onMarkRead}) {
    const sev = SEVERITY_BADGE[toSeverity(alert.riskLevel)] ?? SEVERITY_BADGE.INFO;
    const isRead = alert.read;

    return (
        <article
            style={{
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '1rem',
                padding: '1.25rem 1.5rem 1.25rem 1.35rem',
                borderRadius: '12px',
                border: `1px solid ${isRead ? '#e2e8f0' : sev.border}`,
                background: isRead ? '#ffffff' : '#fafbff',
                boxShadow: isRead
                    ? '0 1px 2px rgba(15, 23, 42, 0.06)'
                    : '0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            }}
        >
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: '4px',
                    background: sev.accent,
                    opacity: isRead ? 0.35 : 1,
                }}
            />

            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: '0.75rem 1rem', marginBottom: '0.65rem',
            }}>
                <h2 style={{
                    margin: 0, fontSize: '1.125rem', fontWeight: 700,
                    letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.3, flex: '1 1 12rem',
                }}>
                    {alert.alertType === 'FIRE_RISK' ? 'Fire Risk Alert' : alert.alertType}
                </h2>

                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center'}}>
                    <span style={{
                        padding: '0.2rem 0.65rem', borderRadius: '999px',
                        background: sev.bg, color: sev.text, border: `1px solid ${sev.border}`,
                        fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.06em',
                    }}>
                        {alert.riskLevel ?? 'INFO'}
                    </span>
                    <span style={{
                        padding: '0.2rem 0.65rem', borderRadius: '999px',
                        background: isRead ? '#f1f5f9' : '#e0e7ff',
                        color: isRead ? '#64748b' : '#4338ca',
                        border: `1px solid ${isRead ? '#e2e8f0' : '#c7d2fe'}`,
                        fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
                    }}>
                        {isRead ? 'Read' : 'Unread'}
                    </span>
                </div>
            </div>

            <p style={{
                margin: '0 0 1rem', color: '#64748b',
                fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: '62rem',
            }}>
                {alert.message}
            </p>

            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                gap: '0.5rem 1.25rem', marginBottom: '1rem',
                fontSize: '0.8125rem', color: '#475569',
            }}>
                <span style={{fontWeight: 600, color: '#334155'}}>
                    Field: <span style={{fontWeight: 500, color: '#64748b'}}>{alert.fieldName}</span>
                </span>
                <span style={{color: '#cbd5e1', userSelect: 'none'}}>|</span>
                <time style={{color: '#64748b', fontWeight: 500}}>
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ''}
                </time>
            </div>

            <button
                type="button"
                onClick={() => onMarkRead(alert.id)}
                disabled={alert.read}
                style={{
                    padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
                    borderRadius: '8px',
                    border: isRead ? '1px solid #e2e8f0' : '1px solid #334155',
                    background: isRead ? '#f8fafc' : '#0f172a',
                    color: isRead ? '#94a3b8' : '#f8fafc',
                    cursor: isRead ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                }}
            >
                {isRead ? 'Already read' : 'Mark as read'}
            </button>
        </article>
    );
});

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/alerts')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data.content || [];
                setAlerts(data);
            })
            .catch(() => setError('Failed to load alerts.'))
            .finally(() => setLoading(false));
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.put(`/alerts/${id}/read`);
            setAlerts(prev =>
                prev.map(a => a.id === id ? {...a, read: true} : a)
            );
        } catch {
            alert('Could not mark alert as read. Please try again.');
        }
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>
            <Navbar/>

            <div style={{padding: '2.5rem clamp(1.25rem, 4vw, 4rem)', maxWidth: '920px'}}>
                <header style={{marginBottom: '1.75rem'}}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        color: '#0f172a'
                    }}>
                        Alerts Center
                    </h1>
                </header>

                {loading && <p style={{color: '#64748b'}}>Loading alerts…</p>}
                {error && <p style={{color: '#ef4444'}}>{error}</p>}

                {!loading && !error && alerts.length === 0 && (
                    <p style={{color: '#64748b', fontSize: '0.95rem'}}>No alerts yet. You'll see fire-risk alerts here
                        when they are generated.</p>
                )}

                <div role="list" style={{display: 'flex', flexDirection: 'column'}}>
                    {alerts.map((alert) => (
                        <div key={alert.id} role="listitem">
                            <AlertCard alert={alert} onMarkRead={markAsRead}/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}