// /app/api/test/route.ts

import { NextRequest, NextResponse } from "next/server";

// CRITICAL: Must be named GET
export async function GET(req: NextRequest) {
    // Best practice: Always return a NextResponse object
    return NextResponse.json({ 
        message: "Test API is working!",
        timestamp: new Date().toISOString()
    }, { status: 200 });
}