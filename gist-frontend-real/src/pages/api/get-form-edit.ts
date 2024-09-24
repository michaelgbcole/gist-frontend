import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { formId } = req.query;

  if (!formId || typeof formId !== 'string') {
    return res.status(400).json({ message: 'Invalid form ID' });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: form.questionIds } },
    });

    res.status(200).json({
      id: form.id,
      title: form.title,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        gist: q.gist,
        options: q.options,
        correctOptions: q.correctOptions,
      })),
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Error fetching form' });
  } finally {
    await prisma.$disconnect();
  }
}