'use client'

interface Props {
  fields: Record<string, string>
  editing: boolean
  onChange: (key: string, value: string) => void
}

const td: React.CSSProperties = { border: '1px solid #333', padding: '3px 5px', verticalAlign: 'top', fontSize: 10 }
const fieldFull: React.CSSProperties = { display: 'block', borderBottom: '1px solid #333', minHeight: 14, width: '100%', marginTop: 2 }
const hint: React.CSSProperties = { fontSize: 8, color: '#555', fontStyle: 'italic', display: 'block' }
const fieldLine: React.CSSProperties = { display: 'inline-block', borderBottom: '1px solid #333', minWidth: 80, height: 12 }

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: 'none', borderBottom: '1px solid #333', outline: 'none',
  background: 'transparent', fontFamily: 'Arial, sans-serif', fontSize: 10,
  width: '100%', display: 'block', marginTop: 2, ...extra,
})

export default function Form90({ fields, editing, onChange }: Props) {
  function GV({ fkey }: { fkey: string }) {
    const v = fields[fkey] || ''
    return editing
      ? <input value={v} onChange={e => onChange(fkey, e.target.value)} style={inp()} />
      : <div style={fieldFull}>{v}</div>
  }

  // rows: [label, groomKey, brideKey]
  const rows: [string, string, string][] = [
    ['1. Name of Applicant',                      'groom_name',       'bride_name'],
    ['2. Age',                                    'groom_age',        'bride_age'],
    ['3. Sex / Citizenship',                      'groom_nat',        'bride_nat'],
    ['4. Name of Father',                         'groom_father',     'bride_father'],
    ['5. Citizenship of Father',                  'groom_father_nat', 'bride_father_nat'],
    ['6. Maiden Name of Mother',                  'groom_mother',     'bride_mother'],
    ['7. Citizenship of Mother',                  'groom_mother_nat', 'bride_mother_nat'],
  ]

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#111' }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #333', padding: '4px 6px' }}>
        <div style={{ fontSize: 8, color: '#333', minWidth: 120 }}>Municipal Form 90 (Form No. 2)<br />(Revised January 2007)</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 9 }}>Republic of the Philippines</div>
          <div style={{ fontSize: 9 }}>OFFICE OF THE CIVIL REGISTRAR GENERAL</div>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>APPLICATION FOR MARRIAGE LICENSE</div>
        </div>
        <div style={{ fontSize: 8, color: '#333', fontStyle: 'italic', textAlign: 'right', minWidth: 130 }}>(To be accomplished in quadruplicate<br />using black ink)</div>
      </div>

      {/* META ROWS */}
      {[
        ['Province:', null, 200, 'Registry No.:', 'registry', 100],
        ['City/Municipality:', 'city', 300, null, null, 0],
        ['Marriage License No.:', 'license_no', 200, 'Date of Issuance:', 'date', 120],
        ['Date of Receipt:', 'date_reg', 160, null, null, 0],
      ].map(([lbl1, key1, w1, lbl2, key2, w2], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', borderBottom: '1px solid #333', fontSize: 9 }}>
          <span>
            <span style={{ fontWeight: 'bold' }}>{lbl1} </span>
            {key1
              ? editing
                ? <input value={fields[key1 as string] || ''} onChange={e => onChange(key1 as string, e.target.value)} style={{ border: 'none', borderBottom: '1px solid #333', outline: 'none', minWidth: w1 as number, fontSize: 9 }} />
                : <span style={{ ...fieldLine, minWidth: w1 as number }}>{fields[key1 as string]}</span>
              : <span style={fieldLine}>&nbsp;</span>}
          </span>
          {lbl2 && (
            <span>
              <span style={{ fontWeight: 'bold' }}>{lbl2} </span>
              {key2
                ? editing
                  ? <input value={fields[key2 as string] || ''} onChange={e => onChange(key2 as string, e.target.value)} style={{ border: 'none', borderBottom: '1px solid #333', outline: 'none', minWidth: w2 as number, fontSize: 9 }} />
                  : <span style={{ ...fieldLine, minWidth: w2 as number }}>{fields[key2 as string]}</span>
                : <span style={fieldLine}>&nbsp;</span>}
            </span>
          )}
        </div>
      ))}

      {/* MAIN TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {/* Column headers */}
          <tr>
            <td style={{ ...td, width: '38%', background: '#f5f5f5', fontWeight: 'bold', fontSize: 11, textAlign: 'center', borderBottom: '2px solid #333' }}>GROOM</td>
            <td style={{ ...td, width: '24%', background: '#fafafa', textAlign: 'center', fontSize: 9, borderLeft: '2px solid #333', borderRight: '2px solid #333' }}></td>
            <td style={{ ...td, width: '38%', background: '#f5f5f5', fontWeight: 'bold', fontSize: 11, textAlign: 'center', borderBottom: '2px solid #333' }}>BRIDE</td>
          </tr>

          {/* Data rows */}
          {rows.map(([label, gKey, bKey]) => (
            <tr key={gKey}>
              <td style={td}><GV fkey={gKey} /></td>
              <td style={{ ...td, background: '#fafafa', textAlign: 'center', fontSize: 9, borderLeft: '2px solid #333', borderRight: '2px solid #333', fontWeight: 'bold' }}>{label}</td>
              <td style={td}><GV fkey={bKey} /></td>
            </tr>
          ))}

          {/* Date and Place of Marriage */}
          <tr>
            <td colSpan={3} style={{ ...td, fontSize: 9, fontWeight: 'bold', background: '#fafafa' }}>DATE AND PLACE OF MARRIAGE</td>
          </tr>
          <tr>
            <td style={td}>
              <span style={hint}>Date of Marriage</span>
              {editing
                ? <input value={fields.dom || ''} onChange={e => onChange('dom', e.target.value)} style={inp()} />
                : <div style={fieldFull}>{fields.dom}</div>}
            </td>
            <td style={{ ...td, borderLeft: '2px solid #333', borderRight: '2px solid #333' }}></td>
            <td style={td}>
              <span style={hint}>Place of Marriage</span>
              {editing
                ? <input value={fields.pom || ''} onChange={e => onChange('pom', e.target.value)} style={inp()} />
                : <div style={fieldFull}>{fields.pom}</div>}
            </td>
          </tr>

          {/* Signature row */}
          <tr>
            <td style={td}>
              <div style={{ marginBottom: 8, borderBottom: '1px solid #333', textAlign: 'center', paddingBottom: 2, fontSize: 9 }}>&nbsp;</div>
              <div style={{ textAlign: 'center', fontSize: 8, fontStyle: 'italic' }}>(Signature of Applicant)</div>
              <div style={{ marginTop: 16, borderBottom: '1px solid #333', textAlign: 'center' }}>&nbsp;</div>
              <div style={{ textAlign: 'center', fontSize: 8, fontStyle: 'italic' }}>(Signature Over Printed Name of the Civil Registrar)</div>
            </td>
            <td style={{ ...td, borderLeft: '2px solid #333', borderRight: '2px solid #333', textAlign: 'center' }}>
              <div style={{ border: '1px solid #333', padding: '4px', fontSize: 8, textAlign: 'center', margin: 4 }}>Exempt from<br />documentary<br />stamp tax</div>
            </td>
            <td style={td}>
              <div style={{ marginBottom: 8, borderBottom: '1px solid #333', textAlign: 'center', paddingBottom: 2, fontSize: 9 }}>&nbsp;</div>
              <div style={{ textAlign: 'center', fontSize: 8, fontStyle: 'italic' }}>(Signature of Applicant)</div>
              <div style={{ marginTop: 16, borderBottom: '1px solid #333', textAlign: 'center' }}>&nbsp;</div>
              <div style={{ textAlign: 'center', fontSize: 8, fontStyle: 'italic' }}>(Signature Over Printed Name of the Civil Registrar)</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
