'use client'

interface Props {
  fields: Record<string, string>
  editing: boolean
  onChange: (key: string, value: string) => void
}

const serif: React.CSSProperties = { fontFamily: '"Georgia", "Bookman Old Style", serif' }

export default function Form90({ fields, editing, onChange }: Props) {
  function F({ fkey, style }: { fkey: string; style?: React.CSSProperties }) {
    const v = fields[fkey] || ''
    const base: React.CSSProperties = {
      display: 'inline-block', borderBottom: '1px solid #555',
      minWidth: 100, background: v ? '#fffde7' : 'transparent', ...style,
    }
    return editing
      ? <input value={v} onChange={e => onChange(fkey, e.target.value)}
               style={{ border: 'none', borderBottom: '1px solid #333', outline: 'none', background: '#fffde7', fontFamily: 'Georgia, serif', fontSize: 11, minWidth: (style?.minWidth ?? 100) as number }} />
      : <span style={base}>{v || '\u00a0'}</span>
  }

  return (
    <div style={{ ...serif, fontSize: 11, color: '#111', maxWidth: 680, margin: '0 auto', padding: '20px 30px' }}>
      {/* Header */}
      <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, overflow: 'hidden', margin: '0 0 2px' }}>
        ACCOUNTABLE FORM No. 54
        <span style={{ float: 'right' }}>FORM NO. 10</span>
      </p>
      <p style={{ textAlign: 'center', margin: '2px 0', ...serif }}>REPUBLIC OF THE PHILIPPINES</p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '2px 0' }}>
        CITY OR MUNICIPALITY OF <F fkey="city" style={{ minWidth: 140 }} />
      </p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '2px 0' }}>
        PROVINCE OF <F fkey="province" style={{ minWidth: 140 }} />
      </p>
      <p style={{ textAlign: 'center', margin: '4px 0' }}><u>___________</u></p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, margin: '4px 0' }}>
        MARRIAGE LICENSE AND FEE RECEIPT<br />OF TWO PESOS
      </p>
      <p style={{ textAlign: 'center', margin: '4px 0' }}><u>__________</u></p>
      <br />

      {/* Body paragraphs */}
      <p style={{ fontStyle: 'italic', lineHeight: 2.2, textIndent: 40, margin: '8px 0' }}>
        <strong style={{ fontStyle: 'normal' }}>THIS IS TO CERTIFY</strong> that …… <F fkey="groom_name" style={{ minWidth: 160 }} /> ……,
        aged <F fkey="groom_age" style={{ minWidth: 40 }} /> years and resident of …… <F fkey="groom_residence" style={{ minWidth: 180 }} /> ……,
        may legally contract marriage with …… <F fkey="bride_name" style={{ minWidth: 160 }} /> ……,
        aged <F fkey="bride_age" style={{ minWidth: 40 }} /> years and resident of …… <F fkey="bride_residence" style={{ minWidth: 180 }} /> ……,
        he having paid the license fee of ₱2.00 prescribed under Article 65 of Republic Act No. 386.
      </p>

      <p style={{ fontStyle: 'italic', lineHeight: 2.2, textIndent: 40, margin: '8px 0' }}>
        This license shall be valid in any part of the Philippines, but it shall be good for no more than one
        hundred and twenty days from the date on which issued and shall be deemed cancelled at the expiration
        of said period if the interested parties have not made use of it.
      </p>

      <p style={{ fontStyle: 'italic', lineHeight: 2.2, textIndent: 40, margin: '8px 0' }}>
        As integral parts of this license, there are herewith attached copies of the applications of the
        contracting parties, and copies of the ………………………………………………………………………………………………………………..
      </p>

      <p style={{ fontStyle: 'italic', lineHeight: 2.2, textIndent: 40, margin: '8px 0' }}>
        <strong style={{ fontStyle: 'normal' }}>IN WITNESS WHEREOF,</strong> I have signed and issued this license, this……
        <F fkey="ml_day" style={{ minWidth: 40 }} />…… day of ……<F fkey="ml_month" style={{ minWidth: 80 }} />……,{' '}
        <F fkey="ml_year" style={{ minWidth: 50 }} />.
      </p>

      <br /><br /><br />

      {/* Signature */}
      <p style={{ textAlign: 'right', margin: '4px 0' }}>………………………………………</p>

      <p style={{ lineHeight: 1.8, margin: '4px 0' }}>
        Register No. …… <F fkey="registry" style={{ minWidth: 100 }} /> ……
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Local Civil Registrar of <F fkey="city" style={{ minWidth: 120 }} />
      </p>

      <hr style={{ border: 'none', borderBottom: '1px solid #333', margin: '8px 0' }} />

      <p style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 10, margin: '4px 0' }}>INSTRUCTION</p>
      <p style={{ fontSize: 9, lineHeight: 1.8, textIndent: 40, margin: '4px 0' }}>
        If males above 20 but under 25 years of age, or females above 18 but under 23 years of age, did not
        obtain advice of their parents or guardian, or if it be unfavorable, a note above the signature of the
        Local Civil Registrar should be indicated.
      </p>
    </div>
  )
}
