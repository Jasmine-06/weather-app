import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    
    await deleteAuthCookie();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
