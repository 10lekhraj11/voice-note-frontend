import React, { useEffect, useRef, useState } from 'react'

export default function Recorder({ onUpload }) {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [recording, setRecording] = useState(false)
  const [title, setTitle] = useState('')
  const [devices, setDevices] = useState([])
  const [selectedMic, setSelectedMic] = useState("")
  
  const start = async () => {
    try {    
      if(!selectedMic) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        navigator.mediaDevices.enumerateDevices().then(allDevices => {
        const audioInputs = allDevices.filter(d => d.kind === "audioinput")
        setDevices(audioInputs)
        if (audioInputs[0]) setSelectedMic(audioInputs[0].deviceId)
        })
      }
      const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: selectedMic } }
    })

      let mimeType = ''
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus"
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"
      } else {
        mimeType = "audio/wav"
      }
      const mr = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        

        await onUpload(blob, title)
        setTitle('')
      }
      mr.start(1000)
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch (err) {
      console.log(err)
    }
  }

  const stop = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop())
    setRecording(false)
  }

  return (
    <div>
      {devices.length>0&&<select value={selectedMic} onChange={e => setSelectedMic(e.target.value)}>
        {devices.map(d => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Mic ${d.deviceId}`}
          </option>
        ))}
      </select>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      
      <input placeholder="Note title (optional)" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 8, flex: 1 }} />
      {!recording ? (
        <button onClick={start}>Start Recording</button>
      ) : (
        <button onClick={stop}>Stop</button>
      )}
    </div>
    </div>
  )
}
