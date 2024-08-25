import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, questionList } = req.body;

    try {
      for (const q of questionList) {
        if (q.type === 'SAQ') {
          await prisma.sAQ.create({
            data: {
              question: q.question || '',
              gist: q.gist || '',
            },
          });
        } else if (q.type === 'MultipleChoice') {
          await prisma.multipleChoice.create({
            data: {
              question: q.question || '',
              options: q.options || [],
              correctOptions: q.correctOptions || [],
            },
          });
        }
      }
      res.status(200).json({ message: 'Publish successful' });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Error publishing' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}