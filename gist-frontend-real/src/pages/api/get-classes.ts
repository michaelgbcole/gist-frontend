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

    // First, get all classes for this teacher
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherId
      }
    });

    // Then, for each class, get its students
    const classesWithStudents = await Promise.all(
      classes.map(async (classItem) => {
        const students = await prisma.student.findMany({
          where: {
            classId: classItem.id
          },
          select: {
            id: true,
            name: true,
            email: true,
          }
        });

        return {
          id: classItem.id,
          name: classItem.name,
          description: classItem.description,
          studentCount: students.length,
          students: students,
          overallFeedback: classItem.overallFeedback
        };
      })
    );

    return res.status(200).json({
      classes: classesWithStudents
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ error: 'Failed to fetch classes' });
  }
}
