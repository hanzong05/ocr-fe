"use client";
interface Props {
  fields: Record<string, string>;
  confidence?: Record<string, number>;
  editing: boolean;
  onChange: (key: string, value: string) => void;
}
interface VProps {
  fkey: string;
  fields: Record<string, string>;
  confidence?: Record<string, number>;
  editing: boolean;
  onChange: (k: string, v: string) => void;
  style?: React.CSSProperties; // add this
}
function Accuracy({ value }: { value?: number }) {
  if (value == null) return null;

  const percent = Math.round(value * 100);

  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 10,
        color: percent >= 85 ? "green" : percent >= 70 ? "orange" : "red",
        fontWeight: "bold",
      }}
    >
      {percent}%
    </span>
  );
}
const confidenceKeyMap: Record<string, string> = {
  registry: "registry_no",
  date_reg: "date_submitted",
  child_name: "child_first",
  dob: "dob_day",
  pob: "pob_city",
  mother_name: "mother_first",
  mother_nat: "mother_citizenship",
  father_name: "father_first",
  father_nat: "father_citizenship",
  marriage_date: "parents_marriage_month",
  marriage_place: "parents_marriage_city",
};
function V({ fkey, fields, confidence, editing, onChange, style }: VProps) {
  const v = fields[fkey] ?? "";

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {editing ? (
        <input
          type="text"
          value={v}
          onChange={(e) => onChange(fkey, e.target.value)}
          style={inp(style)}
        />
      ) : (
        <span style={{ ...cell, ...style }}></span>
      )}

      <Accuracy
        value={
          confidence?.[fkey] ??
          confidence?.[confidenceKeyMap[fkey]]
        }
      />
    </span>
  );
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
  minWidth: 160,
  padding: "0 4px",
  minHeight: 18,
  display: "inline-block",
  verticalAlign: "bottom",
};

/* ─── defined OUTSIDE Form3A ────────────────────────────────────── */
interface VProps {
  fkey: string;
  fields: Record<string, string>;
  editing: boolean;
  onChange: (k: string, v: string) => void;
}

const partyRows: [string, string, string][] = [
  ["Name", "husband_name", "wife_name"],
  ["Age", "husband_age", "wife_age"],
  ["Nationality", "husband_nat", "wife_nat"],
  ["Name of Mother", "husband_mother", "wife_mother"],
  ["Nationality of Mother", "husband_mother_nat", "wife_mother_nat"],
  ["Name of Father", "husband_father", "wife_father"],
  ["Nationality of Father", "husband_father_nat", "wife_father_nat"],
];

const singleRows: [string, string][] = [
  ["Registry Number", "registry"],
  ["Date of Registration", "date_reg"],
  ["Date of Marriage", "dom"],
  ["Place of Marriage", "pom"],
];

export default function Form1A({ fields, confidence, editing, onChange }: Props) {
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
        LCR Form No. 3A
        <br />
        (Marriage available)
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div>Republic of the Philippines</div>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>
          Office of the City Registrar
        </div>
        <div>
          <V
            fkey="city"
            fields={fields}
            editing={editing}
            onChange={onChange}
          />
        </div>
      </div>

      <div style={{ textAlign: "right", margin: "10px 0 16px" }}>
        Date&nbsp;
        <V fkey="date" fields={fields} confidence={confidence} editing={editing} onChange={onChange} />
      </div>

      <div style={{ fontWeight: "bold", marginBottom: 8 }}>
        TO WHOM IT MAY CONCERN:
      </div>
      <div style={{ textIndent: "2em", marginBottom: 4 }}>
        We certify that, among others, the following facts of marriage appear in
        our Registry of
      </div>
      <div style={{ marginBottom: 18 }}>
        Marriage on Page:
        <V
          fkey="page"
          fields={fields}
          editing={editing}
          onChange={onChange}
          style={{ minWidth: 70, width: "auto", margin: "0 4px" }}
        />
        of Book no:
        <V
          fkey="book_no"
          fields={fields}
          confidence={confidence}
          editing={editing}
          onChange={onChange}
          style={{ minWidth: 70, width: "auto", margin: "0 4px" }}
        />
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 18,
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "30%", textAlign: "left" }}></th>
            <th style={{ width: 18 }}></th>
            <th
              style={{
                textAlign: "center",
                fontWeight: "bold",
                paddingBottom: 6,
              }}
            >
              HUSBAND
            </th>
            <th style={{ width: 12 }}></th>
            <th
              style={{
                textAlign: "center",
                fontWeight: "bold",
                paddingBottom: 6,
              }}
            >
              WIFE
            </th>
          </tr>
        </thead>
        <tbody>
          {partyRows.map(([label, hKey, wKey]) => (
            <tr key={hKey}>
              <td
                style={{
                  padding: "4px 0",
                  verticalAlign: "bottom",
                  paddingRight: 4,
                }}
              >
                {label}
              </td>
              <td style={{ textAlign: "center", verticalAlign: "bottom" }}>
                :
              </td>
              <td style={{ padding: "4px 4px", verticalAlign: "bottom" }}>
                <V
                  fkey={hKey}
                  confidence={confidence}
                  fields={fields}
                  editing={editing}
                  onChange={onChange}
                />
              </td>
              <td></td>
              <td style={{ padding: "4px 4px", verticalAlign: "bottom" }}>
                <V
                  confidence={confidence}
                  fkey={wKey}
                  fields={fields}
                  editing={editing}
                  onChange={onChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
          tableLayout: "fixed",
        }}
      >
        <tbody>
          {singleRows.map(([label, key]) => (
            <tr key={key}>
              <td
                style={{
                  width: "30%",
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
                  verticalAlign: "bottom",
                }}
              >
                :
              </td>
              <td style={{ padding: "4px 0", verticalAlign: "bottom" }}>
                <V
                  confidence={confidence}
                  fkey={key}
                  fields={fields}
                  editing={editing}
                  onChange={onChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 20, lineHeight: 2 }}>
        This certification is issued to&nbsp;
        <V
          confidence={confidence}
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
          <V confidence={confidence}
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
          <V confidence={confidence}
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
            <V confidence={confidence}
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
