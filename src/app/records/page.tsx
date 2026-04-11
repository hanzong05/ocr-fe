"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import { supabase } from "@/lib/supabase";
import { fetchDocuments } from "@/lib/api";
import { LcrRecord } from "@/lib/types";
import Form1A from "@/components/forms/Form1A";
import Form2A from "@/components/forms/Form2A";
import Form3A from "@/components/forms/Form3A";
import Form90 from "@/components/forms/Form90";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> =
{
  Pending: { bg: "#fff8ec", text: "#d68000", dot: "#f39c12" },
  Approved: { bg: "#edfaf3", text: "#1a7a45", dot: "#27ae60" },
  Rejected: { bg: "#fef0f0", text: "#c0392b", dot: "#e74c3c" },
};

export default function RecordsPage() {
  const { isLoggedIn, hydrated, user } = useApp();
  const router = useRouter();
  const [records, setRecords] = useState<LcrRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LcrRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [originalFields, setOriginalFields] = useState({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<LcrRecord | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeletePw, setShowDeletePw] = useState(false);

  useEffect(() => {
    if (hydrated && !isLoggedIn) router.push("/login");
  }, [isLoggedIn, hydrated, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchDocuments()
      .then((docs) => {
        setRecords(docs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        r.name?.toLowerCase().includes(q) ||
        r.doc_id?.toString().includes(q)) &&
      (!filterType || r.typeCode === filterType) &&
      (!filterStatus || r.status === filterStatus)
    );
  });

  function openRecord(r: LcrRecord) {
    setSelected(r);
    setEditFields(r.form_data || {});
    setOriginalFields(r.form_data || {});
    setEditing(false);
  }

  async function saveRecord() {
    if (!selected) return;
    setSaving(true);
    try {
      const newStatus = pendingStatus || editFields._status || selected.status;
      await supabase
        .from("documents")
        .update({ status: newStatus })
        .eq("doc_id", selected.doc_id);

      const fieldNames = Object.keys(editFields).filter(
        (k) => k !== "_status" && editFields[k] !== "",
      );
      if (fieldNames.length) {
        const { data: fieldDefs } = await supabase
          .from("data_fields")
          .select("field_id, field_name")
          .in("field_name", fieldNames);
        const nameToId: Record<string, number> = {};
        for (const f of fieldDefs || []) nameToId[f.field_name] = f.field_id;
        await supabase
          .from("document_data")
          .delete()
          .eq("doc_id", selected.doc_id);
        const rows = fieldNames
          .filter((n) => nameToId[n])
          .map((n) => ({
            doc_id: selected.doc_id,
            field_id: nameToId[n],
            extracted_value: editFields[n],
            ner_confidence_score: 0,
            is_corrected: 1,
          }));
        if (rows.length) await supabase.from("document_data").insert(rows);
      }

      setRecords((rs) =>
        rs.map((r) =>
          r.doc_id === selected.doc_id
            ? { ...r, status: newStatus, form_data: { ...editFields } }
            : r,
        ),
      );
      setSelected(null);
      setPendingStatus(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handlers ──────────────────────────────────────────
  function promptDelete(r: LcrRecord) {
    setDeleteTarget(r);
    setDeletePassword("");
    setDeleteError("");
    setShowDeletePw(false);
    setSelected(null); // close record modal
  }

  async function confirmDelete() {
    if (!deleteTarget || !user) return;
    if (!deletePassword) {
      setDeleteError("Please enter your password.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, password: deletePassword }),
      });
      if (!res.ok) {
        setDeleteError("Incorrect password. Please try again.");
        setDeleting(false);
        return;
      }

      // Delete document_data first (FK constraint)
      await supabase
        .from("document_data")
        .delete()
        .eq("doc_id", deleteTarget.doc_id);

      // Delete document
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("doc_id", deleteTarget.doc_id);

      if (error) throw error;

      // ✅ Refresh from API instead of local splice
      const fresh = await fetchDocuments();
      setRecords(fresh);
      setSearch("");        // ✅ clear search
      setFilterType("");    // ✅ optional: clear filters too
      setFilterStatus("");  // ✅ optional

      setDeleteTarget(null);
      setDeletePassword("");
    } catch {
      setDeleteError("Failed to delete record. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const handlePrint = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  }, []);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleBackdropClick = useCallback(() => {
    if (!saving) setSelected(null);
  }, [saving]);

  if (!hydrated || !isLoggedIn) return null;

  const currentStatus =
    pendingStatus || (selected ? editFields._status || selected.status : null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f9fc",
      }}
    >
      <div className="no-print">
        <Notification />
        <Header />
      </div>

      <main
        style={{
          flex: 1,
          padding: "28px 24px",
          maxWidth: 1140,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Page heading */}
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 4,
              height: 28,
              background: "var(--primary-green)",
              borderRadius: 4,
            }}
          />
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--navy)",
              letterSpacing: 1,
            }}
          >
            RECORDS
          </h2>
          <span
            style={{
              marginLeft: "auto",
              background: "var(--light-green)",
              color: "var(--dark-green)",
              fontSize: 13,
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: 20,
            }}
          >
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* Filters */}
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "#aaa",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or ID..."
              style={{
                padding: "9px 14px 9px 34px",
                border: "1.5px solid var(--light-gray)",
                borderRadius: 8,
                fontSize: 14,
                width: 230,
                background: "white",
                outline: "none",
              }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "9px 14px",
              border: "1.5px solid var(--light-gray)",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
              color: filterType ? "var(--navy)" : "#999",
              cursor: "pointer",
            }}
          >
            <option value="">All Types</option>
            <option value="BIRTH">Birth Certificate</option>
            <option value="DEATH">Death Certificate</option>
            <option value="MARRCERT">Marriage Certificate</option>
            <option value="MARRLIC">Marriage License</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "9px 14px",
              border: "1.5px solid var(--light-gray)",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
              color: filterStatus ? "var(--navy)" : "#999",
              cursor: "pointer",
            }}
          >
            <option value="">All Status</option>
            {["Pending", "Approved", "Rejected", "Processed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {(search || filterType || filterStatus) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterType("");
                setFilterStatus("");
              }}
              style={{
                padding: "9px 16px",
                background: "#fff",
                border: "1.5px solid var(--light-gray)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                color: "var(--gray)",
                fontWeight: 600,
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="no-print"
          style={{
            background: "white",
            borderRadius: 14,
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            overflow: "hidden",
            border: "1px solid #eee",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "var(--light-green)" }}>
                {[
                  "ID",
                  "Type",
                  "Name",
                  "Date Uploaded",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "var(--navy)",
                      fontSize: 12,
                      letterSpacing: 0.5,
                      borderBottom: "2px solid var(--primary-green)",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 60,
                      color: "var(--gray)",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontWeight: 500 }}>Loading records...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 60,
                      color: "var(--gray)",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                    <div style={{ fontWeight: 500 }}>No records found</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const sc = STATUS_COLORS[r.status] || {
                    bg: "#f5f5f5",
                    text: "#888",
                    dot: "#bbb",
                  };
                  return (
                    <tr
                      key={r.doc_id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        background: i % 2 === 0 ? "white" : "#fcfcfc",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f4fbf7")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i % 2 === 0 ? "white" : "#fcfcfc")
                      }
                    >
                      <td
                        style={{
                          padding: "12px 18px",
                          color: "var(--gray)",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        #{r.doc_id}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: 13 }}>
                        {r.typeName}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          fontWeight: 600,
                          color: "var(--navy)",
                        }}
                      >
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          color: "var(--gray)",
                          fontSize: 13,
                        }}
                      >
                        {r.upload_date?.split("T")[0]}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 11,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            letterSpacing: 0.3,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: sc.dot,
                              display: "inline-block",
                            }}
                          />
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {/* ── Action buttons ── */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => openRecord(r)}
                            style={{
                              background: "var(--navy)",
                              color: "white",
                              border: "none",
                              borderRadius: 7,
                              padding: "7px 14px",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "var(--primary-green)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "var(--navy)")
                            }
                          >
                            ✎ View
                          </button>

                          {/* ── Delete button ── */}
                          <button
                            onClick={() => promptDelete(r)}
                            style={{
                              background: "#fef0f0",
                              color: "#c0392b",
                              border: "1.5px solid #f5c6c6",
                              borderRadius: 7,
                              padding: "7px 14px",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#e74c3c";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fef0f0";
                              e.currentTarget.style.color = "#c0392b";
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Record Modal ── */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,25,40,0.55)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backdropFilter: "blur(2px)",
          }}
          onClick={handleBackdropClick}
        >
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: 0,
              maxWidth: 800,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
            }}
            onClick={handleModalClick}
          >
            {/* Modal top bar */}
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 28px",
                borderBottom: "1.5px solid #f0f0f0",
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 10,
                borderRadius: "18px 18px 0 0",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary-green)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  {selected.typeName}
                </p>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    color: "var(--navy)",
                  }}
                >
                  {selected.name}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {currentStatus &&
                  (() => {
                    const sc = STATUS_COLORS[currentStatus] || {
                      bg: "#f5f5f5",
                      text: "#888",
                      dot: "#bbb",
                    };
                    return (
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.text,
                          padding: "5px 14px",
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: sc.dot,
                            display: "inline-block",
                          }}
                        />
                        {currentStatus}
                      </span>
                    );
                  })()}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "#f5f5f5",
                    border: "none",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gray)",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="no-print"
              style={{
                display: "flex",
                gap: 8,
                padding: "16px 28px",
                borderBottom: "1px solid #f5f5f5",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  if (editing) {
                    setEditFields(originalFields);
                    setPendingStatus(null);
                  }
                  setEditing((e) => !e);
                }}
                style={{
                  padding: "8px 18px",
                  background: editing ? "#f0f0f0" : "var(--navy)",
                  color: editing ? "var(--gray)" : "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {editing ? "✕ Cancel" : "✏ Edit"}
              </button>

              {editing && (
                <button
                  onClick={saveRecord}
                  disabled={saving}
                  style={{
                    padding: "8px 18px",
                    background: "var(--primary-green)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "💾 Save"}
                </button>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginLeft: editing ? 0 : "auto",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "✔ Approve", status: "Approved", bg: "#27ae60", hov: "#1e8449" },
                  { label: "✖ Reject", status: "Rejected", bg: "#e74c3c", hov: "#c0392b" },
                  { label: "⏳ Pending", status: "Pending", bg: "#f39c12", hov: "#d68000" },
                ].map(({ label, status, bg, hov }) => (
                  <button
                    key={status}
                    onClick={() => {
                      setPendingStatus(status);
                      setEditFields((p) => ({ ...p, _status: status }));
                    }}
                    style={{
                      padding: "8px 16px",
                      background: pendingStatus === status ? hov : bg,
                      color: "white",
                      border: `2px solid ${pendingStatus === status ? hov : "transparent"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                      outline: pendingStatus === status ? `2px solid ${bg}` : "none",
                      outlineOffset: 2,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = hov)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = pendingStatus === status ? hov : bg)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Delete from modal */}
              <button
                onClick={() => promptDelete(selected)}
                style={{
                  padding: "8px 18px",
                  background: "#fef0f0",
                  color: "#c0392b",
                  border: "1.5px solid #f5c6c6",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e74c3c";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fef0f0";
                  e.currentTarget.style.color = "#c0392b";
                }}
              >
                🗑 Delete
              </button>

              <button
                onClick={handlePrint}
                style={{
                  padding: "8px 18px",
                  background: "#f5f5f5",
                  color: "var(--navy)",
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  marginLeft: "auto",
                }}
              >
                🖨 Print
              </button>
            </div>

            {/* Status change notice */}
            {pendingStatus && (
              <div
                className="no-print"
                style={{
                  margin: "0 28px",
                  marginTop: 14,
                  padding: "10px 16px",
                  background: STATUS_COLORS[pendingStatus]?.bg || "#f5f5f5",
                  borderRadius: 8,
                  fontSize: 13,
                  color: STATUS_COLORS[pendingStatus]?.text || "#888",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠</span> Status will be changed to{" "}
                <strong>{pendingStatus}</strong> — click 💾 Save or Edit to confirm.
                <button
                  onClick={() => setPendingStatus(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "inherit",
                    fontWeight: 700,
                  }}
                >
                  ✕ Undo
                </button>
              </div>
            )}

            {/* Form area */}
            <div className="print-area" style={{ padding: "24px 28px 32px" }}>
              <div
                style={{
                  border: "1.5px solid #ececec",
                  borderRadius: 10,
                  padding: 24,
                  background: "#fafafa",
                }}
              >
                {selected.typeCode === "BIRTH" && (
                  <Form1A fields={editFields} editing={editing} onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))} />
                )}
                {selected.typeCode === "DEATH" && (
                  <Form2A fields={editFields} editing={editing} onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))} />
                )}
                {selected.typeCode === "MARRCERT" && (
                  <Form3A fields={editFields} editing={editing} onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))} />
                )}
                {selected.typeCode === "MARRLIC" && (
                  <Form90 fields={editFields} editing={editing} onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,25,40,0.65)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backdropFilter: "blur(3px)",
          }}
          onClick={() => { if (!deleting) setDeleteTarget(null); }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "32px 36px",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#fef0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: 26,
                }}
              >
                🗑
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>
                Delete Record
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#777", lineHeight: 1.5 }}>
                You are about to permanently delete{" "}
                <strong style={{ color: "#c0392b" }}>#{deleteTarget.doc_id} — {deleteTarget.name}</strong>.
                This action cannot be undone.
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#f0f0f0", margin: "20px 0" }} />

            {/* Password field */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#555",
                  marginBottom: 6,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                Confirm your password to proceed
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showDeletePw ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError("");
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmDelete(); }}
                  placeholder="Enter your password"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "11px 44px 11px 14px",
                    borderRadius: 8,
                    border: deleteError
                      ? "1.5px solid #e74c3c"
                      : "1.5px solid #ddd",
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                    background: deleteError ? "#fff8f8" : "white",
                    transition: "border-color 0.2s",
                  }}
                />
                {/* Show/hide toggle */}
                <button
                  onClick={() => setShowDeletePw((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  {showDeletePw ? "🙈" : "👁"}
                </button>
              </div>

              {deleteError && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: "#e74c3c",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ⚠ {deleteError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: deleting ? "#e0e0e0" : "#e74c3c",
                  color: deleting ? "#aaa" : "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!deleting) e.currentTarget.style.background = "#c0392b";
                }}
                onMouseLeave={(e) => {
                  if (!deleting) e.currentTarget.style.background = "#e74c3c";
                }}
              >
                {deleting ? "Deleting..." : "Delete Record"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "white",
                  color: "#555",
                  border: "1.5px solid #ddd",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}