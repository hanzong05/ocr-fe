import { ProcessResult, FormClass, LcrRecord } from './types'
import { supabase } from './supabase'


// ── HF Space OCR ──────────────────────────────────────────────
const HF_API_URL = 'https://ifgr003-ocr.hf.space/process'

// ── HF Space OCR ──────────────────────────────────────────────
export async function processDocument(
  file: File,
  formHint?: string
): Promise<ProcessResult> {
  const body = new FormData()
  body.append('file', file)
  if (formHint) body.append('form_hint', formHint)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000)

  try {
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      body,
      signal: controller.signal,
    })

    let result: any = null
    try {
      result = await res.json()
    } catch {
      result = null
    }

    // backend returned a proper user-facing error
    if (result?.status === 'error') {
      throw new Error(result.message ?? 'Processing failed. Please try again.')
    }

    // non-JSON / server-level HTTP error
    if (!res.ok) {
      throw new Error(`OCR server error: ${res.status}`)
    }

    return result
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'The OCR server is taking too long to respond (over 5 minutes). Please try again.'
      )
    }

    // preserve real backend/user errors
    if (err instanceof Error) {
      throw err
    }

    throw new Error('Could not reach the OCR server. Check your internet connection.')
  } finally {
    clearTimeout(timeoutId)
  }
}
// ── Field assembly (maps API fields → display values) ─────────
const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(' ').trim()

const date3 = (m?: string, d?: string, y?: string) =>
  [m, d ? d + ',' : '', y].filter(Boolean).join(' ').trim()

const place2 = (a?: string, b?: string) =>
  [a, b].filter(Boolean).join(', ')

const cleanCause = (v?: string) =>
  (v || '')
    .replace(/\/+$/g, '')   // remove only ending slash
    .trim()

export function assembleConfidence(
  formClass: FormClass,
  c: Record<string, number>
): Record<string, number> {
  const shared = {
    city: c.city_municipality,
    date: c.date_issuance,
    registry: c.registry_no,
    date_reg: c.date_submitted,
  };

  if (formClass === "1A") {
    return {
      ...shared,
      child_name: Math.min(
        c.child_first ?? 1,
        c.child_middle ?? 1,
        c.child_last ?? 1
      ),
      sex: c.sex,
      dob: Math.min(c.dob_month ?? 1, c.dob_day ?? 1, c.dob_year ?? 1),
      pob: Math.min(c.pob_city ?? 1, c.pob_province ?? 1),
      mother_name: Math.min(
        c.mother_first ?? 1,
        c.mother_middle ?? 1,
        c.mother_last ?? 1
      ),
      mother_nat: c.mother_citizenship,
      father_name: Math.min(
        c.father_first ?? 1,
        c.father_middle ?? 1,
        c.father_last ?? 1
      ),
      father_nat: c.father_citizenship,
      marriage_date: Math.min(
        c.parents_marriage_month ?? 1,
        c.parents_marriage_day ?? 1,
        c.parents_marriage_year ?? 1
      ),
      marriage_place: Math.min(
        c.parents_marriage_city ?? 1,
        c.parents_marriage_province ?? 1
      ),
    };
  }

  if (formClass === "3A") {
    return {
      // registry → registry_no via confidenceKeyMap in Form3A
      registry_no:        c.registry_no,
      city:               c.city_municipality,
      husband_name:       Math.min(c.husband_first ?? 1, c.husband_middle ?? 1, c.husband_last ?? 1),
      husband_age:        c.husband_age,
      husband_nat:        c.husband_citizenship,
      husband_mother:     c.husband_mother_first,
      husband_mother_nat: c.husband_mother_citizenship,
      husband_father:     c.husband_father_first,
      husband_father_nat: c.husband_father_citizenship,
      wife_name:          Math.min(c.wife_first ?? 1, c.wife_middle ?? 1, c.wife_last ?? 1),
      wife_age:           c.wife_age,
      wife_nat:           c.wife_citizenship,
      wife_mother:        c.wife_mother_first,
      wife_mother_nat:    c.wife_mother_citizenship,
      wife_father:        c.wife_father_first,
      wife_father_nat:    c.wife_father_citizenship,
      dom:                c.marriage_month,
      // prefer venue confidence; fall back to city if venue was blank
      pom:                c.marriage_venue || c.marriage_city,
    };
  }

  return c;
}
export function assembleFields(
  formClass: FormClass,
  f: Record<string, string>
): Record<string, string> {
  const shared = {
    city: f.city_municipality || '',
    date: f.date_issuance || '',
    registry: f.registry_no || '',
    date_reg: f.date_submitted || f.date_received || '',
    issued_to: f.issued_to || '',
    verified_by: f.processed_by || '',
    verified_pos: f.verified_position || '',
    amount: f.amount_paid || '',
    or_number: f.or_number || '',
    date_paid: f.date_paid || '',
  }

  if (formClass === '1A') {
    return {
      ...shared,
      child_name: join(f.child_first, f.child_middle, f.child_last),
      sex: f.sex || '',
      dob: date3(f.dob_month, f.dob_day, f.dob_year),
      pob: place2(f.pob_city, f.pob_province),
      mother_name: join(f.mother_first, f.mother_middle, f.mother_last),
      mother_nat: f.mother_citizenship || '',
      father_name: join(f.father_first, f.father_middle, f.father_last),
      father_nat: f.father_citizenship || '',
      marriage_date: date3(f.parents_marriage_month, f.parents_marriage_day, f.parents_marriage_year),
      marriage_place: place2(f.parents_marriage_city, f.parents_marriage_province),
    }
  }

  if (formClass === '2A') {
    return {
      ...shared,
      deceased_name: join(f.deceased_first, f.deceased_middle, f.deceased_last),
      sex: f.sex || '',
      age: f.age_years || '',
      civil_status: f.civil_status || '',
      nationality: f.citizenship || '',
      dod: f.dod_full || date3(f.dod_month, f.dod_day, f.dod_year),
      pod: f.pod_hospital || place2(f.pod_city, f.pod_province),
      cause: cleanCause(f.cause_immediate),
    }
  }

  if (formClass === '3A') {
    return {
      ...shared,
      date_reg: '',
      dom: date3(f.marriage_month, f.marriage_day, f.marriage_year),
      pom: place2(f.marriage_venue || f.marriage_city, f.marriage_province),
      husband_name: join(f.husband_first, f.husband_middle, f.husband_last),
      husband_age: f.husband_age || '',
      husband_nat: f.husband_citizenship || '',
      husband_mother: join(f.husband_mother_first, f.husband_mother_last),
      husband_mother_nat: f.husband_mother_citizenship || '',
      husband_father: join(f.husband_father_first, f.husband_father_last),
      husband_father_nat: f.husband_father_citizenship || '',
      wife_name: join(f.wife_first, f.wife_middle, f.wife_last),
      wife_age: f.wife_age || '',
      wife_nat: f.wife_citizenship || '',
      wife_mother: join(f.wife_mother_first, f.wife_mother_last),
      wife_mother_nat: f.wife_mother_citizenship || '',
      wife_father: join(f.wife_father_first, f.wife_father_last),
      wife_father_nat: f.wife_father_citizenship || '',

    }
  }

  // Form 90 — Marriage License (type_id 4)
  return {
    ...shared,
    license_no: f.marriage_license_no || f.license_no || '',
    groom_name: f.groom_name || join(f.groom_name_first, f.groom_name_middle, f.groom_name_last),
    groom_age: f.groom_age || '',
    groom_residence: f.groom_residence || '',
    groom_nat: f.groom_citizenship || '',
    groom_mother: f.groom_mother_name || join(f.groom_mother_first, f.groom_mother_last),
    groom_mother_nat: f.groom_mother_citizenship || '',
    groom_father: f.groom_father_name || join(f.groom_father_first, f.groom_father_last),
    groom_father_nat: f.groom_father_citizenship || '',
    bride_name: f.bride_name || join(f.bride_name_first, f.bride_name_middle, f.bride_name_last),
    bride_age: f.bride_age || '',
    bride_residence: f.bride_residence || '',
    bride_nat: f.bride_citizenship || '',
    bride_mother: f.bride_mother_name || join(f.bride_mother_first, f.bride_mother_last),
    bride_mother_nat: f.bride_mother_citizenship || '',
    bride_father: f.bride_father_name || join(f.bride_father_first, f.bride_father_last),
    bride_father_nat: f.bride_father_citizenship || '',
    // date_issued is split into parts for the form template
    ml_day: f.ml_day || '',
    ml_month: f.ml_month || '',
    ml_year: f.ml_year || '',
    province: f.province || '',
  }
}

// ── document_types mapping ────────────────────────────────────
export const TYPE_ID: Record<string, number> = {
  '1A': 1, '2A': 2, '3A': 3, '90': 4,
}

// ── Database helpers ──────────────────────────────────────────

/**
 * Insert a document + its field values into documents / document_data.
 * Auto-creates any data_fields entries that don't exist yet.
 */
export async function saveDocument(
  userId: number,
  typeId: number,
  fields: Record<string, string>
): Promise<number> {
  // 1. Insert document row
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ user_id: userId, type_id: typeId, status: 'Pending', mnb_confidence_score: 0 })
    .select('doc_id')
    .single()
  if (docErr || !doc) throw new Error(docErr?.message || 'Failed to create document')

  const docId: number = doc.doc_id
  const fieldNames = Object.keys(fields).filter(k => fields[k] !== '')

  if (!fieldNames.length) return docId

  // 2. Fetch existing data_fields entries matching our field names
  const { data: existing } = await supabase
    .from('data_fields')
    .select('field_id, field_name')
    .in('field_name', fieldNames)

  const nameToId: Record<string, number> = {}
  for (const f of existing || []) nameToId[f.field_name] = f.field_id

  // 3. Insert missing field name entries
  const missing = fieldNames.filter(n => !nameToId[n])
  if (missing.length) {
    const { data: created } = await supabase
      .from('data_fields')
      .insert(missing.map(n => ({ field_name: n, data_type: 'text' })))
      .select('field_id, field_name')
    for (const f of created || []) nameToId[f.field_name] = f.field_id
  }

  // 4. Insert document_data rows
  const rows = fieldNames
    .filter(n => nameToId[n] !== undefined)
    .map(n => ({
      doc_id: docId,
      field_id: nameToId[n],
      extracted_value: fields[n],
      ner_confidence_score: 0,
      is_corrected: 0,
    }))

  if (rows.length) {
    const { error: ddErr } = await supabase.from('document_data').insert(rows)
    if (ddErr) throw new Error(ddErr.message)
  }

  return docId
}

/** Derive the display name from form_data based on document type code. */
function deriveName(typeCode: string, form_data: Record<string, string>): string {
  if (typeCode === 'BIRTH') return form_data.child_name || 'Unknown'
  if (typeCode === 'DEATH') return form_data.deceased_name || 'Unknown'
  if (typeCode === 'MARRCERT') return [form_data.husband_name, form_data.wife_name].filter(Boolean).join(' & ') || 'Unknown'
  if (typeCode === 'MARRLIC') return [form_data.groom_name, form_data.bride_name].filter(Boolean).join(' & ') || 'Unknown'
  return 'Unknown'
}

/** Fetch all documents with reconstructed form_data. */
export async function fetchDocuments(): Promise<LcrRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      doc_id, type_id, status, upload_date,
      document_types ( type_code, type_name ),
      document_data ( extracted_value, data_fields ( field_name ) )
    `)
    .order('upload_date', { ascending: false })

  if (error) throw new Error(error.message)

  return (data || []).map((d: Record<string, unknown>) => {
    const form_data: Record<string, string> = {}
    for (const dd of (d.document_data as Array<{ extracted_value: string; data_fields: { field_name: string } | null }>) || []) {
      if (dd.data_fields?.field_name) form_data[dd.data_fields.field_name] = dd.extracted_value
    }
    const dt = d.document_types as { type_code: string; type_name: string } | null
    const typeCode = dt?.type_code || ''
    return {
      doc_id: d.doc_id as number,
      type_id: d.type_id as number,
      typeCode,
      typeName: dt?.type_name || typeCode,
      status: d.status as string,
      upload_date: d.upload_date as string,
      form_data,
      name: deriveName(typeCode, form_data),
    }
  })
}
