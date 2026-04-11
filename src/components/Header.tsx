"use client";

import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { isLoggedIn, user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const canGoBack = pathname !== "/services";

  function goBack() {
    router.back();
  }

  async function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      await fetch("/api/logout", { method: "POST" });
      logout();
      setMenuOpen(false);
      router.push("/login");
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      style={{
        background: "var(--primary-green)",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {/* Philippine flag accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0,
          width: "100%", height: 3,
          background: "linear-gradient(90deg, #0038a8 0%, #f39c12 50%, #ce1126 100%)",
        }}
      />

      {/* Left: back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isLoggedIn && canGoBack && (
          <button
            onClick={goBack}
            className="no-print"
            style={{
              background: "rgba(0,0,0,0.15)",
              border: "2px solid rgba(255,255,255,0.4)",
              width: 38, height: 38, borderRadius: 8,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        )}
        <h1
          onClick={() => isLoggedIn && router.push("/services")}
          style={{
            fontSize: 24, fontWeight: 700, color: "white",
            cursor: isLoggedIn ? "pointer" : "default",
            letterSpacing: 0.5, margin: 0,
          }}
        >
          LOCAL CIVIL REGISTRY
        </h1>
      </div>

      {/* Right: nav + avatar */}
      {isLoggedIn && (
        <nav className="no-print" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            { label: "SERVICES", path: "/services" },
            { label: "RECORDS", path: "/records" },
            { label: "DASHBOARD", path: "/dashboard" },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              style={{
                background: pathname === path ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)",
                border: "none", color: "white",
                padding: "8px 16px", borderRadius: 6,
                fontWeight: 600, cursor: "pointer", fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}

          {/* Avatar + dropdown */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                background: menuOpen ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)",
                border: "none", borderRadius: "50%",
                width: 38, height: 38, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0, top: 48,
                  background: "white",
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  minWidth: 240,
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                {/* Green user info header */}
                <div style={{
                  background: "var(--primary-green)",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>
                      {user?.name || "User"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                      {user?.email || ""}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: "8px 0" }}>
                  {/* View Profile */}
                  <button
                    onClick={() => { setMenuOpen(false); router.push("/profile"); }}
                    style={{
                      width: "100%", padding: "11px 20px",
                      textAlign: "left", background: "none",
                      border: "none", cursor: "pointer",
                      fontSize: 14, color: "#333",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#555">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    View Profile
                  </button>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0" }} />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", padding: "11px 20px",
                      textAlign: "left", background: "none",
                      border: "none", cursor: "pointer",
                      fontSize: 14, color: "#e74c3c",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#e74c3c">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}