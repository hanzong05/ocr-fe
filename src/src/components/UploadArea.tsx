'use client'
import { useRef, useState } from 'react'

interface Props {
  files: File[]
  onFiles: (files: File[]) => void
  accept?: string
  label?: string
}

export default function UploadArea({ files, onFiles, accept = '.pdf,.jpg,.jpeg,.png', label = 'Drag & Drop files here or' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    onFiles([...files, ...Array.from(e.dataTransfer.files)])
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFiles([...files, ...Array.from(e.target.files)])
  }

  function removeFile(i: number) {
    onFiles(files.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div
        className={`upload-area${dragging ? ' dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <svg width="60" height="60" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 12px' }}>
          <rect x="15" y="25" width="25" height="35" fill="#ADD8E6" opacity="0.5"/>
          <rect x="20" y="20" width="25" height="35" fill="#4A90E2"/>
          <rect x="30" y="28" width="25" height="35" fill="#FFA500"/>
        </svg>
        <p style={{ fontSize: 14, color: 'var(--gray)' }}>
          {label}{' '}
          <span style={{ color: 'var(--primary-green)', fontWeight: 600, cursor: 'pointer' }}>Browse Files</span>
        </p>
        <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>PDF, JPG, PNG supported</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple style={{ display: 'none' }} onChange={handleChange} />

      {files.map((f, i) => (
        <div key={i} className="file-item">
          <span>{f.name} <span style={{ color: 'var(--gray)', fontSize: 11 }}>({(f.size / 1024).toFixed(1)} KB)</span></span>
          <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 700 }}>✕</button>
        </div>
      ))}
    </div>
  )
}
