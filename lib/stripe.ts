
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    tokensPerMonth: 1000,
    workflowsLimit: 3,
    executionsPerMonth: 100,
  },
  pro: {
    name: 'Pro',
    price: 2999, // $29.99 in cents
    tokensPerMonth: 10000,
    workflowsLimit: 50,
    executionsPerMonth: 10000,
  },
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: 'pro'
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: PRICING_PLANS[plan].name,
            description: `${PRICING_PLANS[plan].tokensPerMonth.toLocaleString()} tokens, ${PRICING_PLANS[plan].workflowsLimit} workflows`,
          },
          unit_amount: PRICING_PLANS[plan].price,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      userId,
      plan,
    },
  })

  return session
}
