import { buffer } from 'micro';
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err}`);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      try {
        // Fetch the user associated with this Stripe customer
        const user = await prisma.userData.findFirst({
          where: { stripe_customer_id: customerId },
        });

        if (!user) {
          console.error('User not found for Stripe customer:', customerId);
          return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's isPayer status
        await prisma.userData.update({
          where: { id: user.id },
          data: { isPayer: true },
        });

        console.log(`Updated isPayer status for user ${user.id}`);
      } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Error updating user' });
      }
    }
    if (event.type === 'customer.deleted') {
        const customer = event.data.object as Stripe.Customer;
        try {
          // Find the user with this Stripe customer ID
          const user = await prisma.userData.findFirst({
            where: { stripe_customer_id: customer.id },
          });
      
          if (user) {
            // Update the user to remove the Stripe customer ID and set isPayer to false
            await prisma.userData.update({
              where: { id: user.id },
              data: { 
                stripe_customer_id: null,
                isPayer: false
              },
            });
            console.log(`Updated user ${user.id} after Stripe customer deletion`);
          }
        } catch (error) {
          console.error('Error handling customer.deleted event:', error);
        }
      }
      

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}