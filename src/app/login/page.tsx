"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Notification from "@/components/Notification";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, notify } = useApp();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      notify("Please enter both username and password", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.user) {
        notify(data.error || "Invalid username or password", "error");
        return;
      }

      login({
        user_id: data.user.user_id,
        id: data.user.user_id, // alias
        username: data.user.username,
        full_name: data.user.full_name,
        name: data.user.full_name, // alias for Header dropdown
        email: data.user.email || "",
        role: data.user.role,
        department: data.user.department || null,
        employee_id: data.user.employee_id || null,
      });
      notify("Login successful!", "success");
      router.push("/services");
    } catch {
      notify("Cannot connect to server.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Notification />
      <header
        style={{
          background: "var(--primary-green)",
          padding: "16px 32px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 3,
            background:
              "linear-gradient(90deg,#0038a8 0%,#f39c12 50%,#ce1126 100%)",
          }}
        />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
          LOCAL CIVIL REGISTRY
        </h1>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "40px 48px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: 420,
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: 32,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            Sign In
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid var(--light-gray)",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-main)",
                }}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid var(--light-gray)",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-main)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--primary-green)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "var(--font-main)",
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
