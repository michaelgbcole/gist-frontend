import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


interface StudentInput {
  name: string;
  email: string;
}

interface CreateClassRequest {
  teacherId: string;
  name: string;
  description: string;
  students: StudentInput[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teacherId, name, description, students }: CreateClassRequest = req.body;

    if (!teacherId || !name || !students) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the class first
      const newClass = await tx.class.create({
        data: {
          name,
          teacherId,
          description,
          studentIds: [], // Will be updated after creating students
        },
      });

      // Create all students with the class ID
      const createdStudents = await Promise.all(
        students.map(student =>
          tx.student.create({
            data: {
              name: student.name,
              email: student.email,
              classId: newClass.id,
            }
          })
        )
      );

      // Update the class with the student IDs
      const updatedClass = await tx.class.update({
        where: { id: newClass.id },
        data: {
          studentIds: createdStudents.map(student => student.id),
          description: description
        },
      });

      return {
        class: updatedClass,
        students: createdStudents,
      };
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({ error: 'Failed to create class' });
  }
}
