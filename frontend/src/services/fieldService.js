import api from './api';

export const getFields = async () => {
    const response = await api.get('/fields');
    return response.data;
};

export const getField = async (id) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
};

export const createField = async (data) => {
    const response = await api.post('/fields', data);
    return response.data;
};

export const updateField = async (id, data) => {
    const response = await api.put(`/fields/${id}`, data);
    return response.data;
};

export const deleteField = async (id) => {
    await api.delete(`/fields/${id}`);
};

export const importCSV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/fields/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const exportCSV = async () => {
    const response = await api.get('/fields/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `fields_export_${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};