'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useEffect } from 'react'
import Header from '@/components/Header'
import Notification from '@/components/Notification'

export default function ServicesPage() {
  const { isLoggedIn } = useApp()
  const router = useRouter()

  useEffect(() => { if (!isLoggedIn) router.push('/login') }, [isLoggedIn, router])
  if (!isLoggedIn) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Notification />
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40, color: 'var(--navy)' }}>SERVICES</h2>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <ServiceBtn label="CERTIFICATIONS" sub="Form 1A, 2A, 3A" onClick={() => router.push('/services/certifications')} />
            <ServiceBtn label="APPLICATION FOR" sub="MARRIAGE LICENSE" onClick={() => router.push('/services/marriage-license')} />
          </div>
        </div>
      </main>
    </div>
  )
}

function ServiceBtn({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 220, height: 140, background: 'white', border: '2px solid var(--primary-green)',
      borderRadius: 16, cursor: 'pointer', fontSize: 18, fontWeight: 700, color: 'var(--navy)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6
    }}
    onMouseOver={e => (e.currentTarget.style.background = 'var(--light-green)')}
    onMouseOut={e => (e.currentTarget.style.background = 'white')}
    >
      <span>{label}</span>
      {sub && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-green)' }}>{sub}</span>}
    </button>
  )
}
