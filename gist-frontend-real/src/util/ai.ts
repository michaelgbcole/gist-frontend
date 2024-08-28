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

export default async function generateGrade(gist: string, answer: string): Promise<string[]> {
    const input = {
        top_p: 0.9,
        prompt: `This is what the answer to the question should cover, according to the teacher: ${gist}. The student's answer is: ${answer}.`,
        system_prompt: "You are a robot that decides if a student's answer to a short answer question is correct enough based off of the teacher's explanation of what the answer should be. Please respond with one word, either incorrect, or correct.",
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