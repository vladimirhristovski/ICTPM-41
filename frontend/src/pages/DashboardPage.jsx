import {useCallback, useEffect, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import api from '../services/api';
import Navbar from '../components/Navbar';


const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const WEATHER_ICON = (prob) => {
    if (prob >= 80) return '⛈️';
    if (prob >= 60) return '🌧️';
    if (prob >= 40) return '🌦️';
    if (prob >= 20) return '🌤️';
    return '☀️';
};

function FireGauge({score, level}) {
    const pct = Math.round((score ?? 0) * 100);
    const color = level === 'EXTREME' ? '#ef4444'
        : level === 'HIGH' ? '#f97316'
            : level === 'MEDIUM' ? '#eab308'
                : '#10b981';
    const needleAngle = -180 + (pct / 100) * 180;
    const toRad = d => d * Math.PI / 180;
    const cx = 100, cy = 88, r = 65;
    const nx = cx + r * Math.cos(toRad(needleAngle));
    const ny = cy + r * Math.sin(toRad(needleAngle));
    const riskLabels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
    const riskColors = ['#10b981', '#eab308', '#f97316', '#ef4444'];

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'}}>
            <svg viewBox="0 -15 200 130" width="260" height="150">
                <path d="M 15 88 A 85 85 0 0 1 57 20" fill="none" stroke="#10b981" strokeWidth="12"
                      strokeLinecap="round" opacity="0.8"/>
                <path d="M 57 20 A 85 85 0 0 1 100 7" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="butt"
                      opacity="0.8"/>
                <path d="M 100 7 A 85 85 0 0 1 143 20" fill="none" stroke="#f97316" strokeWidth="12"
                      strokeLinecap="butt" opacity="0.8"/>
                <path d="M 143 20 A 85 85 0 0 1 185 88" fill="none" stroke="#ef4444" strokeWidth="12"
                      strokeLinecap="round" opacity="0.8"/>
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
                <circle cx={cx} cy={cy} r="6" fill="#334155"/>
                <text x="14" y="110" fill="#94a3b8" fontSize="10" fontWeight="600">0</text>
                <text x="91" y="-4" fill="#94a3b8" fontSize="10" fontWeight="600">50</text>
                <text x="176" y="110" fill="#94a3b8" fontSize="10" fontWeight="600">100</text>
            </svg>
            <div style={{fontSize: '2.8rem', fontWeight: '800', color: '#1e293b', lineHeight: 1}}>{pct}%</div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
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

// FIX 5: CustomTooltip now uses the passed rainData prop instead of hardcoded MOCK_RAIN
const CustomTooltip = ({active, payload, label, rainData}) => {
    if (active && payload && payload.length) {
        const d = rainData.find(x => x.day === label);
        return (
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}>
                <div style={{color: '#1e293b', marginBottom: '4px', fontWeight: 700}}>{label}</div>
                <div style={{color: '#6366f1', fontWeight: 600}}>💧 {payload[0].value} mm</div>
                <div style={{color: '#64748b', fontSize: '0.8rem'}}>Probability: {d?.probability}%</div>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [selectedDay, setSelectedDay] = useState(0);
    // FIX 4: Field selector state
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    // FIX 1: Real data state (replaces MOCK_RAIN, MOCK_FIRE)
    const [rainData, setRainData] = useState([]);
    const [fireData, setFireData] = useState(null);
    const [loadingRain, setLoadingRain] = useState(false);
    const [loadingFire, setLoadingFire] = useState(false);
    // Load user's fields on mount (for field selector)
    useEffect(() => {
        api.get('/fields')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data.content || [];
                setFields(data);
                if (data.length > 0) {
                    setSelectedFieldId(data[0].id);
                }
            })
            .catch(err => console.error('Failed to load fields:', err));
    }, []);

    // FIX 1: Fetch real rain & fire data when field changes
    const fetchForecast = useCallback((fieldId) => {
        if (!fieldId) return;

        setLoadingRain(true);
        api.get(`/forecast/rain/${fieldId}`)
            .then(res => {
                const mapped = res.data.map(item => {
                    const date = new Date(item.forecastDate);
                    return {
                        day: DAY_LABELS[date.getDay()],
                        mm: item.expectedMm ?? 0,
                        probability: Math.round((item.rainProbability ?? 0) * 100),
                        icon: WEATHER_ICON(Math.round((item.rainProbability ?? 0) * 100)),
                        forecastDate: item.forecastDate,
                    };
                });
                setRainData(mapped);
            })
            .catch(err => console.error('Failed to load rain forecast:', err))
            .finally(() => setLoadingRain(false));

        setLoadingFire(true);
        api.get(`/forecast/fire/${fieldId}`)
            .then(res => setFireData(res.data))
            .catch(err => console.error('Failed to load fire risk:', err))
            .finally(() => setLoadingFire(false));
    }, []);

    useEffect(() => {
        fetchForecast(selectedFieldId);
    }, [selectedFieldId, fetchForecast]);

    const barColor = (pct) => pct >= 70 ? '#4338ca' : pct >= 40 ? '#6366f1' : '#a5b4fc';

    const selectedDayData = rainData[selectedDay];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>

            {/* NAVBAR */}
            <Navbar/>
            <div style={{padding: '2.5rem 4rem'}}>
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.875rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '-0.025em'
                        }}>Weather Overview</h1>
                        <p style={{margin: '4px 0 0', color: '#64748b', fontSize: '1rem'}}>Monitoring environmental
                            conditions for optimal field management.</p>
                    </div>

                    {/* FIX 4: Field selector */}
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem'}}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Viewing field
                        </label>
                        {fields.length === 0 ? (
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#94a3b8',
                                padding: '8px 12px',
                                background: '#f1f5f9',
                                borderRadius: '8px'
                            }}>
                                No fields yet — add one in Fields
                            </div>
                        ) : (
                            <select
                                value={selectedFieldId ?? ''}
                                onChange={e => {
                                    setSelectedFieldId(Number(e.target.value));
                                    setSelectedDay(0);
                                }}
                                style={{
                                    padding: '8px 14px', borderRadius: '8px',
                                    border: '1px solid #cbd5e1', background: '#ffffff',
                                    fontSize: '0.9rem', fontWeight: 600, color: '#1e293b',
                                    cursor: 'pointer', outline: 'none'
                                }}
                            >
                                {fields.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* 7-DAY CALENDAR CARDS */}
                <div style={{
                    background: '#ffffff', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        margin: '0 0 1.5rem',
                        fontSize: '0.9rem',
                        color: '#64748b',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Rain Forecast
                    </h2>

                    {loadingRain ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>Loading forecast...</div>
                    ) : rainData.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                            {selectedFieldId ? 'No forecast data available for this field.' : 'Select a field to see the forecast.'}
                        </div>
                    ) : (
                        <>
                            <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                                {rainData.map((d, i) => (
                                    <div key={i} onClick={() => setSelectedDay(i)} style={{
                                        flex: 1,
                                        borderRadius: '12px',
                                        padding: '1.25rem 0.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: selectedDay === i ? '#6366f1' : '#ffffff',
                                        border: '1px solid',
                                        borderColor: selectedDay === i ? '#4338ca' : '#e2e8f0',
                                        boxShadow: selectedDay === i ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none',
                                        transform: selectedDay === i ? 'translateY(-2px)' : 'none'
                                    }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: selectedDay === i ? '#e0e7ff' : '#94a3b8',
                                            marginBottom: '0.75rem'
                                        }}>
                                            {d.day}
                                        </div>
                                        <div style={{fontSize: '1.5rem', marginBottom: '0.75rem'}}>{d.icon}</div>
                                        <div style={{
                                            fontSize: '0.7rem', fontWeight: 800,
                                            background: selectedDay === i ? 'rgba(255,255,255,0.2)' : (d.probability >= 70 ? '#e0e7ff' : '#f1f5f9'),
                                            borderRadius: '4px', padding: '2px 6px',
                                            color: selectedDay === i ? '#ffffff' : (d.probability >= 70 ? '#4338ca' : '#64748b'),
                                            display: 'inline-block', marginBottom: '0.75rem'
                                        }}>
                                            {d.probability}%
                                        </div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: selectedDay === i ? '#ffffff' : '#1e293b'
                                        }}>
                                            {d.mm} mm
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedDayData && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    gap: '2rem',
                                    alignItems: 'center',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{fontSize: '3rem'}}>{selectedDayData.icon}</div>
                                    <div>
                                        <div style={{
                                            fontWeight: 800,
                                            fontSize: '1.25rem',
                                            color: '#1e293b'
                                        }}>{selectedDayData.day}</div>
                                        <div style={{color: '#64748b', fontSize: '0.95rem', marginTop: '4px'}}>
                                            <b style={{color: '#6366f1'}}>{selectedDayData.mm} mm</b> precipitation
                                            •&nbsp;
                                            <b>{selectedDayData.probability}%</b> rain probability
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* BOTTOM ROW */}
                <div style={{display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '2rem'}}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{
                            margin: '0 0 1.5rem',
                            fontSize: '0.9rem',
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Weekly Precipitation (mm)
                        </h2>
                        {/* FIX 5: Chart uses live rainData, tooltip receives rainData prop */}
                        {loadingRain || rainData.length === 0 ? (
                            <div style={{
                                height: 220,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8'
                            }}>
                                {loadingRain ? 'Loading...' : 'No data'}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={rainData} margin={{top: 20, right: 10, left: -20, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="day" stroke="#94a3b8"
                                           tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} axisLine={false}
                                           tickLine={false}/>
                                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false}
                                           tickLine={false} unit="mm"/>
                                    <Tooltip content={<CustomTooltip rainData={rainData}/>} cursor={{fill: '#f1f5f9'}}/>
                                    <Bar dataKey="mm" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                        <LabelList dataKey="mm" position="top" offset={10}
                                                   style={{fill: '#64748b', fontSize: '0.75rem', fontWeight: 700}}/>
                                        {rainData.map((entry, i) => (
                                            <Cell key={i} fill={barColor(entry.probability)}/>
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            margin: '0 0 1.5rem',
                            fontSize: '0.9rem',
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textAlign: 'left'
                        }}>
                            Fire Risk Index
                        </h2>
                        {loadingFire ? (
                            <div style={{padding: '2rem', color: '#94a3b8'}}>Loading fire risk...</div>
                        ) : fireData ? (
                            <FireGauge score={fireData.riskScore} level={fireData.riskLevel}/>
                        ) : (
                            <div style={{padding: '2rem', color: '#94a3b8'}}>
                                {selectedFieldId ? 'No fire risk data available.' : 'Select a field to see fire risk.'}
                            </div>
                        )}
                        <p style={{
                            margin: '1.25rem 0 0',
                            textAlign: 'left',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            lineHeight: 1.65,
                            maxWidth: '520px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            The index blends temperature, humidity, wind, and dryness signals. When the needle sits in
                            orange or red, open <b style={{color: '#334155'}}>Fields</b> for parcel-level detail and <b
                            style={{color: '#334155'}}>Alerts</b> for actionable steps and timestamps.
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: '2rem', background: '#ffffff', borderRadius: '16px',
                    padding: '1.5rem 1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    <h2 style={{
                        margin: '0 0 0.65rem',
                        fontSize: '0.9rem',
                        color: '#64748b',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Using this dashboard with the rest of the app
                    </h2>
                    <p style={{margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.7}}>
                        Rain cards and the weekly bar chart help you choose safe windows for spraying, irrigation, and
                        harvest. Cross-check high-probability days with soil conditions on the Fields page. Fire risk is
                        regional-style guidance—always follow local regulations and official warnings. The bell menu
                        lists the same critical items you will find expanded under Alerts, including severity and
                        suggested follow-up.
                    </p>
                </div>
            </div>
        </div>
    );
}
