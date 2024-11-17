import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }


  const { userId } = req.body;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const data = await prisma.userData.findFirst({
      where: {
        id: userId,
      },
      select: {
        essayFeedback: true,
      },
    });



    console.log('feedback:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    res.status(500).json({ message: 'Error fetching rubrics' });
  } finally {
    await prisma.$disconnect();
  }
}