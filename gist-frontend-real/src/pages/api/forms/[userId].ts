import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const forms = await prisma.form.findMany({
            where: {
                creatorId: userId,
            },
            select: {
                id: true,
                title: true,
                uniqueLink: true,
            },
        });

        res.status(200).json(forms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ message: 'Error fetching forms' });
    } finally {
        await prisma.$disconnect();
    }
}