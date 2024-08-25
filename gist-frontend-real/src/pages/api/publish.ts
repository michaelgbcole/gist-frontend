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
        if (q.type === 'SAQ') {
          const saq = await prisma.sAQ.create({
            data: {
              question: q.question || '',
              gist: q.gist || '',
            },
          });
          questionIds.push(saq.id);
        } else if (q.type === 'MultipleChoice') {
          const mc = await prisma.multipleChoice.create({
            data: {
              question: q.question || '',
              options: q.options || [],
              correctOptions: q.correctOptions || [],
            },
          });
          questionIds.push(mc.id);
        }
      }

      // Update the form with the question IDs
      await prisma.form.update({
        where: { id: form.id },
        data: { questionIds },
      });

      res.status(200).json({ message: 'Publish successful' });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Error publishing' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}