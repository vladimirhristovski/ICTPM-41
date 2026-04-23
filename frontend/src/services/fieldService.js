const STORAGE_KEY = 'ictpm41_fields';

const DEFAULT_FIELDS = [
    {
        id: 1,
        name: 'North Field',
        location: 'Skopje Region',
        crop: 'Wheat',
        vegetationType: 'Crops',
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
        vegetationType: 'Crops',
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
        vegetationType: 'Mixed',
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

const loadFields = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FIELDS));
    return [...DEFAULT_FIELDS];
};

const saveFields = (fields) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
};

const getNextId = (fields) => Math.max(...fields.map(f => f.id), 0) + 1;

export const getFields = () => {
    return Promise.resolve(loadFields());
};

export const getField = (id) => {
    const fields = loadFields();
    return Promise.resolve(fields.find(f => f.id === id));
};

export const createField = (data) => {
    const fields = loadFields();
    const newField = {
        id: getNextId(fields),
        ...data,
        lastReading: 'Just now',
        status: 'Monitored',
        fireRisk: data.fireRisk || 'MEDIUM',
        vegetationType: data.vegetationType || 'Crops',
    };
    fields.push(newField);
    saveFields(fields);
    return Promise.resolve(newField);
};

export const updateField = (id, data) => {
    const fields = loadFields();
    const index = fields.findIndex(f => f.id === id);
    if (index !== -1) {
        fields[index] = { ...fields[index], ...data, id };
        saveFields(fields);
    }
    return Promise.resolve({ ...data, id });
};

export const deleteField = (id) => {
    const fields = loadFields().filter(f => f.id !== id);
    saveFields(fields);
    return Promise.resolve();
};

export const importCSV = (file) => {
    console.log('Importing CSV:', file.name);
    alert(`CSV "${file.name}" imported successfully!`);
    return Promise.resolve({ message: "Imported" });
};

export const exportCSV = () => {
    const fields = loadFields();
    const headers = ['id', 'name', 'location', 'crop', 'vegetationType', 'status', 'fireRisk', 'rainChance', 'areaHa', 'soilMoisture', 'windKmh', 'lastReading', 'notes'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const field of fields) {
        const values = headers.map(header => {
            const value = field[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fields_export_${new Date().toISOString().slice(0,19)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};