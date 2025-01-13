import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      selectedFiles, 
      exampleFiles, 
      exampleGrades, 
      rubricId, 
      batchId, 
      userId,
      classId,
      fileAssignments 
    } = req.body;

    console.log('Selected files:', selectedFiles);
    console.log('file assignments:', fileAssignments);
    // Create a map of studentId -> fileUrl
    const studentFileMap: Record<string, string> = {};
    selectedFiles.forEach((file: any) => {
      const studentId = fileAssignments[file.name];
      if (studentId) {
        studentFileMap[studentId] = file.url;
      }
    });

    console.log('Student file map:', studentFileMap);

    const batch = await prisma.batch.update({
      where: {
        id: Number(batchId)
      },
      data: {
        rubricId: Number(rubricId),
        status: 'processing',
        fileUrls: selectedFiles.map((file: any) => file.url || '')
      }
    });

    // Process each student's file
    const gradingPromises = Object.entries(studentFileMap).map(([studentId, fileUrl]) => {
      return fetch(`${process.env.HOSTED_URL}/api/grade-essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: fileUrl,
          rubricId: Number(rubricId),
          userId, // teacher's ID
          studentId, // student's ID
          batchId: Number(batchId),
          exampleFiles,
          exampleGrades
        }),
      });
    });

    const gradingResults = await Promise.all(gradingPromises);
    const gradingResponses = await Promise.all(
      gradingResults.map(result => result.json())
    );

    return res.status(200).json({ 
      success: true, 
      batchId: batch.id,
      studentFileMap,
      gradingResults: gradingResponses
    });

  } catch (error) {
    console.error('Error in start-batch:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
