// src/pages/api/grade-form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import generateGrade from '@/util/ai';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { questionId, typedAnswer, selectedAnswers } = req.body;

    try {
      // Fetch the question data
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          type: true,
          correctOptions: true,
          gist: true,
        },
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      let isCorrect = false;

      if (question.type === 'SAQ' && typedAnswer !== undefined) {
        // For SAQ, compare the typed answer with the correct answer (assuming gist is the correct answer)
        console.log(typedAnswer);
        const response = await generateGrade(question?.gist ?? '', typedAnswer);
        isCorrect = !response?.includes('Incorrect');
      } else if (question.type === 'MultipleChoice' && selectedAnswers !== undefined) {
        // For MultipleChoice, compare the selected answers with the correct options
        isCorrect = JSON.stringify(question.correctOptions) === JSON.stringify(selectedAnswers);
      }

      return res.status(200).json({ questionId: question.id, isCorrect });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}