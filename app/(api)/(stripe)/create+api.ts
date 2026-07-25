import dotenv from "dotenv";
import { Stripe } from "stripe";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, amount } = body;

  const safeName = String(name || "Guest");
  const safeEmail = String(email || "guest@example.com");
  const amountValue = Number(amount);

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  let customer;
  const doesCustomerExist = await stripe.customers.list({
    email: safeEmail,
  });

  if (doesCustomerExist.data.length > 0) {
    customer = doesCustomerExist.data[0];
  } else {
    const newCustomer = await stripe.customers.create({
      name: safeName,
      email: safeEmail,
    });

    customer = newCustomer;
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-06-20" },
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountValue * 100),
    currency: "usd",
    customer: customer.id,
    payment_method_types: ["card"],
    confirm: false,
    description: `Ride booking for ${safeName}`,
    receipt_email: safeEmail,
    metadata: {
      name: safeName,
      email: safeEmail,
    },
  });

  return new Response(
    JSON.stringify({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
      },
      ephemeralKey: ephemeralKey,
      customer: customer.id,
    }),
  );
}
