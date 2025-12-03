import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Destructure and Prepare Inputs
    const { token, amount, currency, buyerEmail, buyerName } = await req.json();

    // Environment Variables (MUST be set in .env.local)
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "LDZQR5JJZ7XAB";
    const accessToken = process.env.SQUARE_ACCESS_TOKEN || "EAAAl7XqO-GGWVeHNFvS-4Q3-DMlY-1LJBl6Kle3A270wfn60RR-CS2d1LCpAku5"; // CRITICAL: Must be the SANDBOX token

     console.log("location id",locationId)
     console.log("access id",accessToken)


    // 2. Validation
    if (!token || !amount || !currency) {
      return NextResponse.json({ message: "Missing payment details (token, amount, or currency)" }, { status: 400 });
    }
    if (!locationId || !accessToken) {
      return NextResponse.json({ message: "Square configuration missing (Location ID or Access Token)" }, { status: 501 });
    }

    // 3. Construct Square API Body
    const body = {
      idempotency_key: randomUUID(), // Unique key for every request
      amount_money: {
        // Amount is correctly assumed to be an integer in cents
        amount: Number(amount), 
        currency: String(currency),
      },
      source_id: token,
      location_id: locationId,
      autocomplete: true,
      note: `Checkout for ${buyerName || "Customer"}`,
      buyer_email_address: buyerEmail || undefined,
    };

    console.log(`Attempting payment in Sandbox for amount: ${amount} ${currency}...`);

    // 4. Send Request to Square Sandbox
    const resp = await fetch("https://connect.squareupsandbox.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-08-21", // Best to specify a recent stable version
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    // 5. Handle Response (Success or Error)
    if (!resp.ok) {
      // Log the full error for server-side debugging
      console.error("Square Payment Error:", JSON.stringify(data, null, 2));

      // Extract the most helpful error message for the client
      const errorMessage = data?.errors?.[0]?.detail || data?.errors?.[0]?.code || "An unknown payment processing error occurred.";
      
      return NextResponse.json({ message: "Payment failed", details: errorMessage, squareError: data.errors }, { status: 500 });
    }

    // Success
    const payment = data.payment;
    console.log("Payment successful:", payment);

    return NextResponse.json({
      ok: true,
      orderId: payment.id,
      message: "Payment processed successfully",
    });

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ message: err.message || "An unexpected server error occurred." }, { status: 500 });
  }
}