import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }

    // Get all classes and their associated students
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherId
      }
    });

    // Get all students referenced in the classes
    const allStudentIds = classes.flatMap(c => c.studentIds);
    
    // Get all students' data in one query
    const students = await prisma.student.findMany({
      where: {
        id: {
          in: allStudentIds
        }
      }
    });

    // Get all grades for these students in one query
    const grades = await prisma.grade.findMany({
      where: {
        userId: {
          in: allStudentIds
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform the data into the required format
    const studentData = students.map(student => {
      const studentGrades = grades.filter(g => g.userId === student.id);
      const studentClass = classes.find(c => c.studentIds.includes(student.id));

      return {
        id: student.id,
        name: student.name,
        class: studentClass?.name || 'Unknown Class',
        assignmentData: studentGrades.map(grade => ({
          assignmentId: grade.id.toString(),
          grade: parseFloat(grade.score),
          rubricId: grade.rubricId.toString(),
          date: grade.createdAt.toISOString(),
          rubricData: JSON.parse(grade.rubricData)
        }))
      };
    }).filter(student => student.assignmentData.length > 0);

    return res.status(200).json({ studentData });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}
