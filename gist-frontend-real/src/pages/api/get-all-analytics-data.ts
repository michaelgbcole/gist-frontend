import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RubricCriteria {
  feedback: string;
  score: string;
}

interface RubricData {
  [criteria: string]: RubricCriteria;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teacherId } = req.body;

    // Get all grades for this teacher, including essential data
    const grades = await prisma.grade.findMany({
      where: {
        userId: teacherId
      },
      select: {
        id: true,
        studentId: true,
        rubricData: true,
        createdAt: true,
        score: true,
        rubricId: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get class info for student grouping
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherId
      },
      select: {
        id: true,
        name: true,
        studentIds: true
      }
    });

    // Transform the data for the chart
    const studentData = classes.map(classItem => {
      const classGrades = grades.filter(grade => 
        classItem.studentIds.includes(grade.studentId)
      );

      return {
        id: classItem.id.toString(),
        name: classItem.name,
        class: classItem.name,
        assignmentData: classGrades.map(grade => {
          let rubricData: { [key: string]: number } = {};
          
          try {
            const parsed = JSON.parse(grade.rubricData) as RubricData;
            
            // Convert each criterion's score to decimal
            Object.entries(parsed).forEach(([criteria, data]) => {
              const [score, total] = data.score.split('/').map(Number);
              rubricData[criteria] = score / total;
            });
          } catch (e) {
            console.error('Error parsing rubric data for grade:', grade.id);
            rubricData = { error: 0 };
          }
          const studentName = prisma.student.findFirst({
            where: {
              id: grade.studentId
            },
            select: {
              name: true
            }
          })
          return {
            assignmentId: grade.id.toString(),
            studentId: grade.studentId,
            classId: classItem.id,
            studentName: studentName,
            grade: grade.score,
            rubricId: grade.rubricId.toString(),
            date: grade.createdAt.toISOString(),
            rubricData
          };
        })
      };
    }).filter(classData => classData.assignmentData.length > 0);

    console.log(`Processed ${grades.length} grades across ${classes.length} classes`);
    return res.status(200).json({ studentData });

  } catch (error) {
    console.error('Error in get-all-analytics-data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
