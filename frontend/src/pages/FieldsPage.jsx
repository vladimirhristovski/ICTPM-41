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
        areaHa: 42,
        soilMoisture: 38,
        windKmh: 22,
        lastReading: '12 min ago',
        notes: 'Vegetation moisture below seasonal average; combine with rain forecast before scheduling harvest windows.',
    },
    {
        id: 2,
        name: 'South Field',
        location: 'Veles Region',
        crop: 'Corn',
        status: 'Stable',
        fireRisk: 'EXTREME',
        rainChance: '25%',
        areaHa: 58,
        soilMoisture: 22,
        windKmh: 31,
        lastReading: '8 min ago',
        notes: 'Dry spell extended; restrict machinery during midday and keep ignition sources away from field edges.',
    },
    {
        id: 3,
        name: 'East Field',
        location: 'Shtip Region',
        crop: 'Sunflower',
        status: 'Monitored',
        fireRisk: 'MEDIUM',
        rainChance: '48%',
        areaHa: 35,
        soilMoisture: 51,
        windKmh: 14,
        lastReading: '18 min ago',
        notes: 'Conditions within normal range; upcoming rain may support irrigation cutback later in the week.',
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
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.6 }}>
                        Each parcel is tracked for precipitation outlook, soil moisture proxies, wind exposure, and fire-risk indicators so you can plan work windows and spot problems before they spread across the farm network.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { label: 'Parcels monitored', value: String(FIELDS.length), hint: 'Active in this season' },
                        { label: 'Total area', value: `${FIELDS.reduce((s, f) => s + f.areaHa, 0)} ha`, hint: 'Combined footprint' },
                        { label: 'Elevated fire risk', value: String(FIELDS.filter(f => f.fireRisk === 'HIGH' || f.fireRisk === 'EXTREME').length), hint: 'HIGH or EXTREME' },
                        { label: 'Avg soil moisture', value: `${Math.round(FIELDS.reduce((s, f) => s + f.soilMoisture, 0) / FIELDS.length)}%`, hint: 'Across all fields' },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            style={{
                                background: '#ffffff',
                                borderRadius: '14px',
                                padding: '1.25rem 1.35rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {stat.label}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#94a3b8' }}>{stat.hint}</div>
                        </div>
                    ))}
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

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Area</span>
                                    <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.areaHa} ha</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Soil moisture (est.)</span>
                                    <span style={{ color: '#4338ca', fontWeight: 700 }}>{field.soilMoisture}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Wind (10 m)</span>
                                    <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.windKmh} km/h</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Last sensor sync</span>
                                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{field.lastReading}</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '1.25rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                color: '#475569',
                                fontSize: '0.88rem',
                                lineHeight: 1.55
                            }}>
                                {field.notes}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '2.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.5rem 1.75rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            How ICTPM-41 uses this data
                        </h2>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.7 }}>
                            <li>Rain probability and weekly totals are blended with soil moisture trends to flag irrigation stress or waterlogging risk.</li>
                            <li>Fire risk combines temperature, humidity, wind, and vegetation dryness signals—stronger wind on dry parcels raises the index faster.</li>
                            <li>Readings are refreshed on a short interval; use “last sensor sync” to know how fresh each card is before acting.</li>
                        </ul>
                    </div>
                    <div style={{
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: '16px',
                        padding: '1.5rem 1.75rem',
                        color: '#e2e8f0',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.35)'
                    }}>
                        <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Practical checklist
                        </h2>
                        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.92rem', lineHeight: 1.75, color: '#cbd5e1' }}>
                            <li>Start with parcels marked EXTREME or HIGH for fire—confirm equipment schedules and public reporting lines.</li>
                            <li>Cross-check rain outlook before spraying or harvesting; gusty dry days need different timing than calm wet ones.</li>
                            <li>Log any on-ground observations in your ops workflow so future seasons improve the baseline for these dashboards.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
