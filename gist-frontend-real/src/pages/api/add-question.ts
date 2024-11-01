// src/pages/api/publish.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST' && req.body.question) {
    const question   = req.body;
    console.log('questionfkdjs', question);

    try {
      // Create the form with a unique link
      
      // Create questions and collect their IDs
        const response = await prisma.question.create({
          data: {
            type: question.type,
            question: question.question || '',
            gist: question.gist || null,
            options: question.options || [],
            correctOptions: question.correctOptions || [],
          },
        });

      
      res.status(200).json({ success: true, response });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}