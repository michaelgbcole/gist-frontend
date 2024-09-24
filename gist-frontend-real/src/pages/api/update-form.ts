import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { formId, title, questionList, userId } = req.body;

  if (!formId || !title || !Array.isArray(questionList) || !userId) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const updatedForm = await prisma.form.update({
      where: { id: parseInt(formId) },
      data: {
        title,
        questionIds: questionList.map(q => q.id),
      },
    });

    const updatedQuestions = await Promise.all(
      questionList.map(async (q) => {
        return prisma.question.upsert({
          where: { id: q.id },
          update: {
            type: q.type,
            question: q.question,
            gist: q.gist,
            options: q.options,
            correctOptions: q.correctOptions,
          },
          create: {
            type: q.type,
            question: q.question,
            gist: q.gist,
            options: q.options,
            correctOptions: q.correctOptions,
          },
        });
      })
    );

    res.status(200).json({
      message: 'Form updated successfully',
      form: updatedForm,
      questions: updatedQuestions,
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Error updating form' });
  } finally {
    await prisma.$disconnect();
  }
}