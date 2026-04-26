import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFields, createField, updateField, deleteField, importCSV, exportCSV } from '../services/fieldService';

function riskColor(level) {
    if (level === 'EXTREME') return '#ef4444';
    if (level === 'HIGH') return '#f97316';
    if (level === 'MEDIUM') return '#eab308';
    return '#10b981';
}

const VEGETATION_TYPES = ['All', 'Crops', 'Mixed', 'Forest'];

export default function FieldsPage() {
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [vegetationFilter, setVegetationFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        crop: '',
        vegetationType: 'Crops',
        areaHa: '',
        soilMoisture: '',
        windKmh: '',
        rainChance: '',
        fireRisk: 'MEDIUM',
        notes: ''
    });

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        const data = await getFields();
        setFields(Array.isArray(data) ? data : data.content || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingField) {
            await updateField(editingField.id, formData);
        } else {
            await createField(formData);
        }
        setShowModal(false);
        setEditingField(null);
        setFormData({ name: '', location: '', crop: '', vegetationType: 'Crops', areaHa: '', soilMoisture: '', windKmh: '', rainChance: '', fireRisk: 'MEDIUM', notes: '' });
        loadFields();
    };

    const handleEdit = (field) => {
        setEditingField(field);
        setFormData(field);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            await deleteField(id);
            loadFields();
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            await importCSV(file);
            loadFields();
        } else {
            alert('Please select a CSV file');
        }
    };

    const filteredFields = vegetationFilter === 'All'
        ? fields
        : fields.filter(f => f.vegetationType === vegetationFilter);

    const totalArea = fields.reduce((sum, f) => sum + (parseFloat(f.areaHa) || 0), 0);
    const highRiskCount = fields.filter(f => f.fireRiskLevel === 'HIGH' || f.fireRiskLevel === 'EXTREME').length;
    const avgSoilMoisture = fields.length > 0
        ? Math.round(fields.reduce((sum, f) => sum + (parseFloat(f.soilMoisture) || 0), 0) / fields.length)
        : 0;

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

                <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            setEditingField(null);
                            setFormData({ name: '', location: '', crop: '', vegetationType: 'Crops', areaHa: '', soilMoisture: '', windKmh: '', rainChance: '', fireRisk: 'MEDIUM', notes: '' });
                            setShowModal(true);
                        }}
                        style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <i className="fas fa-plus"></i> Add Field
                    </button>

                    <label style={{ background: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-upload"></i> Import CSV
                        <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
                    </label>

                    <button onClick={exportCSV} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>

                {/* VEGETATION TYPE FILTER */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
                        <i className="fas fa-leaf" style={{ marginRight: '5px' }}></i>Vegetation:
                    </span>
                    {VEGETATION_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setVegetationFilter(type)}
                            style={{
                                padding: '7px 18px',
                                borderRadius: '999px',
                                border: '1.5px solid',
                                borderColor: vegetationFilter === type ? '#0f172a' : '#e2e8f0',
                                background: vegetationFilter === type ? '#0f172a' : '#ffffff',
                                color: vegetationFilter === type ? '#ffffff' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                    {vegetationFilter !== 'All' && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>
                            {filteredFields.length} of {fields.length} fields
                        </span>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { label: 'Parcels monitored', value: String(fields.length), hint: 'Active in this season', icon: 'fas fa-map-marker-alt' },
                        { label: 'Total area', value: `${totalArea} ha`, hint: 'Combined footprint', icon: 'fas fa-expand-alt' },
                        { label: 'Elevated fire risk', value: String(highRiskCount), hint: 'HIGH or EXTREME', icon: 'fas fa-fire' },
                        { label: 'Avg soil moisture', value: `${avgSoilMoisture}%`, hint: 'Across all fields', icon: 'fas fa-tint' },
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <i className={stat.icon} style={{ color: '#60a5fa', fontSize: '1.1rem' }}></i>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {stat.label}
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#94a3b8' }}>{stat.hint}</div>
                        </div>
                    ))}
                </div>

                {filteredFields.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        color: '#94a3b8'
                    }}>
                        <i className="fas fa-leaf" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                        <p style={{ margin: 0, fontWeight: 600 }}>No fields match the selected vegetation type.</p>
                        <p style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>Try selecting a different filter or add a new field.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredFields.map(field => (
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
                                            <i className="fas fa-location-dot" style={{ fontSize: '0.7rem', marginRight: '4px' }}></i>
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
                                        <i className="fas fa-chart-line" style={{ fontSize: '0.65rem', marginRight: '4px' }}></i>
                                        {field.status || 'Monitored'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-seedling" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Crop</span>
                                        <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.crop || '—'}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-leaf" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Vegetation</span>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: '#f0fdf4',
                                            color: '#166534'
                                        }}>
                                            {field.vegetationType || '—'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-cloud-rain" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Rain Chance</span>
                                        <span style={{ color: '#4338ca', fontWeight: 700 }}>{field.rainChance || '0%'}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-fire" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Fire Risk</span>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#ffffff',
                                            background: riskColor(field.fireRiskLevel)
                                        }}>
                                            {field.fireRiskLevel || 'N/A'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-arrows-alt" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Area</span>
                                        <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.areaHa} ha</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-tint" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Soil moisture</span>
                                        <span style={{ color: '#4338ca', fontWeight: 700 }}>{field.soilMoisture}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-wind" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Wind</span>
                                        <span style={{ color: '#1e293b', fontWeight: 700 }}>{field.windKmh} km/h</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}><i className="fas fa-clock" style={{ fontSize: '0.75rem', marginRight: '6px' }}></i>Last sync</span>
                                        <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{field.lastReading || 'Just now'}</span>
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
                                    <i className="fas fa-pen" style={{ fontSize: '0.7rem', marginRight: '6px', color: '#94a3b8' }}></i>
                                    {field.notes || 'No additional notes.'}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button onClick={() => handleEdit(field)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button onClick={() => handleDelete(field.id, field.name)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                            <i className="fas fa-chart-simple" style={{ marginRight: '6px' }}></i> How ICTPM-41 uses this data
                        </h2>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.7 }}>
                            <li>Rain probability and weekly totals are blended with soil moisture trends to flag irrigation stress or waterlogging risk.</li>
                            <li>Fire risk combines temperature, humidity, wind, and vegetation dryness signals—stronger wind on dry parcels raises the index faster.</li>
                            <li>Readings are refreshed on a short interval; use "last sensor sync" to know how fresh each card is before acting.</li>
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
                            <i className="fas fa-clipboard-list" style={{ marginRight: '6px' }}></i> Practical checklist
                        </h2>
                        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.92rem', lineHeight: 1.75, color: '#cbd5e1' }}>
                            <li>Start with parcels marked EXTREME or HIGH for fire—confirm equipment schedules and public reporting lines.</li>
                            <li>Cross-check rain outlook before spraying or harvesting; gusty dry days need different timing than calm wet ones.</li>
                            <li>Log any on-ground observations in your ops workflow so future seasons improve the baseline for these dashboards.</li>
                        </ol>
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '80%',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`fas ${editingField ? 'fa-edit' : 'fa-plus'}`}></i>
                            {editingField ? 'Edit Field' : 'Add New Field'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Field Name *"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Location *"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Crop"
                                    value={formData.crop}
                                    onChange={e => setFormData({ ...formData, crop: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <select
                                    value={formData.vegetationType || 'Crops'}
                                    onChange={e => setFormData({ ...formData, vegetationType: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', color: '#1e293b' }}
                                >
                                    <option value="Crops">Crops</option>
                                    <option value="Mixed">Mixed</option>
                                    <option value="Forest">Forest</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Area (ha)"
                                    value={formData.areaHa}
                                    onChange={e => setFormData({ ...formData, areaHa: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Soil Moisture (%)"
                                    value={formData.soilMoisture}
                                    onChange={e => setFormData({ ...formData, soilMoisture: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Wind Speed (km/h)"
                                    value={formData.windKmh}
                                    onChange={e => setFormData({ ...formData, windKmh: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Rain Chance (%)"
                                    value={formData.rainChance}
                                    onChange={e => setFormData({ ...formData, rainChance: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                />
                                <select
                                    value={formData.fireRisk}
                                    onChange={e => setFormData({ ...formData, fireRisk: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="EXTREME">EXTREME</option>
                                </select>
                                <textarea
                                    placeholder="Notes"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" style={{ background: '#0f172a', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fas fa-save"></i> Save
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#94a3b8', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}