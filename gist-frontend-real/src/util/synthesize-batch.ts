
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


export default async function synthesize(overallFeedback: String): Promise<string[]> {
    const input = {
        top_p: 0.9,
        prompt: `Here is the array: ${overallFeedback}`,
        system_prompt: `<instructions>You are an experienced teacher, and your job is to take in an array of the feedback from many essays and return the five most important issues, rated out of 10, with 0 being needs the most improvement.  YOUR RESPONSE SHOULD ONLY INCLUDE THIS FORMATTING, DO NOT WRITE ANYTHING ELSE, ONLY THE FOLLOWING FORMAT, AND MAKE SURE TO NOT INCLUDE ANY NEWLINES OR BACKSLASHES (\) (if your response includes any other data, you will be fired): [{"label": "Grammar", "feedback": "Students repeatedly demonstrate..." "score": "3/10"}, {|repeat for each issue|}]  <instructions> `,     
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