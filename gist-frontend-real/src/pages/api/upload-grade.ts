import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, rubricId, feedback, score, fileName, rubricData } = req.body;

  if (!userId || !score || !fileName || !rubricData || !feedback) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    console.log
    const uploadedGrade = await prisma.grade.create({
        data: {
            userId: userId as string,
            rubricId: rubricId as number,
            score: score as string,
            fileName: fileName as string,
            feedback: feedback as string,
            rubricData: rubricData,
        },
    });

    res.status(200).json({
      message: 'Form updated successfully',
      rubric: uploadedGrade,
    });
  } catch (error) {
    console.error('Error uploading grade:', error);
    res.status(500).json({ message: 'Error updating form' });
  } finally {
    await prisma.$disconnect();
  }
}