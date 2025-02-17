import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { formId } = req.query;

  if (!formId || typeof formId !== 'string') {
    return res.status(400).json({ message: 'Invalid form ID' });
  }

  try {
    console.log('formId', formId)
    const submissions = await prisma.submission.findMany({
      where: { formId: parseInt(formId) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        studentId: true,
        score: true,
        createdAt: true,
      },
    });

    const averageScore = submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length;
    console.log(submissions)
    if(submissions.length >= 0){
    res.status(200).json({
      submissions,
      averageScore,
    });
  } else {
    res.status(404).json({ message: 'Submissions not found' });
  }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  } finally {
    await prisma.$disconnect();
  }
}