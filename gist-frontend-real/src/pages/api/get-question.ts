// src/pages/api/get-form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.body;

    try {
      // Fetch the form data
      const question = await prisma.question.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          question: true,
          gist: true,
          options: true,
          correctOptions: true,
        },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Fetch questions based on question IDs

      return res.status(200).json({ question });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}