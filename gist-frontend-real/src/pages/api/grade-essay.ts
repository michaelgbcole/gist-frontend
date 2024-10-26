
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import gradeEssay from '@/util/essay-grader';

const prisma = new PrismaClient();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { pdfUrl, rubricId } = req.body;
    console.log(req.body)
    const rubric = await prisma.rubric.findFirst({
        where: {
            id: rubricId
        },
        select: {
            rubricJSON: true
        }
    })
    try {
      const results = await gradeEssay(pdfUrl, JSON.stringify(rubric?.rubricJSON));
      const cleanText = results?.replaceAll("\\n", '')?.replaceAll('&', 'and')?.replaceAll('\\', '');
      console.log('results:', results);
        return res.status(200).json({ results: cleanText });
    } catch (error) {
      console.error('Error grading questions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}