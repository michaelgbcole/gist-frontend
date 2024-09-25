import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Question } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, questionList, creatorId } = req.body;
    const uniqueLink = uuidv4(); // Generate a unique identifier

    try {
      // Create the form with a unique link
      const form = await prisma.form.create({
        data: {
          title,
          uniqueLink,
          questionIds: [],
          creatorId: creatorId || null,
        },
      });

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

      // Update form with question IDs
      await prisma.form.update({
        where: { id: form.id },
        data: { questionIds },
      });

      // Add form ID to the user's formIds array
      await prisma.userData.update({
        where: { id: creatorId },
        data: {
          formIds: {
            push: form.id,
          },
        },
      });

      // Return the form ID and unique link
      res.status(200).json({ success: true, formId: form.id, uniqueLink });
    } catch (error) {
      console.error('Error publishing:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}