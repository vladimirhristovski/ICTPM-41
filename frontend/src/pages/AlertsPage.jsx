import { useNavigate } from 'react-router-dom';

const ALERTS = [
    {
        id: 1,
        title: 'High Fire Risk',
        field: 'North Field',
        severity: 'HIGH',
        description: 'Elevated fire risk detected based on current weather conditions and dry vegetation.',
        time: 'Today, 14:30',
    },
    {
        id: 2,
        title: 'Extreme Fire Risk',
        field: 'South Field',
        severity: 'EXTREME',
        description: 'Critical alert triggered due to high temperature, low humidity, and strong wind conditions.',
        time: 'Today, 13:10',
    },
    {
        id: 3,
        title: 'Rain Forecast Update',
        field: 'East Field',
        severity: 'INFO',
        description: 'Moderate rainfall expected within the next 48 hours. Useful for planning field activity.',
        time: 'Today, 11:00',
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
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '1rem' }}>
                        View active warnings, forecast notifications, and critical environmental risk events.
                    </p>
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

                                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span>Field: {alert.field}</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
