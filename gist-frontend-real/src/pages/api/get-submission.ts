import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    try {
      const submission = await prisma.submission.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      // Transform the data to match the frontend structure
      const transformedSubmission = {
        id: submission.id,
        studentId: submission.studentId,
        formId: submission.formId,
        answers: submission.answers as {
          questionId: number;
          isCorrect: boolean;
          answerData: string[] | number[];
        }[],
        score: submission.score,
        createdAt: submission.createdAt.toISOString(),
      };

      res.status(200).json({ submission: transformedSubmission });
    } catch (error) {
      console.error('Error fetching submission data:', error);
      res.status(500).json({ error: 'Error fetching submission data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}