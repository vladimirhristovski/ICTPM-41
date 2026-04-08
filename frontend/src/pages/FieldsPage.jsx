import { useNavigate } from 'react-router-dom';

const FIELDS = [
    {
        id: 1,
        name: 'North Field',
        location: 'Skopje Region',
        crop: 'Wheat',
        status: 'Monitored',
        fireRisk: 'HIGH',
        rainChance: '72%',
    },
    {
        id: 2,
        name: 'South Field',
        location: 'Veles Region',
        crop: 'Corn',
        status: 'Stable',
        fireRisk: 'EXTREME',
        rainChance: '25%',
    },
    {
        id: 3,
        name: 'East Field',
        location: 'Shtip Region',
        crop: 'Sunflower',
        status: 'Monitored',
        fireRisk: 'MEDIUM',
        rainChance: '48%',
    },
];

function riskColor(level) {
    if (level === 'EXTREME') return '#ef4444';
    if (level === 'HIGH') return '#f97316';
    if (level === 'MEDIUM') return '#eab308';
    return '#10b981';
}

export default function FieldsPage() {
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
                                    background: item === 'Fields' ? '#1e293b' : 'transparent',
                                    border: 'none',
                                    color: item === 'Fields' ? '#ffffff' : '#94a3b8',
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
                        Fields Overview
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '1rem' }}>
                        Overview of monitored agricultural fields and current environmental status.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '1.5rem'
                }}>
                    {FIELDS.map(field => (
                        <div
                            key={field.id}
                            style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                        {field.name}
                                    </h2>
                                    <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                        {field.location}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '6px 10px',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    background: '#eff6ff',
                                    color: '#2563eb'
                                }}>
                                    {field.status}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gap: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Crop</span>
                                    <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.crop}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Rain Chance</span>
                                    <span style={{ color: '#4338ca', fontWeight: 700 }}>{field.rainChance}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Fire Risk</span>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        background: riskColor(field.fireRisk)
                                    }}>
                                        {field.fireRisk}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '1.25rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                color: '#64748b',
                                fontSize: '0.88rem',
                                lineHeight: 1.5
                            }}>
                                Field conditions are being tracked for forecast updates, precipitation trends, and fire risk monitoring.
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
