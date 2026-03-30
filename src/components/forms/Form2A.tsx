'use client'

interface Props {
  fields: Record<string, string>
  editing: boolean
  onChange: (key: string, value: string) => void
}

const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: 'none', borderBottom: '1px solid #111', outline: 'none',
  background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13,
  ...extra,
})

const valueStyle: React.CSSProperties = {
  borderBottom: '1px solid #111', minWidth: 260, display: 'inline-block', minHeight: 18,
}

export default function Form2A({ fields, editing, onChange }: Props) {
  function Val({ fkey, bold }: { fkey: string; bold?: boolean }) {
    const v = fields[fkey] || ''
    if (editing) return <input value={v} onChange={e => onChange(fkey, e.target.value)} style={inputStyle({ width: '100%', fontWeight: bold ? 'bold' : 'normal' })} />
    return <span style={{ ...valueStyle, fontWeight: bold ? 'bold' : 'normal' }}>{v || '\u00a0'}</span>
  }

  const rows: [string, string, boolean?][] = [
    ['Registry Number', 'registry'],
    ['Date of Registration', 'date_reg'],
    ['NAME OF DECEASED', 'deceased_name', true],
    ['Sex', 'sex'],
    ['Age', 'age'],
    ['Civil Status', 'civil_status'],
    ['Nationality', 'nationality'],
    ['Date of Death', 'dod'],
    ['Place of Death', 'pod'],
    ['Cause of Death', 'cause'],
  ]

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 13, color: '#111', lineHeight: 1.5 }}>
      <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>LCR Form No. 2A<br />(Death available)</div>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div>Republic of the Philippines</div>
        <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 0.3 }}>Office of the City Registrar</div>
        <div>
          {editing
            ? <input value={fields.city || ''} onChange={e => onChange('city', e.target.value)} style={inputStyle({ textAlign: 'center' })} />
            : <span>{fields.city || '\u00a0'}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: 13, margin: '10px 0 16px' }}>
        Date&nbsp;
        {editing
          ? <input value={fields.date || ''} onChange={e => onChange('date', e.target.value)} style={inputStyle({ minWidth: 140 })} />
          : <span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 140, marginLeft: 4 }}>{fields.date || '\u00a0'}</span>}
      </div>

      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>TO WHOM IT MAY CONCERN:</div>
      <div style={{ textIndent: '2em', marginBottom: 4 }}>We certify that, among others, the following facts of death appear in our Registry of Deaths on</div>
      <div style={{ marginBottom: 18 }}>
        Page:<span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 70, margin: '0 4px' }}>&nbsp;</span>of Book no:<span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 70, margin: '0 4px' }}>&nbsp;</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <tbody>
          {rows.map(([label, key, bold]) => (
            <tr key={key}>
              <td style={{ width: 220, whiteSpace: 'nowrap', fontSize: 13, padding: '4px 0', verticalAlign: 'bottom', fontWeight: bold ? 'bold' : 'normal' }}>{label}</td>
              <td style={{ width: 18, textAlign: 'center', padding: '4px 0', verticalAlign: 'bottom' }}>:</td>
              <td style={{ padding: '4px 0', verticalAlign: 'bottom' }}><Val fkey={key} bold={bold} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 2 }}>
        This certification is issued to&nbsp;
        {editing
          ? <input value={fields.issued_to || ''} onChange={e => onChange('issued_to', e.target.value)} style={inputStyle({ minWidth: 280 })} />
          : <span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 280, margin: '0 4px', verticalAlign: 'bottom' }}>{fields.issued_to || '\u00a0'}</span>}
        &nbsp;upon his/her request.
      </div>

      <div style={{ fontSize: 13, marginBottom: 8 }}>
        Verified by:
        <div style={{ borderBottom: '1px solid #111', width: 180, margin: '10px 0 0 10px', height: 18 }}>
          {editing ? <input value={fields.verified_by || ''} onChange={e => onChange('verified_by', e.target.value)} style={inputStyle({ width: '100%' })} /> : fields.verified_by}
        </div>
        <div style={{ borderBottom: '1px solid #111', width: 180, margin: '10px 0 0 10px', height: 18 }}>
          {editing ? <input value={fields.verified_pos || ''} onChange={e => onChange('verified_pos', e.target.value)} style={inputStyle({ width: '100%' })} /> : fields.verified_pos}
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 13 }}>
        {([['Amount Paid', 'amount'], ['OR Number', 'or_number'], ['Date Paid', 'date_paid']] as [string, string][]).map(([label, key]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 100 }}>{label}</span>
            <span style={{ width: 10 }}>:</span>
            {editing
              ? <input value={fields[key] || ''} onChange={e => onChange(key, e.target.value)} style={inputStyle({ minWidth: 110 })} />
              : <span style={{ borderBottom: '1px solid #111', minWidth: 110, height: 18, display: 'inline-block' }}>{fields[key]}</span>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 30, fontStyle: 'italic' }}>Note: A Mark, erasure or alteration of any entry invalidates this certification.</div>
    </div>
  )
}
