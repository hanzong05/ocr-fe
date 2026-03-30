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

  // Fetch user by username only — never send password in query
  const { data: user, error } = await supabase
    .from('users')
    .select('user_id, username, password_hash, role')
    .eq('username', username)
    .single()

  console.log('[login] user found:', !!user, '| error:', error?.code, error?.message)

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  // PHP password_hash() produces $2y$ prefix; bcryptjs needs $2b$
  const hash = (user.password_hash as string).replace(/^\$2y\$/, '$2b$')
  console.log('[login] hash prefix:', hash.substring(0, 7))

  const valid = await bcrypt.compare(password, hash)
  console.log('[login] bcrypt valid:', valid)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  // Return user without the password hash
  return NextResponse.json({
    user: { id: user.user_id, username: user.username, role: user.role, name: user.username }
  })
}
