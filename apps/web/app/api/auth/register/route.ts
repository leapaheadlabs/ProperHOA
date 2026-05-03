import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "Registration is not implemented. Use OAuth sign-in." },
    { status: 501 }
  );
}
