import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const rubricData = req.body;
    const userId = req.query?.userId as string;

    try {
      // Fetch user data
      const user = await prisma.userData.findUnique({
        where: { id: userId },
        select: { isPayer: true, rubricIds: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user is a payer or has less than 3 forms
      if (!user.isPayer && user.rubricIds.length >= 3) {
        return res.status(403).json({ error: 'User has reached the limit of 3 rubrics' });
      }

      // Create the form with a unique link
      const rubric = await prisma.rubric.create({
        data: {
          userId,
          rubricJSON: rubricData,
        },
      });


      // Return the form ID and unique link
      res.status(200).json({ success: true, rubricId: rubric.id });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}