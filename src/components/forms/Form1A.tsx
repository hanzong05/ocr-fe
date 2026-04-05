"use client";

interface Props {
  fields: Record<string, string>;
  editing: boolean;
  onChange: (key: string, value: string) => void;
}

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: "none",
  borderBottom: "1px solid #111",
  outline: "none",
  background: "transparent",
  fontFamily: "'Times New Roman', Times, serif",
  fontSize: "inherit",
  width: "100%",
  ...extra,
});

const cell: React.CSSProperties = {
  borderBottom: "1px solid #111",
  minWidth: 200,
  padding: "0 4px",
  minHeight: 18,
  display: "inline-block",
  verticalAlign: "bottom",
};

export default function Form1A({ fields, editing, onChange }: Props) {
  function Val({ fkey, style }: { fkey: string; style?: React.CSSProperties }) {
    const v = fields[fkey] || "";
    if (editing)
      return (
        <input
          value={v}
          onChange={(e) => onChange(fkey, e.target.value)}
          style={inp(style)}
        />
      );
    return <span style={{ ...cell, ...style }}>{v || "\u00a0"}</span>;
  }

  const rows: [string, string][] = [
    ["Registry Number", "registry"],
    ["Date of Registration", "date_reg"],
    ["Name of Child", "child_name"],
    ["Sex", "sex"],
    ["Date of Birth", "dob"],
    ["Place of Birth", "pob"],
    ["Name of Mother", "mother_name"],
    ["Nationality of Mother", "mother_nat"],
    ["Name of Father", "father_name"],
    ["Nationality of Father", "father_nat"],
    ["Date of Marriage of Parents", "marriage_date"],
    ["Place of Marriage of Parents", "marriage_place"],
  ];

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: 13,
        color: "#111",
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>
        LCR Form No. 1A
        <br />
        (Birth available)
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div>Republic of the Philippines</div>
        <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 0.3 }}>
          Office of the City Registrar
        </div>
        <div>
          {editing ? (
            <input
              value={fields.city || ""}
              onChange={(e) => onChange("city", e.target.value)}
              style={inp({ textAlign: "center", width: "auto" })}
            />
          ) : (
            <span>{fields.city || "\u00a0"}</span>
          )}
        </div>
      </div>

      <div style={{ textAlign: "right", margin: "10px 0 16px" }}>
        Date&nbsp;
        {editing ? (
          <input
            value={fields.date || ""}
            onChange={(e) => onChange("date", e.target.value)}
            style={inp({ minWidth: 140, width: "auto" })}
          />
        ) : (
          <span
            style={{
              display: "inline-block",
              borderBottom: "1px solid #111",
              minWidth: 140,
              marginLeft: 4,
            }}
          >
            {fields.date || "\u00a0"}
          </span>
        )}
      </div>

      <div style={{ fontWeight: "bold", marginBottom: 8 }}>
        TO WHOM IT MAY CONCERN:
      </div>
      <div style={{ textIndent: "2em", marginBottom: 4 }}>
        We certify that, among others, the following facts of birth appear in
        our Registry of Births on
      </div>
      <div style={{ marginBottom: 18 }}>
        Page:
        <span
          style={{
            display: "inline-block",
            borderBottom: "1px solid #111",
            minWidth: 70,
            margin: "0 4px",
          }}
        >
          &nbsp;
        </span>
        of Book no:
        <span
          style={{
            display: "inline-block",
            borderBottom: "1px solid #111",
            minWidth: 70,
            margin: "0 4px",
          }}
        >
          &nbsp;
        </span>
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}
      >
        <tbody>
          {rows.map(([label, key]) => (
            <tr key={key}>
              <td
                style={{
                  width: "40%",
                  whiteSpace: "nowrap",
                  padding: "4px 0",
                  verticalAlign: "bottom",
                }}
              >
                {label}
              </td>
              <td
                style={{
                  width: 18,
                  textAlign: "center",
                  padding: "4px 0",
                  verticalAlign: "bottom",
                }}
              >
                :
              </td>
              <td style={{ padding: "4px 0", verticalAlign: "bottom" }}>
                <Val fkey={key} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 20, lineHeight: 2 }}>
        This certification is issued to&nbsp;
        {editing ? (
          <input
            value={fields.issued_to || ""}
            onChange={(e) => onChange("issued_to", e.target.value)}
            style={inp({ minWidth: 280, width: "auto" })}
          />
        ) : (
          <span
            style={{
              display: "inline-block",
              borderBottom: "1px solid #111",
              minWidth: 280,
              margin: "0 4px",
              verticalAlign: "bottom",
            }}
          >
            {fields.issued_to || "\u00a0"}
          </span>
        )}
        &nbsp;upon his/her request.
      </div>

      <div style={{ marginBottom: 8 }}>
        Verified by:
        <div
          style={{
            borderBottom: "1px solid #111",
            width: 200,
            margin: "10px 0 0 10px",
            height: 18,
          }}
        >
          {editing ? (
            <input
              value={fields.verified_by || ""}
              onChange={(e) => onChange("verified_by", e.target.value)}
              style={inp()}
            />
          ) : (
            fields.verified_by
          )}
        </div>
        <div
          style={{
            borderBottom: "1px solid #111",
            width: 200,
            margin: "6px 0 0 10px",
            height: 18,
          }}
        >
          {editing ? (
            <input
              value={fields.verified_pos || ""}
              onChange={(e) => onChange("verified_pos", e.target.value)}
              style={inp()}
            />
          ) : (
            fields.verified_pos
          )}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        {(
          [
            ["Amount Paid", "amount"],
            ["OR Number", "or_number"],
            ["Date Paid", "date_paid"],
          ] as [string, string][]
        ).map(([label, key]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ width: 110 }}>{label}</span>
            <span>:</span>
            {editing ? (
              <input
                value={fields[key] || ""}
                onChange={(e) => onChange(key, e.target.value)}
                style={inp({ minWidth: 110, width: "auto" })}
              />
            ) : (
              <span
                style={{
                  borderBottom: "1px solid #111",
                  minWidth: 110,
                  height: 18,
                  display: "inline-block",
                }}
              >
                {fields[key]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 30, fontStyle: "italic" }}>
        Note: A Mark, erasure or alteration of any entry invalidates this
        certification.
      </div>
    </div>
  );
}
