import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken }
      });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.delete('next-auth.session-token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true });
  }
}
