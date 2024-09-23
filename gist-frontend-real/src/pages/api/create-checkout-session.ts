import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { user_id } = req.body;

      // Fetch the user from your database
      const user = await prisma.userData.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let customerId = user.stripe_customer_id;

      // If the user doesn't have a Stripe customer ID, create one
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            prisma_id: user.id,
          },
        });
        customerId = customer.id;

        // Update the user with the new Stripe customer ID
        await prisma.userData.update({
          where: { id: user.id },
          data: { stripe_customer_id: customerId },
        });
      }

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_1Q09KuA17edeLBywjWaaQ6w6', // Replace with your actual price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/dashboard`,
      });

      res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.error('Error in create-checkout-session:', err);
      res.status(500).json({ statusCode: 500, message: err });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}