import synthesize from '@/util/synthesize-overall';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();


export default async function handleFeedbackSynthesis(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Fetch all overallFeedback from essays
    const essays = await prisma.grade.findMany({
      where: {
        userId: req.body.userId // Assuming you're passing userId in the request
      },
        select: {
        feedback: true
      }
    });
    console.log('essays', essays)

    // 2. Extract feedback into array
    const feedbackArray = essays
      .map(essay => essay.feedback)
      .filter((feedback): feedback is string => feedback !== null);
      console.log('feedback', feedbackArray)

    // 3. Process feedback through synthesize function
    const synthesizedFeedback = await synthesize(feedbackArray.join('},{'));
    console.log('synth', synthesizedFeedback)


    // 4. Update userData table with synthesized feedback
    await prisma.userData?.update({
      where: {

        id: req.body.userId
      },
      data: {
        essayFeedback: synthesizedFeedback.join('')
      }
    });

    // 5. Send success response
    res.status(200).json({
      success: true,
      synthesizedFeedback
    });

  } catch (error) {
    console.error('Error in feedback synthesis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback synthesis'
    });
  } finally {
    await prisma.$disconnect();
  }
}