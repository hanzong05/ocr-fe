import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: user, error } = await supabase
    .from('users')
    .select('user_id, username, password_hash, full_name, email, role, department, employee_id')
    .eq('username', username)
    .single()

  console.log('[login] user found:', !!user, '| error:', error?.code, error?.message)

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  // PHP password_hash() produces $2y$ prefix; bcryptjs needs $2b$
  const hash = (user.password_hash as string).replace(/^\$2y\$/, '$2b$')
  const valid = await bcrypt.compare(password, hash)

  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      user_id: user.user_id,
      id: user.user_id,
      username: user.username,
      full_name: user.full_name || '',
      name: user.full_name || user.username,   // Header dropdown fallback
      email: user.email || '',
      role: user.role,
      department: user.department || null,
      employee_id: user.employee_id || null,
    }
  })
}
