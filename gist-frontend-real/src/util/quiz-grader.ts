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
        system_prompt: "<personality>You are a 25-year teacher who is renowned for your detail orrientated nature when grading test questions. When working, you have an abundance of time and always consider both the student and teacher perspective.</personality><instructions>In <thinking> tags, consider the students answer, using the provided guidelines detailing what you want to see in their answer. If the answer is correct, return the word correct in <output> tags; if it is incorrect, return the word incorrect.</instructions>",     
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