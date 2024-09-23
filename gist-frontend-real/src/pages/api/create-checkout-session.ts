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

      // If the user has a Stripe customer ID, verify it exists in Stripe
      if (customerId) {
        try {
          await stripe.customers.retrieve(customerId);
        } catch (error) {
          if (error instanceof Stripe.errors.StripeError) {
            if (error.code === 'resource_missing') {
              // Customer doesn't exist in Stripe, so we'll create a new one
              customerId = null;
            } else {
              // For other Stripe errors, we'll throw and let the catch block handle it
              throw error;
            }
          } else {
            // If it's not a Stripe error, re-throw it
            throw error;
          }
        }
      }

      // If the user doesn't have a valid Stripe customer ID, create one
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
    } catch (error) {
      console.error('Error in create-checkout-session:', error);
      if (error instanceof Stripe.errors.StripeError) {
        res.status(error.statusCode || 500).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}