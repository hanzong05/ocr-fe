'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Header from '@/components/Header'
import Notification from '@/components/Notification'
import Form1A from '@/components/forms/Form1A'
import Form2A from '@/components/forms/Form2A'
import Form3A from '@/components/forms/Form3A'
import { saveDocument, TYPE_ID } from '@/lib/api'


export default function CertTemplatePage() {
  const { isLoggedIn, user, notify } = useApp()
  const router = useRouter()
  const [formClass, setFormClass] = useState<string>('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!isLoggedIn) router.push('/login') }, [isLoggedIn, router])

  useEffect(() => {
    const fc = sessionStorage.getItem('lcr_form_class') || '1A'
    const f  = JSON.parse(sessionStorage.getItem('lcr_fields') || '{}')
    setFormClass(fc)
    setFields(f)
  }, [])

  if (!isLoggedIn) return null

  function handleChange(key: string, value: string) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await saveDocument(Number(user?.id), TYPE_ID[formClass] ?? 1, fields)
      notify('Certification saved successfully!', 'success')
      router.push('/services')
    } catch (e: unknown) {
      notify('Save failed: ' + (e instanceof Error ? e.message : 'Unknown error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const formProps = { fields, editing, onChange: handleChange }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Notification />
      <Header />
      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {/* Action buttons */}
          <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <button onClick={() => setEditing(e => !e)} style={{ padding: '10px 20px', background: editing ? '#aaa' : 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              {editing ? '✕ CANCEL' : '✏ EDIT'}
            </button>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              🖨 PRINT
            </button>
            <button onClick={save} disabled={saving} style={{ padding: '10px 20px', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginLeft: 'auto', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'SAVE'}
            </button>
          </div>

          {/* Form — paper-style container */}
          <div style={{ background: 'white', borderRadius: 4, padding: '40px 50px 50px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', minHeight: 900 }}>
            {formClass === '1A' && <Form1A {...formProps} />}
            {formClass === '2A' && <Form2A {...formProps} />}
            {formClass === '3A' && <Form3A {...formProps} />}
          </div>
        </div>
      </main>
    </div>
  )
}
