// src/pages/api/get-form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { uniqueLink } = req.query;

    try {
      // Fetch the form data using the unique link
      const form = await prisma.form.findUnique({
        where: { uniqueLink: uniqueLink as string },
        select: {
          id: true,
          title: true,
          questionIds: true,
          creatorId: true,
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