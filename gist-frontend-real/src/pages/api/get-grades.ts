import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    try {
      const grades = await prisma.grade.findMany({
        where: { batchId },
        select: {
          id: true,
          score: true,
          feedback: true,
          fileName: true,
        },
      });

      if (!grades) {
        return res.status(404).json({ error: 'Grades not found' });
      }

      return res.status(200).json({ grades });
    } catch (error) {
      console.error('Error fetching grades:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}