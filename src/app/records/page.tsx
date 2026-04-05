"use client";
import { useEffect, useState } from "react";
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

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f39c12",
  Approved: "#27ae60",
  Rejected: "#e74c3c",
  Processed: "#3498db",
};

export default function RecordsPage() {
  const { isLoggedIn } = useApp();
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

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

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
    setEditing(false);
  }

  async function saveRecord() {
    if (!selected) return;
    setSaving(true);
    try {
      const newStatus = editFields._status || selected.status;
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
    } finally {
      setSaving(false);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="no-print">
        <Notification />
        <Header />
      </div>
      <main
        style={{
          flex: 1,
          padding: 24,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h2
          className="no-print"
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 20,
            color: "var(--navy)",
          }}
        >
          RECORDS
        </h2>

        {/* Filters */}
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            style={{
              padding: "8px 14px",
              border: "2px solid var(--light-gray)",
              borderRadius: 8,
              fontSize: 14,
              width: 240,
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "2px solid var(--light-gray)",
              borderRadius: 8,
              fontSize: 14,
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
              padding: "8px 14px",
              border: "2px solid var(--light-gray)",
              borderRadius: 8,
              fontSize: 14,
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
                padding: "8px 14px",
                background: "var(--light-gray)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="no-print"
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "var(--light-green)" }}>
                {["ID", "Type", "Name", "Date", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "var(--navy)",
                      borderBottom: "2px solid var(--primary-green)",
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
                      padding: 40,
                      color: "var(--gray)",
                    }}
                  >
                    Loading records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--gray)",
                    }}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.doc_id}
                    style={{
                      borderBottom: "1px solid var(--light-gray)",
                      background: i % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "10px 16px" }}>{r.doc_id}</td>
                    <td style={{ padding: "10px 16px" }}>{r.typeName}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 500 }}>
                      {r.name}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {r.upload_date?.split("T")[0]}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          background:
                            (STATUS_COLORS[r.status] || "#999") + "22",
                          color: STATUS_COLORS[r.status] || "#999",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <button
                        onClick={() => openRecord(r)}
                        style={{
                          background: "var(--navy)",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 14px",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ✎ Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Record Modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              maxWidth: 760,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header — hidden on print */}
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>
                {selected.typeName} — {selected.name}
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal action buttons — hidden on print */}
            <div
              className="no-print"
              style={{ display: "flex", gap: 10, marginBottom: 20 }}
            >
              <button
                onClick={() => setEditing((e) => !e)}
                style={{
                  padding: "8px 18px",
                  background: editing ? "#aaa" : "var(--navy)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {editing ? "✕ CANCEL" : "✏ EDIT"}
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
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {saving ? "Saving..." : "💾 SAVE"}
                </button>
              )}
              <button
                onClick={() => window.print()}
                style={{
                  padding: "8px 18px",
                  background: "var(--navy)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                🖨 PRINT
              </button>
            </div>

            {/* Form — this is the only thing that prints */}
            <div
              className="print-area"
              style={{
                border: "1px solid var(--light-gray)",
                borderRadius: 8,
                padding: 24,
              }}
            >
              {selected.typeCode === "BIRTH" && (
                <Form1A
                  fields={editFields}
                  editing={editing}
                  onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))}
                />
              )}
              {selected.typeCode === "DEATH" && (
                <Form2A
                  fields={editFields}
                  editing={editing}
                  onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))}
                />
              )}
              {selected.typeCode === "MARRCERT" && (
                <Form3A
                  fields={editFields}
                  editing={editing}
                  onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))}
                />
              )}
              {selected.typeCode === "MARRLIC" && (
                <Form90
                  fields={editFields}
                  editing={editing}
                  onChange={(k, v) => setEditFields((p) => ({ ...p, [k]: v }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
