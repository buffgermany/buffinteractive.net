import Stripe from "stripe";

// ============================================================
// Stripe Client (Server-Side Only)
// Used for creating B2B invoices for Human Service products.
// ============================================================

if (!process.env["STRIPE_SECRET_KEY"]) {
  throw new Error("[web] STRIPE_SECRET_KEY is not set.");
}

export const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"], {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/**
 * Creates a Stripe invoice and returns the hosted payment URL.
 * Called from a Server Action when a user checks out a Human Service product.
 */
export async function createHumanServiceInvoice(params: {
  customerEmail: string;
  customerName: string;
  productName: string;
  amountCents: number;
  currency: string;
  userId: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; invoiceId: string }> {
  // 1. Create or retrieve a Stripe customer
  const customers = await stripe.customers.list({ email: params.customerEmail, limit: 1 });
  const customer =
    customers.data[0] ??
    (await stripe.customers.create({
      email: params.customerEmail,
      name: params.customerName,
      metadata: { userId: params.userId },
    }));

  // 2. Create the invoice
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    auto_advance: false, // We'll finalize manually
    collection_method: "send_invoice",
    days_until_due: 7,
    metadata: {
      userId: params.userId,
      productId: params.productId,
    },
  });

  // 3. Add line item
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: params.amountCents,
    currency: params.currency.toLowerCase(),
    description: params.productName,
  });

  // 4. Finalize to get the hosted URL
  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

  if (!finalized.hosted_invoice_url) {
    throw new Error("Stripe did not return a hosted_invoice_url");
  }

  return {
    url: finalized.hosted_invoice_url,
    invoiceId: finalized.id,
  };
}
