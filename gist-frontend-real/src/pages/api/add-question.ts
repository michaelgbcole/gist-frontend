// src/pages/api/publish.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {  questionList   } = req.body;

    try {
      // Create the form with a unique link

      // Create questions and collect their IDs
      const questionIds = await Promise.all(questionList.map(async (q: Question) => {
        const question = await prisma.question.create({
          data: {
            type: q.type,
            question: q.question || '',
            gist: q.gist || null,
            options: q.options || [],
            correctOptions: q.correctOptions || [],
          },
        });
        return question.id;
      }));

      // Return the form ID and unique link
      res.status(200).json({ success: true  });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}