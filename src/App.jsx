import React, { useEffect, useRef, useState } from 'react'
import { fetchNotes, createNote, updateNote, deleteNote, summarizeNote } from './api'
import Recorder from './components/Recorder'

function NoteItem({ note, onUpdate, onDelete, onSummarize }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [transcript, setTranscript] = useState(note.transcript)

  useEffect(() => {
    setTitle(note.title)
    setTranscript(note.transcript)
  }, [note._id])

  const save = async () => {
    const payload = {}
    if (title !== note.title) payload.title = title
    if (transcript !== note.transcript) payload.transcript = transcript
    if (Object.keys(payload).length === 0) return setEditing(false)
    const updated = await onUpdate(note._id, payload)
    setEditing(false)
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      {editing ? (
        <div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={5} style={{ width: '100%', padding: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={save}>Save</button>
            <button onClick={() => { setEditing(false); setTitle(note.title); setTranscript(note.transcript) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{note.title}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={() => onDelete(note._id)}>Delete</button>
            </div>
          </div>
          {
            //console.log(`http://localhost:4000/uploads/${note.audioPath}`)
          }
          {note.audioPath && (
            <audio controls src={`http://localhost:4000/uploads/${note.audioPath}`} ></audio>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}><strong>Transcript:</strong> {note.transcript}</p>
          <div>
            {note.summary ? (
              <div style={{ background: '#f7f7f7', padding: 8, borderRadius: 6 }}>
                <strong>Summary:</strong>
                <div style={{ whiteSpace: 'pre-wrap' }}>{note.summary}</div>
              </div>
            ) : (
              <button onClick={() => onSummarize(note._id)} disabled={!!note.summary}>
                Generate Summary
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch (e) {
      setError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (blob, title) => {
    const fd = new FormData()
    fd.append('audio', blob, `recording_${Date.now()}.webm`)
    if (title) fd.append('title', title)
    const created = await createNote(fd)
    setNotes(prev => [created, ...prev])
  }

  const onUpdate = async (id, payload) => {
    const updated = await updateNote(id, payload)
    setNotes(prev => prev.map(n => n._id === id ? updated : n))
    return updated
  }

  const onDelete = async (id) => {
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n._id !== id))
  }

  const onSummarize = async (id) => {
    const updated = await summarizeNote(id)
    setNotes(prev => prev.map(n => n._id === id ? updated : n))
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Voice Notes + AI</h1>
      <Recorder onUpload={handleUpload} />
      <hr />
      {loading ? <p>Loading…</p> : error ? <p>{error}</p> : (
        <div>
          {notes.length === 0 ? <p>No notes yet. Record one above.</p> : notes.map(n =>
            <NoteItem key={n._id} note={n} onUpdate={onUpdate} onDelete={onDelete} onSummarize={onSummarize} />
          )}
        </div>
      )}
    </div>
  )
}
