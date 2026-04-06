import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const MOCK_RAIN = [
    { day: 'Mon', mm: 2.5, probability: 30 },
    { day: 'Tue', mm: 8.1, probability: 72 },
    { day: 'Wed', mm: 0.0, probability: 5  },
    { day: 'Thu', mm: 14.3, probability: 85 },
    { day: 'Fri', mm: 3.2, probability: 40 },
    { day: 'Sat', mm: 0.5, probability: 12 },
    { day: 'Sun', mm: 6.7, probability: 60 },
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
                :                       '#22c55e';


    const needleAngle = -180 + (pct / 100) * 180;
    const toRad = d => d * Math.PI / 180;
    const cx = 100, cy = 88, r = 65;
    const nx = cx + r * Math.cos(toRad(needleAngle));
    const ny = cy + r * Math.sin(toRad(needleAngle));

    const riskLabels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
    const riskColors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <svg viewBox="0 -15 200 130" width="260" height="150">                {/* Background arc */}
                <path d="M 15 88 A 85 85 0 0 1 57 20"
                      fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" opacity="0.9"/>
                <path d="M 57 20 A 85 85 0 0 1 100 7"
                      fill="none" stroke="#eab308" strokeWidth="16" strokeLinecap="butt" opacity="0.9"/>
                <path d="M 100 7 A 85 85 0 0 1 143 20"
                      fill="none" stroke="#f97316" strokeWidth="16" strokeLinecap="butt" opacity="0.9"/>
                <path d="M 143 20 A 85 85 0 0 1 185 88"
                      fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" opacity="0.9"/>
                {/* Needle */}
                <line x1={cx} y1={cy} x2={nx} y2={ny}
                      stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx={cx} cy={cy} r="5" fill="white"/>
                {/* Labels */}
                <text x="12" y="110" fill="#94a3b8" fontSize="10">0</text>
                <text x="95" y="-4" fill="#94a3b8" fontSize="10">50</text>
                <text x="176" y="110" fill="#94a3b8" fontSize="10">100</text>
            </svg>

            <div style={{ fontSize: '2.8rem', fontWeight: '800', color, lineHeight: 1 }}>
                {pct}%
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {riskLabels.map((l, i) => (
                    <span key={l} style={{
                        padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: l === level ? riskColors[i] + '33' : '#1e293b',
                        color: l === level ? riskColors[i] : '#475569',
                        border: `1px solid ${l === level ? riskColors[i] : '#334155'}`,
                    }}>
                        {l}
                    </span>
                ))}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>{label}</div>
                <div style={{ color: '#60a5fa' }}>💧 {payload[0].value} mm</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Probability: {MOCK_RAIN.find(d => d.day === label)?.probability}%</div>
            </div>
        );

    }
    return null;
};

export default function DashboardPage() {
    const [showAlerts, setShowAlerts] = useState(false);
    const navigate = useNavigate();

    const barColor = (pct) =>
        pct >= 70 ? '#1d4ed8' : pct >= 40 ? '#3b82f6' : '#93c5fd';

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" }}>

            {/* NAVBAR */}
            <div style={{
                background: '#1e293b', borderBottom: '1px solid #334155',
                padding: '0 2rem', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', height: '60px', position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#f1f5f9' }}>
                         ICTPM-41
                    </span>
                    {['Dashboard', 'Fields', 'Alerts'].map(item => (
                        <button key={item} onClick={() => navigate('/' + item.toLowerCase())}
                                style={{
                                    background: item === 'Dashboard' ? '#334155' : 'none',
                                    border: 'none', color: item === 'Dashboard' ? '#f1f5f9' : '#94a3b8',
                                    cursor: 'pointer', padding: '6px 14px', borderRadius: '6px',
                                    fontWeight: item === 'Dashboard' ? 600 : 400, fontSize: '0.9rem'
                                }}>
                            {item}
                        </button>
                    ))}
                </div>

                {/* ALERT BELL */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowAlerts(!showAlerts)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#f1f5f9', fontSize: '1.3rem', position: 'relative', padding: '4px'
                    }}>
                        🔔
                        {MOCK_ALERTS.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-2px', right: '-4px',
                                background: '#ef4444', color: 'white', borderRadius: '50%',
                                width: '18px', height: '18px', fontSize: '0.65rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                            }}>
                                {MOCK_ALERTS.length}
                            </span>
                        )}
                    </button>
                    {showAlerts && (
                        <div style={{
                            position: 'absolute', right: 0, top: '2.8rem', width: '340px',
                            background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                            zIndex: 100, padding: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#f1f5f9' }}>🚨 Active Alerts</div>
                            {MOCK_ALERTS.map(a => (
                                <div key={a.id} style={{
                                    background: '#0f172a', borderRadius: '8px', padding: '0.75rem',
                                    marginBottom: '0.5rem', fontSize: '0.83rem', color: '#cbd5e1',
                                    borderLeft: `3px solid ${a.riskLevel === 'EXTREME' ? '#ef4444' : '#f97316'}`
                                }}>
                                    {a.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        Weather & fire risk overview for your fields
                    </p>
                </div>

                {/* RAIN CHART */}
                <div style={{
                    background: '#1e293b', borderRadius: '16px', padding: '1.5rem',
                    marginBottom: '1.5rem', border: '1px solid #334155'
                }}>
                    <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>
                        🌧️ 7-Day Rain Forecast
                    </h2>
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={MOCK_RAIN} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false}/>
                            <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
                            <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="mm"/>
                            <Tooltip content={<CustomTooltip/>} cursor={{ fill: 'transparent' }}/>
                            <Bar dataKey="mm" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                <LabelList dataKey="probability" position="top"
                                           formatter={v => v > 0 ? `${v}%` : ''}
                                           style={{ fill: '#64748b', fontSize: '0.72rem' }}/>
                                {MOCK_RAIN.map((entry, i) => (
                                    <Cell key={i} fill={barColor(entry.probability)}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1d4ed8', display: 'inline-block' }}/>
                            High probability (≥70%)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6', display: 'inline-block' }}/>
                            Medium (40–69%)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#93c5fd', display: 'inline-block' }}/>
                            Low (&lt;40%)
                        </span>
                    </div>
                </div>

                {/* FIRE RISK */}
                <div style={{
                    background: '#1e293b', borderRadius: '16px', padding: '1.5rem 1.5rem 2rem',
                    border: '1px solid #334155', textAlign: 'center'
                }}>
                    <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'left' }}>
                         Fire Risk Index
                    </h2>
                    <FireGauge score={MOCK_FIRE.riskScore} level={MOCK_FIRE.riskLevel}/>
                </div>

            </div>
        </div>
    );
}