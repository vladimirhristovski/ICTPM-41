import { useNavigate } from 'react-router-dom';
import { useState, useCallback, memo } from 'react';

const INITIAL_ALERTS = [
    {
        id: 1,
        title: 'High Fire Risk',
        field: 'North Field',
        severity: 'HIGH',
        description: 'Elevated fire risk detected based on current weather conditions and dry vegetation.',
        time: 'Today, 14:30',
        source: 'Weather + vegetation index',
        read: false,
        actions: [
            'Postpone open-flame or spark-prone work until conditions improve.',
            'Brief crews on wind direction and nearest water points.',
            'Confirm local fire-service contact is visible in the field office.',
        ],
    },
    {
        id: 2,
        title: 'Extreme Fire Risk',
        field: 'South Field',
        severity: 'EXTREME',
        description: 'Critical alert triggered due to high temperature, low humidity, and strong wind conditions.',
        time: 'Today, 13:10',
        source: 'Multi-sensor composite',
        read: false,
        actions: [
            'Treat as immediate operational priority: restrict non-essential machinery in the parcel.',
            'Increase patrol frequency on borders adjacent to roads or dry grassland.',
            'Document response steps for insurance and compliance records.',
        ],
    },
    {
        id: 3,
        title: 'Rain Forecast Update',
        field: 'East Field',
        severity: 'INFO',
        description: 'Moderate rainfall expected within the next 48 hours. Useful for planning field activity.',
        time: 'Today, 11:00',
        source: 'Regional forecast feed',
        read: false,
        actions: [
            'Shift fertilizer or spray applications to avoid wash-off if timing is flexible.',
            'Prepare drainage checks on low-lying rows after the event.',
            'Update harvest logistics if soil compaction becomes a concern.',
        ],
    },
];

const SEVERITY_BADGE = {
    EXTREME: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', accent: '#ef4444' },
    HIGH: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', accent: '#f97316' },
    INFO: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', accent: '#3b82f6' },
};

const navBtn = (active) => ({
    background: active ? '#1e293b' : 'transparent',
    border: 'none',
    color: active ? '#ffffff' : '#94a3b8',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'background 0.2s ease, color 0.2s ease',
});

const AlertCard = memo(function AlertCard({ alert, onMarkRead }) {
    const sev = SEVERITY_BADGE[alert.severity] ?? SEVERITY_BADGE.INFO;

    return (
        <article
            style={{
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '1rem',
                padding: '1.25rem 1.5rem 1.25rem 1.35rem',
                borderRadius: '12px',
                border: `1px solid ${alert.read ? '#e2e8f0' : sev.border}`,
                background: alert.read ? '#ffffff' : '#fafbff',
                boxShadow: alert.read
                    ? '0 1px 2px rgba(15, 23, 42, 0.06)'
                    : '0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            }}
        >
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: sev.accent,
                    opacity: alert.read ? 0.35 : 1,
                }}
            />

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem 1rem',
                    marginBottom: '0.65rem',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: '#0f172a',
                        lineHeight: 1.3,
                        flex: '1 1 12rem',
                    }}
                >
                    {alert.title}
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                        style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            background: sev.bg,
                            color: sev.text,
                            border: `1px solid ${sev.border}`,
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                        }}
                    >
                        {alert.severity}
                    </span>
                    <span
                        style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            background: alert.read ? '#f1f5f9' : '#e0e7ff',
                            color: alert.read ? '#64748b' : '#4338ca',
                            border: `1px solid ${alert.read ? '#e2e8f0' : '#c7d2fe'}`,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                        }}
                    >
                        {alert.read ? 'Read' : 'Unread'}
                    </span>
                </div>
            </div>

            <p
                style={{
                    margin: '0 0 1rem',
                    color: '#64748b',
                    fontSize: '0.9375rem',
                    lineHeight: 1.65,
                    maxWidth: '62rem',
                }}
            >
                {alert.description}
            </p>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.5rem 1.25rem',
                    marginBottom: '1rem',
                    fontSize: '0.8125rem',
                    color: '#475569',
                }}
            >
                <span style={{ fontWeight: 600, color: '#334155' }}>
                    Field:{' '}
                    <span style={{ fontWeight: 500, color: '#64748b' }}>{alert.field}</span>
                </span>
                <span style={{ color: '#cbd5e1', userSelect: 'none' }}>|</span>
                <time dateTime={alert.time} style={{ color: '#64748b', fontWeight: 500 }}>
                    {alert.time}
                </time>
            </div>

            <button
                type="button"
                onClick={() => onMarkRead(alert.id)}
                disabled={alert.read}
                style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: alert.read ? '1px solid #e2e8f0' : '1px solid #334155',
                    background: alert.read ? '#f8fafc' : '#0f172a',
                    color: alert.read ? '#94a3b8' : '#f8fafc',
                    cursor: alert.read ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease',
                }}
                onMouseDown={(e) => {
                    if (!alert.read) e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = '';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                }}
            >
                {alert.read ? 'Already read' : 'Mark as read'}
            </button>
        </article>
    );
});

export default function AlertsPage() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);

    const markAsRead = useCallback((id) => {
        setAlerts((prev) =>
            prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))
        );
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <div
                style={{
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
                }}
            >
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
                                style={navBtn(item === 'Alerts')}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '2.5rem clamp(1.25rem, 4vw, 4rem)', maxWidth: '920px' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
                        Alerts Center
                    </h1>
                </header>

                <div role="list" style={{ display: 'flex', flexDirection: 'column' }}>
                    {alerts.map((alert) => (
                        <div key={alert.id} role="listitem">
                            <AlertCard alert={alert} onMarkRead={markAsRead} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
