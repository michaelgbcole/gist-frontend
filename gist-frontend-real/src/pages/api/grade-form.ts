
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import generateGrade from '@/util/quiz-grader';
import { DOMParser } from 'xmldom';


const prisma = new PrismaClient();


interface Payload {
  questionId: string;
  typedAnswer?: string;
  selectedAnswers?: number[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { payloads, user, uniqueLink } = req.body;
    const parser = new DOMParser();
    console.log('payloads:', payloads);
    console.log('user:', user.id);
    console.log('uniqueLink:', uniqueLink);

    try {
      const overallFeedback: string[] = [];
      const results = await Promise.all(payloads.map(async (payload: Payload) => {
        const { questionId, typedAnswer, selectedAnswers } = payload;

        // Fetch the question data
        const question = await prisma.question.findUnique({
          where: { id: Number(questionId) },
          select: {
            id: true,
            type: true,
            correctOptions: true,
            gist: true,
          },
        });

        if (!question) {
          return { questionId, isCorrect: false, error: 'Question not found' };
        }

        let isCorrect = false;

        if (question.type === 'SAQ' && typedAnswer !== undefined) {
          // For SAQ, compare the typed answer with the correct answer (assuming gist is the correct answer)
          const response = await generateGrade(question?.gist ?? '', typedAnswer);
          console.log(response)
          console.log(response.join(''))

          const parsed=parser.parseFromString(response.join(''), 'text/html');
          const letext = parsed.getElementsByTagName('output')[0].textContent
         isCorrect = !letext?.includes('incorrect')
         console.log('response', response)
         console.log('isCorrect', isCorrect)
         overallFeedback.push(parsed?.getElementsByTagName('thinking')[0].textContent ?? '')
        } else if (question.type === 'MultipleChoice' && selectedAnswers !== undefined) {
          // For MultipleChoice, compare the selected answers with the correct options
          isCorrect = JSON.stringify(question.correctOptions) === JSON.stringify(selectedAnswers);
        }

        return { questionId: question.id, isCorrect, answerData: question.type === 'SAQ' ? [typedAnswer] : selectedAnswers };
      }));

      // Calculate the overall score
      const correctAnswersCount = results.filter(result => result.isCorrect).length;
      const totalQuestions = results.length;
      const scorePercentage = (correctAnswersCount / totalQuestions) * 100;

      const formId = await prisma.form.findUnique({
        where: { uniqueLink },
        select: { id: true },
      });

      // Create a new submission entry with all the answers and the score
      await prisma.submission.create({
        data: {
          studentId: user.id,
          formId: formId?.id ?? 0, // Ensure you have the formId available in your context
          answers: results,
          score: scorePercentage, // Add the score to the submission
          overallFeedback: overallFeedback?.join('><')
        },
      });

      return res.status(200).json({ results, score: scorePercentage });
    } catch (error) {
      console.error('Error grading questions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}