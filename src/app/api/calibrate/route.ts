import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TEMPLATE_PY = path.join(process.cwd(), '..', 'python', 'template_matcher.py')

// Parse `'fieldname': (x1, y1, x2, y2, _HINT),` lines inside a form block
function parsePy(): Record<string, Record<string, number[]>> {
  let src: string
  try { src = fs.readFileSync(TEMPLATE_PY, 'utf-8') } catch { return {} }

  const result: Record<string, Record<string, number[]>> = {}
  // Find each form block: '102': { ... },
  const formRe = /'(\d+)'\s*:\s*\{([^}]+)\}/gs
  let fm: RegExpExecArray | null
  while ((fm = formRe.exec(src)) !== null) {
    const formId = fm[1]
    const block  = fm[2]
    result[formId] = {}
    const fieldRe = /'([^']+)':\s*\(([^)]+)\)/g
    let fd: RegExpExecArray | null
    while ((fd = fieldRe.exec(block)) !== null) {
      const nums = fd[2].split(',').map(s => s.trim())
      const hint = nums[4] || '_LINE'
      result[formId][fd[1]] = [
        parseFloat(nums[0]), parseFloat(nums[1]),
        parseFloat(nums[2]), parseFloat(nums[3]),
        hint as unknown as number,
      ]
    }
  }
  return result
}

export async function GET() {
  const data = parsePy()
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Could not read template_matcher.py' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { form, coords } = await req.json() as {
    form: string
    coords: Record<string, [number, number, number, number, string]>
  }

  let src: string
  try { src = fs.readFileSync(TEMPLATE_PY, 'utf-8') } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  // Replace each field line inside the form's block
  for (const [field, val] of Object.entries(coords)) {
    const [x1, y1, x2, y2, hint] = val
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`('${escaped}':\\s*\\()([^)]+)(\\))`)
    const newVals = `${x1.toFixed(3)}, ${y1.toFixed(3)}, ${x2.toFixed(3)}, ${y2.toFixed(3)}, ${hint}`
    src = src.replace(re, `$1${newVals}$3`)
  }

  try {
    fs.writeFileSync(TEMPLATE_PY, src, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
