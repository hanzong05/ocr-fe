// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const session = req.cookies.get('lcr_session')
    const isLoginPage = req.nextUrl.pathname === '/login'

    if (!session && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session && isLoginPage) {
        return NextResponse.redirect(new URL('/services', req.url))
    }
}

export const config = {
    matcher: ['/services/:path*', '/login'],
}
