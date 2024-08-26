import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, questionList } = req.body;

    try {
      // Create the form
      const form = await prisma.form.create({
        data: {
          title,
          questionIds: [],
        },
      });

      // Create questions and update form with question IDs
      const questionIds = [];
      for (const q of questionList) {
        const questionData = {
          type: q.type,
          question: q.question || '',
          gist: q.gist || '',
          options: q.options || [],
          correctOptions: q.correctOptions || [],
        };

        const question = await prisma.question.create({
          data: questionData,
        });

        questionIds.push(question.id);
      }

      // Update form with question IDs
      await prisma.form.update({
        where: { id: form.id },
        data: { questionIds },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}