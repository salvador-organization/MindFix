import { buffer } from "micro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // ⬅ obrigatório para usar raw body
  },
};

const LIFETIME_ACCESS_EMAIL = "salvador.programs@gmail.com";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  });
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    const buf = await buffer(req);
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);

    console.log("✅ Webhook recebido:", event.type);
  } catch (err) {
    console.error("❌ Erro ao validar webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, stripe);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, stripe);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, stripe);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, stripe);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, stripe);
        break;

      default:
        console.log("⚠️ Evento não tratado:", event.type);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Erro interno no webhook:", err);
    return res.status(500).send("Internal Server Error");
  }
}

// ====================================================
// =============== HANDLERS ORIGINAIS =================
// ===== Todos exatamente como estavam antes =========
// ====================================================

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.retrieve(
    session.customer as string
  );

  const email = (customer as any).email;

  console.log("📥 checkout.session.completed — email:", email);

  await supabase
    .from("users")
    .update({
      has_access: true,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  console.log("✅ Acesso concedido após checkout");
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  stripe: Stripe
) {
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.retrieve(
    invoice.customer as string
  );

  const email = (customer as any).email;

  console.log("💰 invoice.payment_succeeded — email:", email);

  await supabase
    .from("users")
    .update({
      has_access: true,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  console.log("✅ Acesso garantido após pagamento");
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  stripe: Stripe
) {
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.retrieve(
    invoice.customer as string
  );

  const email = (customer as any).email;

  console.log("❌ invoice.payment_failed — email:", email);

  await supabase
    .from("users")
    .update({
      has_access: false,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  console.log("🚫 Acesso removido após falha de pagamento");
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  stripe: Stripe
) {
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );

  const email = (customer as any).email;

  console.log("🔄 customer.subscription.updated — email:", email);

  const isActive =
    subscription.status === "active" ||
    subscription.status === "trialing";

  await supabase
    .from("users")
    .update({
      has_access: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  console.log(
    isActive ? "🔓 Acesso mantido" : "🔒 Acesso removido"
  );
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  stripe: Stripe
) {
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );

  const email = (customer as any).email;

  console.log("🗑 customer.subscription.deleted — email:", email);

  await supabase
    .from("users")
    .update({
      has_access: false,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  console.log("🔑 Acesso removido por cancelamento");
}
