import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Sempre use SERVICE_ROLE no backend (correto!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, email } = req.body;

    if (!priceId || !email) {
      return res.status(400).json({ error: "Missing priceId or email" });
    }

    // 🧩 Pega site URL validada
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl || !siteUrl.startsWith("http")) {
      return res.status(500).json({
        error: "Invalid NEXT_PUBLIC_SITE_URL. Must include https://",
      });
    }

    // 🔹 Verifica se já existe customer
    const { data: existing } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("email", email)
      .single();

    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
      });

      customerId = customer.id;

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("email", email);
    }

    // 🔹 Cria Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/planos?canceled=true`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Error creating checkout session", error);
    res.status(500).json({ error: error.message });
  }
}
