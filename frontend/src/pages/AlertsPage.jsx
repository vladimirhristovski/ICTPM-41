import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

function badgeColor(level) {
    if (level === 'EXTREME') return { bg: '#fee2e2', text: '#b91c1c' };
    if (level === 'HIGH') return { bg: '#ffedd5', text: '#c2410c' };
    return { bg: '#dbeafe', text: '#1d4ed8' };
}

export default function AlertsPage() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);

    const markAsRead = (id) => {
        setAlerts(prev =>
            prev.map(alert =>
                alert.id === id ? { ...alert, read: true } : alert
            )
        );
    };

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
                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#60a5fa' }}>ICTPM-41</span>
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
                                    fontWeight: 600
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '2.5rem 4rem' }}>
                <h1>Alerts Center</h1>

                <div>
                    {alerts.map((alert, index) => {
                        const colors = badgeColor(alert.severity);

                        return (
                            <div key={alert.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <h3>{alert.title}</h3>

                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '999px',
                                        background: colors.bg,
                                        color: colors.text
                                    }}>
                                        {alert.severity}
                                    </span>

                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '999px',
                                        background: alert.read ? '#e2e8f0' : '#dbeafe'
                                    }}>
                                        {alert.read ? 'Read' : 'Unread'}
                                    </span>
                                </div>

                                <p>{alert.description}</p>

                                <p><b>Field:</b> {alert.field}</p>
                                <p>{alert.time}</p>

                                <button
                                    onClick={() => markAsRead(alert.id)}
                                    disabled={alert.read}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 12px',
                                        background: alert.read ? 'gray' : 'blue',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: alert.read ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {alert.read ? 'Already read' : 'Mark as read'}
                                </button>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
