import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Implement login logic
    return NextResponse.json({ 
      success: true, 
      user: { id: '1', email: body.email } 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 401 }
    );
  }
}

