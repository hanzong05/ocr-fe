'use client'
import { useRef, useState } from 'react'

interface Props {
  files: File[]
  onFiles: (files: File[]) => void
  accept?: string
  label?: string
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export default function UploadArea({
  files,
  onFiles,
  accept = '.pdf,.jpg,.jpeg,.png',
  label = 'Drag & Drop files here or',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function filterValidFiles(selectedFiles: File[]) {
    const validFiles = selectedFiles.filter((file) =>
      ALLOWED_TYPES.includes(file.type)
    )

    const invalidFiles = selectedFiles.filter(
      (file) => !ALLOWED_TYPES.includes(file.type)
    )

    if (invalidFiles.length > 0) {
      alert('Only PDF, JPG, JPEG, and PNG files are allowed.')
    }

    return validFiles
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = filterValidFiles(droppedFiles)

    if (validFiles.length > 0) {
      onFiles([...files, ...validFiles])
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files)
    const validFiles = filterValidFiles(selectedFiles)

    if (validFiles.length > 0) {
      onFiles([...files, ...validFiles])
    }

    e.target.value = ''
  }

  function removeFile(i: number) {
    onFiles(files.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div
        className={`upload-area${dragging ? ' dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 80 80"
          fill="none"
          style={{ margin: '0 auto 12px' }}
        >
          <rect x="15" y="25" width="25" height="35" fill="#ADD8E6" opacity="0.5" />
          <rect x="20" y="20" width="25" height="35" fill="#4A90E2" />
          <rect x="30" y="28" width="25" height="35" fill="#FFA500" />
        </svg>

        <p style={{ fontSize: 14, color: 'var(--gray)' }}>
          {label}{' '}
          <span
            style={{
              color: 'var(--primary-green)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Browse Files
          </span>
        </p>

        <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
          PDF, JPG, JPEG, PNG supported
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {files.map((f, i) => (
        <div key={i} className="file-item">
          <span>
            {f.name}{' '}
            <span style={{ color: 'var(--gray)', fontSize: 11 }}>
              ({(f.size / 1024).toFixed(1)} KB)
            </span>
          </span>
          <button
            onClick={() => removeFile(i)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--error)',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}