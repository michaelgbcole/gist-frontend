import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import gradeEssay from '@/util/essay-grader';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await prisma.userData.findUnique({
        where: { id: String(id) },
        select: { id: true, email: true, name: true, isPayer: true },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  } else {
    console.log('nothing')
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}