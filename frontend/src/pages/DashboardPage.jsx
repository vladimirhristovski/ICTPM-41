import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const MOCK_RAIN = [
    { day: 'MON', mm: 2.5, probability: 30, icon: '🌤️', temp: 20 },
    { day: 'TUE', mm: 8.1, probability: 72, icon: '🌧️', temp: 21 },
    { day: 'WED', mm: 0.0, probability: 5,  icon: '☀️', temp: 18 },
    { day: 'THU', mm: 14.3, probability: 85, icon: '⛈️', temp: 20 },
    { day: 'FRI', mm: 3.2, probability: 40, icon: '🌦️', temp: 22 },
    { day: 'SAT', mm: 0.5, probability: 12, icon: '🌤️', temp: 24 },
    { day: 'SUN', mm: 6.7, probability: 60, icon: '🌧️', temp: 23 },
];

const MOCK_FIRE = { riskScore: 0.67, riskLevel: 'HIGH' };
const MOCK_ALERTS = [
    { id: 1, message: 'HIGH fire risk for "North Field". Risk score: 67%.', riskLevel: 'HIGH' },
    { id: 2, message: 'EXTREME fire risk for "South Field". Risk score: 91%.', riskLevel: 'EXTREME' },
];

function FireGauge({ score, level }) {
    const pct = Math.round(score * 100);
    const color = level === 'EXTREME' ? '#ef4444'
        : level === 'HIGH'    ? '#f97316'
            : level === 'MEDIUM'  ? '#eab308'
                :                       '#10b981';
    const needleAngle = -180 + (pct / 100) * 180;
    const toRad = d => d * Math.PI / 180;
    const cx = 100, cy = 88, r = 65;
    const nx = cx + r * Math.cos(toRad(needleAngle));
    const ny = cy + r * Math.sin(toRad(needleAngle));
    const riskLabels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
    const riskColors = ['#10b981', '#eab308', '#f97316', '#ef4444'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <svg viewBox="0 -15 200 130" width="260" height="150">
                <path d="M 15 88 A 85 85 0 0 1 57 20" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" opacity="0.8"/>
                <path d="M 57 20 A 85 85 0 0 1 100 7" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="butt" opacity="0.8"/>
                <path d="M 100 7 A 85 85 0 0 1 143 20" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="butt" opacity="0.8"/>
                <path d="M 143 20 A 85 85 0 0 1 185 88" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" opacity="0.8"/>
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
                <circle cx={cx} cy={cy} r="6" fill="#334155"/>
                <text x="14" y="110" fill="#94a3b8" fontSize="10" fontWeight="600">0</text>
                <text x="91" y="-4" fill="#94a3b8" fontSize="10" fontWeight="600">50</text>
                <text x="176" y="110" fill="#94a3b8" fontSize="10" fontWeight="600">100</text>
            </svg>
            <div style={{ fontSize: '2.8rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{pct}%</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {riskLabels.map((l, i) => (
                    <span key={l} style={{
                        padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                        background: l === level ? riskColors[i] : '#f1f5f9',
                        color: l === level ? '#ffffff' : '#64748b',
                        border: `1px solid ${l === level ? riskColors[i] : '#e2e8f0'}`,
                        transition: 'all 0.3s'
                    }}>{l}</span>
                ))}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const d = MOCK_RAIN.find(x => x.day === label);
        return (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#1e293b', marginBottom: '4px', fontWeight: 700 }}>{label}</div>
                <div style={{ color: '#6366f1', fontWeight: 600 }}>💧 {payload[0].value} mm</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Probability: {d?.probability}%</div>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [showAlerts, setShowAlerts] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const navigate = useNavigate();

    // Professional Blue Scale
    const barColor = (pct) => pct >= 70 ? '#4338ca' : pct >= 40 ? '#6366f1' : '#a5b4fc';

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* NAVBAR - Darker Slate for Professional contrast */}
            <div style={{
                background: '#0f172a',
                padding: '0 2rem', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', height: '64px', position: 'sticky', top: 0, zIndex: 50,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#60a5fa', letterSpacing: '-0.025em' }}>ICTPM-41</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Dashboard', 'Fields', 'Alerts'].map(item => (
                            <button key={item} onClick={() => navigate('/' + item.toLowerCase())} style={{
                                background: item === 'Dashboard' ? '#1e293b' : 'transparent',
                                border: 'none', color: item === 'Dashboard' ? '#ffffff' : '#94a3b8',
                                cursor: 'pointer', padding: '8px 16px', borderRadius: '8px',
                                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s'
                            }}>{item}</button>
                        ))}
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowAlerts(!showAlerts)} style={{
                        background: '#1e293b', border: '1px solid #334155', cursor: 'pointer',
                        fontSize: '1.1rem', position: 'relative', padding: '8px', borderRadius: '8px',
                        color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        🔔
                        {MOCK_ALERTS.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#ef4444', color: 'white', borderRadius: '50%',
                                width: '20px', height: '20px', fontSize: '0.7rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                                border: '2px solid #0f172a'
                            }}>{MOCK_ALERTS.length}</span>
                        )}
                    </button>
                    {showAlerts && (
                        <div style={{
                            position: 'absolute', right: 0, top: '3.5rem', width: '320px',
                            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                            zIndex: 100, padding: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                        }}>
                            <div style={{ fontWeight: 800, marginBottom: '1rem', color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Active Alerts</div>
                            {MOCK_ALERTS.map(a => (
                                <div key={a.id} style={{
                                    background: '#f8fafc', borderRadius: '8px', padding: '0.75rem',
                                    marginBottom: '0.75rem', fontSize: '0.8rem', color: '#334155',
                                    borderLeft: `4px solid ${a.riskLevel === 'EXTREME' ? '#ef4444' : '#f97316'}`,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>{a.message}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '2.5rem 4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Weather Overview</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '1rem' }}>Monitoring environmental conditions for optimal field management.</p>
                </div>

                {/* 7-DAY CALENDAR CARDS */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Rain Forecast
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        {MOCK_RAIN.map((d, i) => (
                            <div key={i} onClick={() => setSelectedDay(i)} style={{
                                flex: 1, borderRadius: '12px', padding: '1.25rem 0.5rem',
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: selectedDay === i ? '#6366f1' : '#ffffff',
                                border: '1px solid',
                                borderColor: selectedDay === i ? '#4338ca' : '#e2e8f0',
                                boxShadow: selectedDay === i ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none',
                                transform: selectedDay === i ? 'translateY(-2px)' : 'none'
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedDay === i ? '#e0e7ff' : '#94a3b8', marginBottom: '0.75rem' }}>
                                    {d.day}
                                </div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{d.icon}</div>
                                <div style={{
                                    fontSize: '0.7rem', fontWeight: 800,
                                    background: selectedDay === i ? 'rgba(255,255,255,0.2)' : (d.probability >= 70 ? '#e0e7ff' : '#f1f5f9'),
                                    borderRadius: '4px', padding: '2px 6px',
                                    color: selectedDay === i ? '#ffffff' : (d.probability >= 70 ? '#4338ca' : '#64748b'),
                                    display: 'inline-block', marginBottom: '0.75rem'
                                }}>
                                    {d.probability}%
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedDay === i ? '#ffffff' : '#1e293b' }}>
                                    {d.temp}°
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '1.5rem', background: '#f8fafc',
                        borderRadius: '12px', padding: '1.25rem',
                        display: 'flex', gap: '2rem', alignItems: 'center',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '3rem' }}>{MOCK_RAIN[selectedDay].icon}</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>{MOCK_RAIN[selectedDay].day} </div>
                            <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
                                <b style={{color: '#6366f1'}}>{MOCK_RAIN[selectedDay].mm} mm</b> precipitation •
                                <b> {MOCK_RAIN[selectedDay].temp}°C</b> temperature •
                                <b> {MOCK_RAIN[selectedDay].probability}%</b> rain probability
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '2rem' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Weekly Precipitation (mm)
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={MOCK_RAIN} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false}/>
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="mm"/>
                                <Tooltip content={<CustomTooltip/>} cursor={{ fill: '#f1f5f9' }}/>
                                <Bar dataKey="mm" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                    <LabelList dataKey="mm" position="top" offset={10}
                                               style={{ fill: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}/>
                                    {MOCK_RAIN.map((entry, i) => (
                                        <Cell key={i} fill={barColor(entry.probability)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
                            Fire Risk Index
                        </h2>
                        <FireGauge score={MOCK_FIRE.riskScore} level={MOCK_FIRE.riskLevel}/>
                    </div>
                </div>
            </div>
        </div>
    );
}