import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EditClassRequest {
  classId: number;
  userId: string;
  studentsToRemove?: string[];
  studentsToAdd?: { name: string; email: string; }[];
  action: 'remove_students' | 'delete_class' | 'add_students';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { classId, userId, studentsToRemove, studentsToAdd, action }: EditClassRequest = req.body;

    // Verify the class belongs to the teacher
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: userId,
      },
    });

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    if (action === 'delete_class') {
      // Delete all students first, then the class
      await prisma.$transaction(async (tx) => {
        await tx.student.deleteMany({
          where: {
            classId: classId
          }
        });

        await tx.class.delete({
          where: {
            id: classId
          }
        });
      });

      return res.status(200).json({ message: 'Class deleted successfully' });
    }

    if (action === 'add_students') {
      const newStudents = await prisma.$transaction(async (tx) => {
        const createdStudents = await Promise.all(
          studentsToAdd!.map(student =>
            tx.student.create({
              data: {
                name: student.name,
                email: student.email,
                classId: classId,
              }
            })
          )
        );

        // Update the class's studentIds array
        await tx.class.update({
          where: { id: classId },
          data: {
            studentIds: {
              push: createdStudents.map(s => s.id)
            }
          }
        });

        return createdStudents;
      });

      return res.status(200).json({ students: newStudents });
    }

    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Remove students from the Students table
      await tx.student.deleteMany({
        where: {
          id: {
            in: studentsToRemove
          },
          classId: classId
        }
      });

      // Update the class's studentIds array
      const updatedStudentIds = existingClass.studentIds.filter(
        id => !(studentsToRemove ?? []).includes(id)
      );

      await tx.class.update({
        where: { id: classId },
        data: {
          studentIds: updatedStudentIds
        }
      });
    });

    // Fetch the updated class data to return

    // Fetch remaining students
    const remainingStudents = await prisma.student.findMany({
      where: {
        classId: classId
      }
    });

    return res.status(200).json({
      students: remainingStudents
    });

  } catch (error) {
    console.error('Error editing class:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
