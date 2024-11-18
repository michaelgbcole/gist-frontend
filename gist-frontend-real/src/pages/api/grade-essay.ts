
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import gradeEssay from '@/util/essay-grader';
import { DOMParser } from 'xmldom';

const prisma = new PrismaClient();



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const parser = new DOMParser();
    const { pdfUrl, rubricId, userId, batchId } = req.body;
    console.log('pdf-url:', pdfUrl);
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
      const parsedResult = parser.parseFromString(cleanText, 'text/xml');
      const fileName = pdfUrl.split('/').pop()?.split('.pdf')[0];
      console.log('fileName:', fileName);
      console.log('results:', results);
      
      try {
        const grade = await prisma.grade.create({
            data: {
                userId: userId,
                rubricId: rubricId,
                score: parsedResult?.getElementsByTagName('finalScore')[0].textContent ?? '',
                fileName: fileName,
                feedback: parsedResult?.getElementsByTagName('overallFeedback')[0].textContent ?? '',
                batchId: batchId,
                rubricData: parsedResult?.getElementsByTagName('criteriaFeedback')[0].textContent ?? '',
                overall_feedback: parsedResult?.getElementsByTagName('overallFeedback')[0].textContent ?? ''
            }
        })
        
        const response = await fetch(`${process.env.HOSTED_URL}/api/update/essay-feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            batchId: batchId,
          }),
        })
        if (response.ok) {
          console.log('Essay feedback updated successfully');
        } else {
          console.error('Failed to update essay feedback');
        }
        const response2 = await fetch(`${process.env.HOSTED_URL}/api/update/class-feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,          }),
        })
        if (response2.ok) {
          console.log('Class feedback updated successfully');
        } else {
          console.error('Failed to update class feedback');
        }
        console.log('grade:', grade);
        return grade;
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
        return res.status(200).json({ results: cleanText, parsedResult });
    } catch (error) {
      console.error('Error grading questions:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}