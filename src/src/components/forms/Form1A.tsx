'use client'

interface Props {
  fields: Record<string, string>
  editing: boolean
  onChange: (key: string, value: string) => void
}

const S = {
  paper: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: 13,
    color: '#111',
    lineHeight: 1.5,
  } as React.CSSProperties,
  formRef: { fontSize: 12, lineHeight: 1.4, marginBottom: 10 } as React.CSSProperties,
  header: { textAlign: 'center', marginBottom: 6 } as React.CSSProperties,
  office: { fontSize: 22, fontWeight: 'bold', letterSpacing: 0.3 } as React.CSSProperties,
  dateLine: { textAlign: 'right', fontSize: 13, margin: '10px 0 16px' } as React.CSSProperties,
  dateField: { display: 'inline-block', borderBottom: '1px solid #111', minWidth: 140, marginLeft: 4 } as React.CSSProperties,
  salutation: { fontWeight: 'bold', marginBottom: 8 } as React.CSSProperties,
  introP: { textIndent: '2em', marginBottom: 4 } as React.CSSProperties,
  pageBook: { marginBottom: 18 } as React.CSSProperties,
  blank: { display: 'inline-block', borderBottom: '1px solid #111', minWidth: 70, margin: '0 4px' } as React.CSSProperties,
  value: { borderBottom: '1px solid #111', minWidth: 260, display: 'inline-block', minHeight: 18 } as React.CSSProperties,
  issuance: { fontSize: 13, marginBottom: 20, lineHeight: 2 } as React.CSSProperties,
  blankLong: { display: 'inline-block', borderBottom: '1px solid #111', minWidth: 280, margin: '0 4px', verticalAlign: 'bottom' } as React.CSSProperties,
  verified: { fontSize: 13, marginBottom: 8 } as React.CSSProperties,
  sigLine: { borderBottom: '1px solid #111', width: 180, margin: '10px 0 0 10px', height: 18 } as React.CSSProperties,
  payment: { marginTop: 28, fontSize: 13 } as React.CSSProperties,
  payRow: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 } as React.CSSProperties,
  payBlank: { borderBottom: '1px solid #111', minWidth: 110, height: 18 } as React.CSSProperties,
  note: { fontSize: 12, marginTop: 30, fontStyle: 'italic' } as React.CSSProperties,
}

export default function Form1A({ fields, editing, onChange }: Props) {
  function Val({ fkey, style }: { fkey: string; style?: React.CSSProperties }) {
    const v = fields[fkey] || ''
    if (editing) {
      return (
        <input
          value={v}
          onChange={e => onChange(fkey, e.target.value)}
          style={{ border: 'none', borderBottom: '1px solid #111', outline: 'none', width: '100%', background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13, ...style }}
        />
      )
    }
    return <span style={{ ...S.value, ...style }}>{v || '\u00a0'}</span>
  }

  const rows: [string, string][] = [
    ['Registry Number', 'registry'],
    ['Date of Registration', 'date_reg'],
    ['Name of Child', 'child_name'],
    ['Sex', 'sex'],
    ['Date of Birth', 'dob'],
    ['Place of Birth', 'pob'],
    ['Name of Mother', 'mother_name'],
    ['Nationality of Mother', 'mother_nat'],
    ['Name of Father', 'father_name'],
    ['Nationality of Father', 'father_nat'],
    ['Date of Marriage of Parents', 'marriage_date'],
    ['Place of Marriage of Parents', 'marriage_place'],
  ]

  return (
    <div style={S.paper}>
      <div style={S.formRef}>LCR Form No. 1A<br />(Birth available)</div>

      <div style={S.header}>
        <div>Republic of the Philippines</div>
        <div style={S.office}>Office of the City Registrar</div>
        <div>
          {editing
            ? <input value={fields.city || ''} onChange={e => onChange('city', e.target.value)} style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #111', outline: 'none', background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} />
            : <span>{fields.city || '\u00a0'}</span>}
        </div>
      </div>

      <div style={S.dateLine}>
        Date&nbsp;
        {editing
          ? <input value={fields.date || ''} onChange={e => onChange('date', e.target.value)} style={{ border: 'none', borderBottom: '1px solid #111', outline: 'none', minWidth: 140, background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} />
          : <span style={S.dateField}>{fields.date || '\u00a0'}</span>}
      </div>

      <div style={S.salutation}>TO WHOM IT MAY CONCERN:</div>
      <div style={S.introP}>We certify that, among others, the following facts of birth appear in our Registry of Births on</div>
      <div style={S.pageBook}>
        Page:<span style={S.blank}>&nbsp;</span>of Book no:<span style={S.blank}>&nbsp;</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <tbody>
          {rows.map(([label, key]) => (
            <tr key={key}>
              <td style={{ width: 230, whiteSpace: 'nowrap', fontSize: 13, padding: '4px 0', verticalAlign: 'bottom' }}>{label}</td>
              <td style={{ width: 18, textAlign: 'center', padding: '4px 0', verticalAlign: 'bottom' }}>:</td>
              <td style={{ padding: '4px 0', verticalAlign: 'bottom' }}><Val fkey={key} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.issuance}>
        This certification is issued to&nbsp;
        {editing
          ? <input value={fields.issued_to || ''} onChange={e => onChange('issued_to', e.target.value)} style={{ border: 'none', borderBottom: '1px solid #111', outline: 'none', minWidth: 280, background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} />
          : <span style={S.blankLong}>{fields.issued_to || '\u00a0'}</span>}
        &nbsp;upon his/her request.
      </div>

      <div style={S.verified}>
        Verified by:
        <div style={S.sigLine}>{editing ? <input value={fields.verified_by || ''} onChange={e => onChange('verified_by', e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} /> : fields.verified_by}</div>
        <div style={S.sigLine}>{editing ? <input value={fields.verified_pos || ''} onChange={e => onChange('verified_pos', e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} /> : fields.verified_pos}</div>
      </div>

      <div style={S.payment}>
        {([['Amount Paid', 'amount'], ['OR Number', 'or_number'], ['Date Paid', 'date_paid']] as [string, string][]).map(([label, key]) => (
          <div key={key} style={S.payRow}>
            <span style={{ width: 100 }}>{label}</span>
            <span style={{ width: 10 }}>:</span>
            {editing
              ? <input value={fields[key] || ''} onChange={e => onChange(key, e.target.value)} style={{ border: 'none', borderBottom: '1px solid #111', outline: 'none', minWidth: 110, background: 'transparent', fontFamily: "'Times New Roman', Times, serif", fontSize: 13 }} />
              : <span style={S.payBlank}>{fields[key]}</span>}
          </div>
        ))}
      </div>

      <div style={S.note}>Note: A Mark, erasure or alteration of any entry invalidates this certification.</div>
    </div>
  )
}
