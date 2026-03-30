'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useState } from 'react'

export default function Header() {
  const { isLoggedIn, user, logout } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const canGoBack = pathname !== '/services'

  function goBack() {
    router.back()
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      router.push('/login')
    }
  }

  return (
    <header style={{ background: 'var(--primary-green)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'relative' }}>
      {/* Philippine flag stripe */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: 'linear-gradient(90deg, #0038a8 0%, #f39c12 50%, #ce1126 100%)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isLoggedIn && canGoBack && (
          <button onClick={goBack} className="no-print" style={{ background: 'rgba(0,0,0,0.15)', border: '2px solid rgba(255,255,255,0.4)', width: 38, height: 38, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        )}
        <h1
          onClick={() => isLoggedIn && router.push('/services')}
          style={{ fontSize: 24, fontWeight: 700, color: 'white', cursor: isLoggedIn ? 'pointer' : 'default', letterSpacing: 0.5 }}
        >
          LOCAL CIVIL REGISTRY
        </h1>
      </div>

      {isLoggedIn && (
        <nav className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/services')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            SERVICES
          </button>
          <button onClick={() => router.push('/records')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            RECORDS
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 44, background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 200, zIndex: 100 }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray)' }}>{user?.role}</div>
                </div>
                <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--error)' }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
