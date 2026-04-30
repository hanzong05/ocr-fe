"use client";
interface Props {
  fields: Record<string, string>;
  confidence?: Record<string, number>;
  editing: boolean;
  onChange: (key: string, value: string) => void;
}

/* ─── style tokens ──────────────────────────────────────────────── */
const BOOKMAN: React.CSSProperties = {
  fontFamily: '"Bookman Old Style", Bookman, Georgia, serif',
};
const page: React.CSSProperties = {
  ...BOOKMAN,
  width: "8.5in",
  minHeight: "13in",
  margin: "0 auto",
  padding: "0.5in",
  fontSize: "10pt",
  background: "white",
  color: "#000",
  boxSizing: "border-box",
};
const pFormNo: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "11pt",
  display: "flex",
  justifyContent: "space-between",
};
const pTnrBoldCenter: React.CSSProperties = {
  fontFamily: '"Times New Roman", serif',
  fontSize: "11pt",
  fontWeight: "bold",
  textAlign: "center",
  margin: 0,
  padding: 0,
};
const pBody: React.CSSProperties = {
  ...BOOKMAN,
  fontSize: "10pt",
  fontStyle: "italic",
  lineHeight: 2,
  textIndent: "0.5in",
  margin: 0,
  padding: 0,
};
const norm: React.CSSProperties = { fontStyle: "normal" };
const u: React.CSSProperties = {
  textDecoration: "underline",
  fontStyle: "normal",
};
const iu: React.CSSProperties = {
  textDecoration: "underline",
  fontStyle: "italic",
};
const spacer: React.CSSProperties = { lineHeight: 2, fontSize: "10pt" };
const pSigDots: React.CSSProperties = {
  ...BOOKMAN,
  fontSize: "10pt",
  lineHeight: 1.5,
  textAlign: "right",
};
const pRegistry: React.CSSProperties = {
  ...BOOKMAN,
  fontSize: "10pt",
  lineHeight: 1.5,
};
const pHrule: React.CSSProperties = {
  border: "none",
  borderBottom: "1px solid black",
  lineHeight: 1.5,
  fontSize: "10pt",
};
const pInstrLabel: React.CSSProperties = {
  ...BOOKMAN,
  fontSize: "10pt",
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: 1.2,
  margin: 0,
};
const pInstrBody: React.CSSProperties = {
  ...BOOKMAN,
  fontSize: "8pt",
  lineHeight: 2,
  textIndent: "0.5in",
  margin: 0,
};

/* ─── field component — defined OUTSIDE parent ──────────────────── */
interface FieldProps {
  fkey: string;
  fields: Record<string, string>;
  confidence?: Record<string, number>; // ADD THIS
  editing: boolean;
  onChange: (k: string, v: string) => void;
  inputWidth?: string | number;
}
function Accuracy({ value }: { value?: number }) {
  if (value == null) return null;

  const percent = Math.round(value * 100);

  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 10,
        fontWeight: "bold",
        color: percent >= 85 ? "green" : percent >= 70 ? "orange" : "red",
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
function Field({
  fkey,
  fields,
  confidence,
  editing,
  onChange,
  inputWidth,
}: FieldProps) {
  const val = fields[fkey] ?? "";

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {editing ? (
        <input
          type="text"
          value={val}
          onChange={(e) => onChange(fkey, e.target.value)}
          style={{
            border: "none",
            borderBottom: "1px solid #333",
            outline: "none",
            background: "transparent",
            fontFamily: '"Bookman Old Style", Bookman, Georgia, serif',
            fontSize: "10pt",
            width: inputWidth ?? 160,
          }}
        />
      ) : (
        <span style={{ textDecoration: "underline" }}>
          {val || "\u00a0\u00a0\u00a0\u00a0"}
        </span>
      )}

      {/* 👇 ADD THIS */}
      <Accuracy
        value={
          confidence?.[fkey] ??
          confidence?.[confidenceKeyMap[fkey]]
        }
      />
    </span>
  );
}

function parseDateParts(dateStr: string) {
  if (!dateStr) return { day: "", month: "", year: "" };
  const mdy = dateStr.match(/^(\w+)\s+(\d{1,2})[,\s]\s*(\d{4})$/);
  if (mdy) return { day: mdy[2], month: mdy[1], year: mdy[3] };
  const dmy = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (dmy) return { day: dmy[1], month: dmy[2], year: dmy[3] };
  const d = new Date(dateStr + "T00:00:00");
  if (!isNaN(d.getTime())) {
    return {
      day: String(d.getDate()),
      month: d.toLocaleString("en-US", { month: "long" }),
      year: String(d.getFullYear()),
    };
  }
  return { day: "", month: "", year: "" };
}

export default function Form90({ fields, confidence, editing, onChange }: Props) {

  const gv = (fkey: string, w?: string | number) => (
    <Field
      fkey={fkey}
      fields={fields}
      confidence={confidence} // ADD THIS
      editing={editing}
      onChange={onChange}
      inputWidth={w}
    />
  );

  return (
    <div style={page}>
      <p style={pFormNo}>
        <span style={{ fontFamily: "Arial, sans-serif" }}>
          ACCOUNTABLE FORM No. 54
        </span>
        <span
          style={{ fontFamily: '"Times New Roman", serif', fontSize: "11pt" }}
        >
          FORM NO. 10
        </span>
      </p>
      <p style={pTnrBoldCenter}>REPUBLIC OF THE PHILIPPINES</p>
      <p style={pTnrBoldCenter}>
        <strong>
          CITY OR MUNICIPALITY OF{" "}
          <span style={u}>{gv("city", 180) || "...................."}</span>
        </strong>
      </p>
      <p style={pTnrBoldCenter}>
        <strong>
          PROVINCE OF{" "}
          <span style={u}>{gv("province", 200) || "...................."}</span>
        </strong>
      </p>
      <p style={{ ...pTnrBoldCenter, textDecoration: "underline" }}>
        ___________
      </p>
      <p style={pTnrBoldCenter}>
        MARRIAGE LICENSE AND FEE RECEIPT
        <br />
        OF TWO PESOS
      </p>
      <p style={{ ...pTnrBoldCenter, textDecoration: "underline" }}>
        __________
      </p>
      <p style={spacer}>&nbsp;</p>
      <p style={pBody}>
        <span style={norm}>THIS IS TO CERTIFY </span>that{" "}
        {gv("groom_name", 180) || "...................."} aged{" "}
        {gv("groom_age", 40) || "...................."} years and resident of{" "}
        {gv("groom_residence", 200) || "...................."} may legally
        contract marriage with {gv("bride_name", 180) || "...................."}{" "}
        aged {gv("bride_age", 40) || "...................."} years and resident
        of {gv("bride_residence", 200) || "...................."} he having paid
        the license fee of ₱2.00 prescribed under Article 65 of Republic Act No.
        386.
      </p>
      <p style={pBody}>
        This license shall be valid in any part of the Philippines, but it shall
        be good for no more than one hundred and twenty days from the date on
        which issued and shall be deemed cancelled at the expiration of said
        period if the interested parties have not made use of it.
      </p>
      <p style={pBody}>
        As integral parts of this license, there are herewith attached copies of
        the applications of the contracting parties, and copies of the
        .............................................
      </p>
      <p style={pBody}>
        <span style={norm}>IN WITNESS WHEREOF, </span>I have signed and issued
        this license, this&nbsp;&nbsp;
        <span style={iu}>{gv("date", 300) || "...................."}</span>
      </p>
      <p style={spacer}>&nbsp;</p>
      <p style={spacer}>&nbsp;</p>
      <p style={spacer}>&nbsp;</p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <p style={{ ...pRegistry, margin: 0 }}>
          Register No.______________{" "}
          <span style={u}>{gv("registry", 100)}</span> ______________
        </p>
        <div style={{ textAlign: "right" }}>
          <p style={{ ...pSigDots, margin: 0 }}></p>
          <p style={{ ...pSigDots, margin: 0, fontStyle: "normal" }}>
            Local Civil Registrar of <span style={u}>{gv("city", 160)}</span>
          </p>
        </div>
      </div>
      <p style={pHrule}>&nbsp;</p>
      <p style={pInstrLabel}>INSTRUCTION</p>
      <p style={{ ...pInstrLabel, textDecoration: "underline" }}>_________</p>
      <p style={{ ...spacer, lineHeight: 1.5 }}>&nbsp;</p>
      <p style={pInstrBody}>
        If males above 20 but under 25 years of age, or females above 18 but
        under 23 years of age, did not obtain advice of their parents or
        guardian, or if it be unfavorable, a note above the signature of the
        Local Civil Registrar should be indicated in the following manner:
        &ldquo;Note: The advice upon the intended marriage of
        …………………………………………&rdquo; with
        …………………………………………………………………………………………………………………… not having been obtained or
        having been refused, the marriage shall not take place till after three
        months following completion of the publication, on ………………………… 20 ………… of
        the application for the marriage license.
      </p>
    </div>
  );
}
