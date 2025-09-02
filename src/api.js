import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
})

// Notes API
export const fetchNotes = () => api.get('/api/notes').then(r => r.data)
export const createNote = (formData) => api.post('/api/notes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data)
export const updateNote = (id, payload) => api.put(`/api/notes/${id}`, payload).then(r => r.data)
export const deleteNote = (id) => api.delete(`/api/notes/${id}`).then(r => r.data)
export const summarizeNote = (id) => api.post(`/api/notes/${id}/summarize`).then(r => r.data)
