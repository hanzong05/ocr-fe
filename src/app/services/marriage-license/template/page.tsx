"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import Form90 from "@/components/forms/Form90";
import { saveDocument } from "@/lib/api";

export default function MarriageTemplatePage() {
  const { isLoggedIn, user, notify } = useApp();
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    setFields(JSON.parse(sessionStorage.getItem("lcr_fields") || "{}"));
  }, []);

  if (!isLoggedIn) return null;

  async function save() {
    setSaving(true);
    try {
      await saveDocument(Number(user?.id), 4, fields);
      notify("Marriage license saved!", "success");
      router.push("/services");
    } catch (e: unknown) {
      notify(
        "Save failed: " + (e instanceof Error ? e.message : "Unknown error"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="no-print">
        <Notification />
        <Header />
      </div>
      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div
            className="no-print"
            style={{ display: "flex", gap: 10, marginBottom: 20 }}
          >
            <button
              onClick={() => setEditing((e) => !e)}
              style={{
                padding: "10px 20px",
                background: editing ? "#aaa" : "var(--navy)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {editing ? "✕ CANCEL" : "✏ EDIT"}
            </button>
            {/* <button
              onClick={() => window.print()}
              style={{
                padding: "10px 20px",
                background: "var(--navy)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🖨 PRINT
            </button> */}
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "10px 20px",
                background: "var(--primary-green)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                marginLeft: "auto",
              }}
            >
              {saving ? "Saving..." : "SAVE"}
            </button>
          </div>

          <div
            className="print-area"
            style={{
              background: "white",
              borderRadius: 12,
              padding: "32px 40px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            }}
          >
            <Form90
              fields={fields}
              editing={editing}
              onChange={(k, v) => setFields((p) => ({ ...p, [k]: v }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
