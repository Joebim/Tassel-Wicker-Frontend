import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[TEST-EMAIL] GET request received at:', new Date().toISOString());
  return NextResponse.json({ 
    success: true, 
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('[TEST-EMAIL] POST request received at:', new Date().toISOString());
  try {
    const body = await request.json();
    console.log('[TEST-EMAIL] Request body:', body);
    return NextResponse.json({ 
      success: true, 
      message: 'Test POST endpoint is working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[TEST-EMAIL] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


