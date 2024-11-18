import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import synthesize from '@/util/synthesize-overall';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { batchId, overallFeedbacks } = req.body;

  if (!batchId) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const overallFeedback = await synthesize(overallFeedbacks as string)

    const updatedForm = await prisma.batch.update({
      where: { id: parseInt(batchId) },
      data: {
       overallFeedback: overallFeedback.join('')
      },
    });

    res.status(200).json({
      message: 'Form updated successfully',
      form: updatedForm,
      overallFeedback
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Error updating form' });
  } finally {
    await prisma.$disconnect();
  }
}