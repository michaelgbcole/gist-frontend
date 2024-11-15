import Replicate from "replicate";
const replicate = new Replicate();

async function checkPredictionStatus(prediction_id: string): Promise<any> {
    while (true) {
        const prediction_status = await replicate.predictions.get(prediction_id);
        if (prediction_status.status === "succeeded") {
            return prediction_status.output;
        } else if (prediction_status.status === "failed") {
            throw new Error("Prediction failed");
        }
        // Wait for a short period before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}


//!! TO WRITE STILL XDDDDDDDD
export default async function synthesize(overallFeedback: String): Promise<string[]> {
    const input = {
        top_p: 0.9,
        prompt: `This is what the answer to the question should cover, according to the teacher:. The student's answer is: .`,
        system_prompt: "You are an experienced teacher, and your job is to synthesize ",     
        min_tokens: 0,
        temperature: 0.6,
        presence_penalty: 1.15
    };

    const prediction = await replicate.predictions.create({
        model: "meta/meta-llama-3.1-405b-instruct",
        input
    });

    return await checkPredictionStatus(prediction.id);
}