import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.body;

    try {
      // Fetch the form data
      const form = await prisma.form.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          questionIds: true,
        },
      });

      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }

      // Fetch questions based on question IDs
      const questions = await prisma.question.findMany({
        where: {
          id: {
            in: form.questionIds,
          },
        },
      });

      return res.status(200).json({ form, questions });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}