import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { selectedFiles, exampleFiles, exampleGrades, rubricId, batchName, userId } = req.body;
    const fileUrls = selectedFiles.map((file: any) => file.url);
    console.log('fileUrls:', fileUrls);
    try {
        const batch = await prisma.batch.create({
            data: {            
            userId: userId,
            name: batchName,
            rubricId: rubricId,
            fileUrls
            },
          });
        console.log('batch:', batch);
        

          const gradeEssayRequest = async (fileUrl: string, exampleFiles: any, exampleGrades: any) => {
            const response = await fetch(`${process.env.HOSTED_URL}/api/grade-essay`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ pdfUrl: fileUrl, rubricId, userId, batchId: batch.id, exampleFiles, exampleGrades }),
            });
    
            if (!response.ok) {
              throw new Error(`Failed to grade essay for file: ${fileUrl}`);
            }
    
            const result = await response.json();
            return result;
          };
    
          // Send concurrent requests to grade-essay
          const gradingResults = await Promise.all(
            fileUrls.map((fileUrl: string) => gradeEssayRequest(fileUrl, exampleFiles, exampleGrades))
          );
    
          // Return the batch ID and grading results
          res.status(200).json({ success: true, batchId: batch.id, gradingResults });
    } catch (error) {
      console.error('Error starting batch:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
