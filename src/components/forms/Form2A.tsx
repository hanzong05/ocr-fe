"use client";
interface Props {
  fields: Record<string, string>;
  editing: boolean;
  onChange: (key: string, value: string) => void;
}

const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: "none",
  borderBottom: "1px solid #111",
  outline: "none",
  background: "transparent",
  fontFamily: "'Times New Roman', Times, serif",
  fontSize: "inherit",
  width: "100%",
  ...extra,
});

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #111",
  minWidth: 200,
  padding: "0 4px",
  minHeight: 18,
  display: "inline-block",
  verticalAlign: "bottom",
};

interface ValProps {
  fkey: string;
  fields: Record<string, string>;
  editing: boolean;
  onChange: (k: string, v: string) => void;
  bold?: boolean;
  style?: React.CSSProperties; // make sure this line exists
}

function Val({ fkey, fields, editing, onChange, bold }: ValProps) {
  const v = fields[fkey] ?? "";
  const fw = bold ? "bold" : "normal";
  if (editing)
    return (
      <input
        type="text"
        value={v}
        onChange={(e) => onChange(fkey, e.target.value)}
        style={inputStyle({ fontWeight: fw })}
      />
    );
  return <span style={{ ...cellStyle, fontWeight: fw }}>{v || "\u00a0"}</span>;
}

const rows: [string, string, boolean?][] = [
  ["Registry Number", "registry"],
  ["Date of Registration", "date_reg"],
  ["NAME OF DECEASED", "deceased_name", true],
  ["Sex", "sex"],
  ["Age", "age"],
  ["Civil Status", "civil_status"],
  ["Nationality", "nationality"],
  ["Date of Death", "dod"],
  ["Place of Death", "pod"],
  ["Cause of Death", "cause"],
];

export default function Form2A({ fields, editing, onChange }: Props) {
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
        LCR Form No. 2A
        <br />
        (Death available)
      </div>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div>Republic of the Philippines</div>
        <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 0.3 }}>
          Office of the City Registrar
        </div>
        <Val
          fkey="city"
          fields={fields}
          editing={editing}
          onChange={onChange}
        />
      </div>
      <div style={{ textAlign: "right", margin: "10px 0 16px" }}>
        Date&nbsp;
        <Val
          fkey="date"
          fields={fields}
          editing={editing}
          onChange={onChange}
        />
      </div>
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>
        TO WHOM IT MAY CONCERN:
      </div>
      <div style={{ textIndent: "2em", marginBottom: 4 }}>
        We certify that, among others, the following facts of death appear in
        our Registry of Deaths on
      </div>
      <div style={{ marginBottom: 18 }}>
        Page:
        <Val
          fkey="page"
          fields={fields}
          editing={editing}
          onChange={onChange}
          style={{ minWidth: 70, width: "auto", margin: "0 4px" }}
        />
        of Book no:
        <Val
          fkey="book_no"
          fields={fields}
          editing={editing}
          onChange={onChange}
          style={{ minWidth: 70, width: "auto", margin: "0 4px" }}
        />
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}
      >
        <tbody>
          {rows.map(([label, key, bold]) => (
            <tr key={key}>
              <td
                style={{
                  width: "40%",
                  whiteSpace: "nowrap",
                  padding: "4px 0",
                  verticalAlign: "bottom",
                  fontWeight: bold ? "bold" : "normal",
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
                <Val
                  fkey={key}
                  fields={fields}
                  editing={editing}
                  onChange={onChange}
                  bold={bold}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginBottom: 20, lineHeight: 2 }}>
        This certification is issued to&nbsp;
        <Val
          fkey="issued_to"
          fields={fields}
          editing={editing}
          onChange={onChange}
        />
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
          <Val
            fkey="verified_by"
            fields={fields}
            editing={editing}
            onChange={onChange}
          />
        </div>
        <div
          style={{
            borderBottom: "1px solid #111",
            width: 200,
            margin: "6px 0 0 10px",
            height: 18,
          }}
        >
          <Val
            fkey="verified_pos"
            fields={fields}
            editing={editing}
            onChange={onChange}
          />
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
            <Val
              fkey={key}
              fields={fields}
              editing={editing}
              onChange={onChange}
            />
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
