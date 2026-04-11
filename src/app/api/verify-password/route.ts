import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    const { username, password } = await req.json()

    if (!username || !password) {
        return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('username', username)
        .single()

    if (error || !user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const hash = (user.password_hash as string).replace(/^\$2y\$/, '$2b$')
    const valid = await bcrypt.compare(password, hash)

    if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
}