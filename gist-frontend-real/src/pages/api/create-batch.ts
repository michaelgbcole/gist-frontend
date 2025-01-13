import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, name } = req.body;
    console.log("attempting to create a batch!!")

    const batch = await prisma.batch.create({
      data: {
        userId,
        name,
        rubricId: 0, // This will be updated later
        fileUrls: []
      }
    });

    return res.status(200).json({ batchId: batch.id });
  } catch (error) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ error: 'Failed to create batch' });
  }
}
