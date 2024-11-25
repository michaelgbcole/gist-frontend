// src/pages/api/get-form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    const { userId } = req.body;
    try {
      // Fetch the form data using the unique link
      const batches = await prisma.batch.findMany({
        where: { userId: userId as string },
        select: {
          id: true,
          name: true,
          rubricId: true,
          fileUrls: true,
          status: true,
          overallFeedback: true,
        },
      });

      console.log('batcheqs', batches)


      if (!batches) {
        return res.status(404).json({ error: 'Form not found' });
      }

      return res.status(200).json({ batches });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}