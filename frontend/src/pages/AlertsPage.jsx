import { useNavigate } from 'react-router-dom';

const ALERTS = [
    {
        id: 1,
        title: 'High Fire Risk',
        field: 'North Field',
        severity: 'HIGH',
        description: 'Elevated fire risk detected based on current weather conditions and dry vegetation.',
        time: 'Today, 14:30',
        source: 'Weather + vegetation index',
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
        actions: [
            'Shift fertilizer or spray applications to avoid wash-off if timing is flexible.',
            'Prepare drainage checks on low-lying rows after the event.',
            'Update harvest logistics if soil compaction becomes a concern.',
        ],
    },
];

function badgeColor(level) {
    if (level === 'EXTREME') return { bg: '#fee2e2', text: '#b91c1c' };
    if (level === 'HIGH') return { bg: '#ffedd5', text: '#c2410c' };
    return { bg: '#dbeafe', text: '#1d4ed8' };
}

export default function AlertsPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#60a5fa', letterSpacing: '-0.025em' }}>ICTPM-41</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Dashboard', 'Fields', 'Alerts'].map(item => (
                            <button
                                key={item}
                                onClick={() => navigate('/' + item.toLowerCase())}
                                style={{
                                    background: item === 'Alerts' ? '#1e293b' : 'transparent',
                                    border: 'none',
                                    color: item === 'Alerts' ? '#ffffff' : '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '2.5rem 4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
                        Alerts Center
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.6 }}>
                        Alerts merge live weather, soil and vegetation proxies, and forecast deltas. Use severity to triage field visits—EXTREME and HIGH items should be reviewed the same day; INFO items support scheduling and logistics.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '1.75rem'
                }}>
                    {[
                        {
                            title: 'Needs immediate review',
                            value: ALERTS.filter(a => a.severity === 'EXTREME' || a.severity === 'HIGH').length,
                            detail: 'HIGH or EXTREME severity',
                            accent: '#f97316',
                        },
                        {
                            title: 'Informational',
                            value: ALERTS.filter(a => a.severity === 'INFO').length,
                            detail: 'Planning and forecast',
                            accent: '#3b82f6',
                        },
                        {
                            title: 'Fields referenced',
                            value: new Set(ALERTS.map(a => a.field)).size,
                            detail: 'Unique parcels in list',
                            accent: '#6366f1',
                        },
                    ].map(card => (
                        <div
                            key={card.title}
                            style={{
                                background: '#ffffff',
                                borderRadius: '14px',
                                padding: '1.25rem 1.35rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                borderLeft: `4px solid ${card.accent}`,
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {card.title}
                            </div>
                            <div style={{ marginTop: '0.45rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{card.value}</div>
                            <div style={{ marginTop: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>{card.detail}</div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    {ALERTS.map((alert, index) => {
                        const colors = badgeColor(alert.severity);

                        return (
                            <div
                                key={alert.id}
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: index !== ALERTS.length - 1 ? '1px solid #e2e8f0' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                                {alert.title}
                                            </h2>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '999px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                background: colors.bg,
                                                color: colors.text
                                            }}>
                                                {alert.severity}
                                            </span>
                                        </div>

                                        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                            {alert.description}
                                        </p>

                                        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span>Field: {alert.field}</span>
                                            <span>{alert.time}</span>
                                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Source: {alert.source}</span>
                                        </div>

                                        <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                                Suggested actions
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.9rem', lineHeight: 1.65 }}>
                                                {alert.actions.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem 1.75rem',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    <h2 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Alert lifecycle & responsibilities
                    </h2>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.7 }}>
                        New alerts appear when model thresholds are crossed; they stay visible until you acknowledge them in your operational process (future releases may add in-app acknowledgment). EXTREME events should trigger a documented check—verify sensors, notify stakeholders, and record mitigation. INFO alerts are safe to use for weekly planning meetings and do not replace official meteorological warnings for public safety.
                    </p>
                </div>
            </div>
        </div>
    );
}
