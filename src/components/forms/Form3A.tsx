'use client'

interface Props {
  fields: Record<string, string>
  editing: boolean
  onChange: (key: string, value: string) => void
}

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: 'none', borderBottom: '1px solid #111', outline: 'none',
  background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13,
  width: '100%', ...extra,
})

const cell: React.CSSProperties = {
  borderBottom: '1px solid #111', width: 180, padding: '0 4px', minHeight: 18,
  display: 'inline-block', verticalAlign: 'bottom',
}

export default function Form3A({ fields, editing, onChange }: Props) {
  function V({ fkey }: { fkey: string }) {
    const v = fields[fkey] || ''
    if (editing) return <input value={v} onChange={e => onChange(fkey, e.target.value)} style={inp()} />
    return <span style={cell}>{v || '\u00a0'}</span>
  }

  // rows: [label, husbandKey, wifeKey]
  const partyRows: [string, string, string][] = [
    ['Name',                  'husband_name',       'wife_name'],
    ['Age',                   'husband_age',        'wife_age'],
    ['Nationality',           'husband_nat',        'wife_nat'],
    ['Name of Mother',        'husband_mother',     'wife_mother'],
    ['Nationality of Mother', 'husband_mother_nat', 'wife_mother_nat'],
    ['Name of Father',        'husband_father',     'wife_father'],
    ['Nationality of Father', 'husband_father_nat', 'wife_father_nat'],
  ]

  const singleRows: [string, string][] = [
    ['Registry Number',    'registry'],
    ['Date of Registration', 'date_reg'],
    ['Date of Marriage',   'dom'],
    ['Place of Marriage',  'pom'],
  ]

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 13, color: '#111', lineHeight: 1.5 }}>
      <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>LCR Form No. 3A<br />(Marriage available)</div>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div>Republic of the Philippines</div>
        <div style={{ fontSize: 22, fontWeight: 'bold' }}>Office of the City Registrar</div>
        <div>
          {editing
            ? <input value={fields.city || ''} onChange={e => onChange('city', e.target.value)} style={inp({ textAlign: 'center', width: 'auto' })} />
            : <span>{fields.city || '\u00a0'}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: 13, margin: '10px 0 16px' }}>
        Date&nbsp;
        {editing
          ? <input value={fields.date || ''} onChange={e => onChange('date', e.target.value)} style={inp({ minWidth: 140, width: 'auto' })} />
          : <span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 140, marginLeft: 4 }}>{fields.date || '\u00a0'}</span>}
      </div>

      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>TO WHOM IT MAY CONCERN:</div>
      <div style={{ textIndent: '2em', marginBottom: 4 }}>We certify that, among others, the following facts of marriage appear in our Registry of</div>
      <div style={{ marginBottom: 18 }}>
        Marriage on Page:<span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 70, margin: '0 4px' }}>&nbsp;</span>of Book no:<span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 70, margin: '0 4px' }}>&nbsp;</span>
      </div>

      {/* HUSBAND / WIFE two-column table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ width: 200, textAlign: 'left' }}></th>
            <th style={{ width: 18 }}></th>
            <th style={{ width: 180, textAlign: 'center', fontWeight: 'bold', paddingBottom: 6 }}>HUSBAND</th>
            <th style={{ width: 20 }}></th>
            <th style={{ width: 180, textAlign: 'center', fontWeight: 'bold', paddingBottom: 6 }}>WIFE</th>
          </tr>
        </thead>
        <tbody>
          {partyRows.map(([label, hKey, wKey]) => (
            <tr key={hKey}>
              <td style={{ padding: '4px 0', verticalAlign: 'bottom', paddingRight: 4 }}>{label}</td>
              <td style={{ textAlign: 'center', width: 18, verticalAlign: 'bottom' }}>:</td>
              <td style={{ padding: '4px 6px', verticalAlign: 'bottom' }}><V fkey={hKey} /></td>
              <td style={{ width: 20 }}></td>
              <td style={{ padding: '4px 6px', verticalAlign: 'bottom' }}><V fkey={wKey} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Single fields below party table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
        <tbody>
          {singleRows.map(([label, key]) => (
            <tr key={key}>
              <td style={{ width: 120 }}></td>
              <td style={{ width: 180, whiteSpace: 'nowrap', padding: '4px 0', verticalAlign: 'bottom' }}>{label}</td>
              <td style={{ width: 18, textAlign: 'center', verticalAlign: 'bottom' }}>:</td>
              <td style={{ padding: '4px 0', verticalAlign: 'bottom' }}>
                {editing
                  ? <input value={fields[key] || ''} onChange={e => onChange(key, e.target.value)} style={inp()} />
                  : <span style={{ borderBottom: '1px solid #111', minWidth: 200, display: 'inline-block', minHeight: 18 }}>{fields[key] || '\u00a0'}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 2 }}>
        This certification is issued to&nbsp;
        {editing
          ? <input value={fields.issued_to || ''} onChange={e => onChange('issued_to', e.target.value)} style={inp({ minWidth: 280, width: 'auto' })} />
          : <span style={{ display: 'inline-block', borderBottom: '1px solid #111', minWidth: 280, margin: '0 4px', verticalAlign: 'bottom' }}>{fields.issued_to || '\u00a0'}</span>}
        &nbsp;upon his/her request.
      </div>

      <div style={{ fontSize: 13, marginBottom: 8 }}>
        Verified by:
        <div style={{ borderBottom: '1px solid #111', width: 180, margin: '10px 0 0 10px', height: 18 }}>
          {editing ? <input value={fields.verified_by || ''} onChange={e => onChange('verified_by', e.target.value)} style={inp()} /> : fields.verified_by}
        </div>
        <div style={{ borderBottom: '1px solid #111', width: 180, margin: '10px 0 0 10px', height: 18 }}>
          {editing ? <input value={fields.verified_pos || ''} onChange={e => onChange('verified_pos', e.target.value)} style={inp()} /> : fields.verified_pos}
        </div>
      </div>

      <div style={{ marginTop: 28, fontSize: 13 }}>
        {([['Amount Paid', 'amount'], ['OR Number', 'or_number'], ['Date Paid', 'date_paid']] as [string, string][]).map(([label, key]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 100 }}>{label}</span>
            <span style={{ width: 10 }}>:</span>
            {editing
              ? <input value={fields[key] || ''} onChange={e => onChange(key, e.target.value)} style={inp({ minWidth: 110, width: 'auto' })} />
              : <span style={{ borderBottom: '1px solid #111', minWidth: 110, height: 18, display: 'inline-block' }}>{fields[key]}</span>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 30, fontStyle: 'italic' }}>Note: A Mark, erasure or alteration of any entry invalidates this certification.</div>
    </div>
  )
}
