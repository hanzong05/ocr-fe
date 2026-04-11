// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
    const session = req.cookies.get('lcr_session')?.value

    if (!session) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error } = await supabase
        .from('users')
        .select('user_id, username, full_name, email, role, department, employee_id')
        .eq('user_id', session)
        .single()

    if (error || !user) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
        user: {
            id: user.user_id,
            username: user.username,
            name: user.full_name || user.username,
            email: user.email || '',
            role: user.role,
            department: user.department || '',
            employeeId: user.employee_id || '',
        }
    })
}