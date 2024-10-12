import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const rubrics = await prisma.rubric.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        rubricJSON: true,
      },
    });
    console.log('rubrics', rubrics)

    if (rubrics.length === 0) {
      return res.status(404).json({ message: 'No rubrics found for this user' });
    }
    console.log('Rubrics:', rubrics);
    res.status(200).json(rubrics);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    res.status(500).json({ message: 'Error fetching rubrics' });
  } finally {
    await prisma.$disconnect();
  }
}