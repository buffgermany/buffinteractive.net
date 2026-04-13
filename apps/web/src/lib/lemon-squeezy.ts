// ============================================================
// Lemon Squeezy Checkout Utility (Server-Side Only)
//
// Generates a checkout URL for a customer to purchase a
// digital_goods product (SaaS or self-hosted software).
// The userId is passed as custom_data and read back in the webhook.
// ============================================================

const LS_API_KEY = process.env["LEMON_SQUEEZY_API_KEY"];
const LS_STORE_ID = process.env["LEMON_SQUEEZY_STORE_ID"];

if (!LS_API_KEY || !LS_STORE_ID) {
  throw new Error("[web] LEMON_SQUEEZY_API_KEY and LEMON_SQUEEZY_STORE_ID must be set.");
}

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

interface LsCheckoutResponse {
  data: {
    attributes: {
      url: string;
    };
  };
}

/**
 * Creates a Lemon Squeezy checkout session and returns the URL.
 *
 * @param variantId  - LS variant ID from the product record
 * @param userId     - Platform user ID (passed as custom_data for webhook)
 * @param userEmail  - Pre-fill the checkout form
 * @param successUrl - Redirect after successful purchase
 */
export async function createLsCheckoutUrl(params: {
  variantId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
}): Promise<string> {
  const response = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LS_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: params.userEmail,
            custom: {
              user_id: params.userId,
            },
          },
          checkout_options: {
            button_color: "#7c3aed",
          },
          product_options: {
            redirect_url: params.successUrl,
            receipt_link_url: params.successUrl,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: LS_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: params.variantId },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lemon Squeezy API error: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as LsCheckoutResponse;
  return json.data.attributes.url;
}
